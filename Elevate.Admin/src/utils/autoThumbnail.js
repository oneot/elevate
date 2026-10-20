/**
 * 게시할 때 공개 블로그 카드용 썸네일을 브라우저 Canvas로 만든다.
 *
 * 공개 사이트의 기존 썸네일(Elevate.Web/src/assets/post-thumbs)을 만든 'UI 미니어처' kit v2(소프트 글래스)를
 * 그대로 옮겼다: 앱 색 파스텔 무대와 흐린 글로우, 창 뒤의 이리데센트 유리 오브젝트, 프로스티드 글래스 창·카드,
 * 검정 원형 아이콘이 있는 흰 유리 알약. Copilot Studio는 kit처럼 '밝은 유리 다크' 무대를 쓴다.
 * 무엇을 어디에 둘지는 thumbnailLayout.js가 정하고, 이 파일은 그리기만 한다.
 * 결과는 16:9 1440×810 PNG 파일이며, 업로드 때 480·960·1440 WebP variants를 만든다.
 */
import { getAppMeta } from '../constants/appMeta.js'
import { extractThumbnailContent } from './thumbnailContent.js'
import { APP_PILL_ICONS, ICON_PATHS } from './thumbnailIcons.js'
import { CARD, PILL, ROW, STAGE, TYPE, WINDOW, planThumbnailScene } from './thumbnailLayout.js'

export const THUMBNAIL_WIDTH = 1440
export const THUMBNAIL_HEIGHT = 810

/** 1cqw (무대 너비의 1%)를 픽셀로. */
const U = THUMBNAIL_WIDTH / STAGE.w
const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Apple SD Gothic Neo", "Segoe UI", "Malgun Gothic", "Helvetica Neue", system-ui, sans-serif'
const DARK_APPS = new Set(['copilot-studio'])
const OFFSCREEN = 20000

/* 앱별 유리 오브젝트 (kit assets/glass/<app>/<shape>.png를 640px WebP로 줄인 것). 그릴 2개만 내려받는다. */
const GLASS_URLS = import.meta.glob('../assets/glass/*/*.webp', { eager: true, query: '?url', import: 'default' })

/* ------------------------------------------------------------------ */
/* 색                                                                  */
/* ------------------------------------------------------------------ */

const WHITE = [255, 255, 255]
const LIGHT_INK = ['#17181b', '#3a3d43', '#6b7079', '#8d929b']
const DARK_INK = ['#f5f8fb', '#dde4eb', '#b9c5cf', '#a1aebb']

function hexRgb(hex) {
  const value = hex.replace('#', '')
  const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value
  const number = Number.parseInt(full, 16)
  return [(number >> 16) & 255, (number >> 8) & 255, number & 255]
}

function tintRgb(tint) {
  return String(tint).split(',').map((part) => Number.parseInt(part, 10) || 0)
}

function rgba([r, g, b], alpha = 1) {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`
}

/** CSS color-mix(in srgb, a p, b) — 반투명 색은 미리 곱한 알파로 섞는다. */
function mixColor(a, p, b, alphaA = 1, alphaB = 1) {
  const alpha = alphaA * p + alphaB * (1 - p)
  const rgb = [0, 1, 2].map((index) => (a[index] * alphaA * p + b[index] * alphaB * (1 - p)) / (alpha || 1))
  return rgba(rgb, Number(alpha.toFixed(4)))
}

function mixRgb(a, p, b) {
  return [0, 1, 2].map((index) => a[index] * p + b[index] * (1 - p))
}

function getTheme(app) {
  const meta = getAppMeta(app)
  const dark = DARK_APPS.has(app)
  const m = meta.mesh.map(hexRgb)
  const tint = dark ? [72, 222, 202] : tintRgb(meta.tint)
  return {
    app,
    dark,
    name: meta.name,
    icon: meta.icon,
    m,
    tint,
    ink: dark ? DARK_INK : LIGHT_INK,
    grad: dark ? [hexRgb('#14a191'), hexRgb('#0d7d93')] : [tint, mixRgb(tint, 0.68, m[1])],
    soft: dark ? rgba(tint, 0.12) : mixColor(tint, 0.08, WHITE, 1, 0.55),
    badge: dark ? rgba(tint, 0.18) : mixColor(tint, 0.12, WHITE, 1, 0.7),
    skeleton: dark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(20, 22, 30, 0.075)',
    line: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(20, 22, 30, 0.07)',
    pillIcon: APP_PILL_ICONS[app] || 'sparkle',
  }
}

/* ------------------------------------------------------------------ */
/* Canvas 도우미                                                        */
/* ------------------------------------------------------------------ */

function makeCanvas(width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width))
  canvas.height = Math.max(1, Math.round(height))
  return canvas
}

function context(canvas) {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('CANVAS_UNAVAILABLE')
  return ctx
}

function roundRect(x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2))
  const path = new Path2D()
  path.moveTo(x + r, y)
  path.arcTo(x + width, y, x + width, y + height, r)
  path.arcTo(x + width, y + height, x, y + height, r)
  path.arcTo(x, y + height, x, y, r)
  path.arcTo(x, y, x + width, y, r)
  path.closePath()
  return path
}

function toPx(box) {
  return { x: box.x * U, y: box.y * U, w: box.w * U, h: box.h * U }
}

/** CSS linear-gradient(angle) 와 같은 방향·길이의 Canvas 그라데이션. */
function linearGradient(ctx, box, angle, stops) {
  const radians = (angle * Math.PI) / 180
  const dx = Math.sin(radians)
  const dy = -Math.cos(radians)
  const half = (Math.abs(box.w * dx) + Math.abs(box.h * dy)) / 2
  const cx = box.x + box.w / 2
  const cy = box.y + box.h / 2
  const gradient = ctx.createLinearGradient(cx - dx * half, cy - dy * half, cx + dx * half, cy + dy * half)
  for (const [offset, color] of stops) gradient.addColorStop(offset, color)
  return gradient
}

/** CSS radial-gradient(rx ry at cx cy, …) 타원. */
function fillEllipse(ctx, cx, cy, rx, ry, stops) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(rx, ry)
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1)
  for (const [offset, color] of stops) gradient.addColorStop(offset, color)
  ctx.fillStyle = gradient
  ctx.fillRect(-1, -1, 2, 2)
  ctx.restore()
}

let canvasFilterSupported = null

/** ctx.filter(blur·saturate)를 실제로 그리는지 확인한다. 일부 Safari는 속성만 있고 그리지 않는다. */
function supportsCanvasFilter() {
  if (canvasFilterSupported !== null) return canvasFilterSupported
  try {
    const source = makeCanvas(9, 1)
    const sourceCtx = context(source)
    sourceCtx.fillStyle = '#000'
    sourceCtx.fillRect(4, 0, 1, 1)
    const target = makeCanvas(9, 1)
    const ctx = context(target)
    ctx.filter = 'blur(2px)'
    ctx.drawImage(source, 0, 0)
    canvasFilterSupported = ctx.getImageData(1, 0, 1, 1).data[3] > 0
  } catch {
    canvasFilterSupported = false
  }
  return canvasFilterSupported
}

/** CSS saturate() 행렬 (Filter Effects 명세). */
function saturatePixels(ctx, width, height, amount) {
  const image = ctx.getImageData(0, 0, width, height)
  const data = image.data
  const s = amount
  const matrix = [
    0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s,
    0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s,
    0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s,
  ]
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]]
    data[i] = matrix[0] * r + matrix[1] * g + matrix[2] * b
    data[i + 1] = matrix[3] * r + matrix[4] * g + matrix[5] * b
    data[i + 2] = matrix[6] * r + matrix[7] * g + matrix[8] * b
  }
  ctx.putImageData(image, 0, 0)
}

/**
 * CSS filter: blur(σ) saturate(s) 를 적용한 새 캔버스 (pad만큼 사방을 넓혀 흐림이 잘리지 않게 한다).
 * ctx.filter를 못 쓰면 줄였다 늘려서 비슷하게 흐린다.
 */
function filtered(source, { blur = 0, saturate = 1 } = {}, pad = 0) {
  const out = makeCanvas(source.width + pad * 2, source.height + pad * 2)
  const ctx = context(out)
  if (supportsCanvasFilter()) {
    const parts = [blur > 0 && `blur(${blur.toFixed(2)}px)`, saturate !== 1 && `saturate(${Math.round(saturate * 100)}%)`]
    ctx.filter = parts.filter(Boolean).join(' ') || 'none'
    ctx.drawImage(source, pad, pad)
    ctx.filter = 'none'
    return out
  }
  const factor = Math.max(1, blur / 2.5)
  const half = makeCanvas(out.width / Math.sqrt(factor), out.height / Math.sqrt(factor))
  const halfCtx = context(half)
  halfCtx.imageSmoothingQuality = 'high'
  halfCtx.drawImage(source, pad / Math.sqrt(factor), pad / Math.sqrt(factor), source.width / Math.sqrt(factor), source.height / Math.sqrt(factor))
  const small = makeCanvas(out.width / factor, out.height / factor)
  const smallCtx = context(small)
  smallCtx.imageSmoothingQuality = 'high'
  smallCtx.drawImage(half, 0, 0, small.width, small.height)
  if (saturate !== 1) saturatePixels(smallCtx, small.width, small.height, saturate)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(small, 0, 0, out.width, out.height)
  return out
}

/**
 * CSS box-shadow 바깥 그림자 하나. y·blur·spread는 cqw.
 * 요소 아래에는 그리지 않도록(CSS와 같게) 요소 바깥으로 자르고, 도형은 화면 밖에 두고 그림자만 옮겨 온다.
 */
function boxShadow(ctx, box, radius, { y = 0, blur = 0, spread = 0, color }) {
  const s = spread * U
  const clip = new Path2D()
  clip.rect(-OFFSCREEN, -OFFSCREEN, OFFSCREEN * 3, OFFSCREEN * 3)
  clip.addPath(roundRect(box.x, box.y, box.w, box.h, radius))
  ctx.save()
  ctx.clip(clip, 'evenodd')
  ctx.shadowColor = color
  ctx.shadowBlur = blur * U
  ctx.shadowOffsetX = OFFSCREEN
  ctx.shadowOffsetY = y * U
  ctx.fillStyle = '#000'
  ctx.fill(roundRect(box.x - s - OFFSCREEN, box.y - s, box.w + s * 2, box.h + s * 2, radius + s))
  ctx.restore()
}

/** CSS는 앞에 쓴 그림자가 위에 온다. */
function boxShadows(ctx, box, radius, shadows) {
  for (const shadow of [...shadows].reverse()) boxShadow(ctx, box, radius, shadow)
}

/** 안쪽 테두리 띠 (inset 0 0 0 width). 요소 모양으로 잘린 상태에서 부른다. */
function insetRing(ctx, path, width, color) {
  ctx.lineWidth = width * U * 2
  ctx.strokeStyle = color
  ctx.stroke(path)
}

/** 위쪽 안쪽 하이라이트 (inset 0 y 0 color). 요소 모양으로 잘린 상태에서 부른다. */
function insetTop(ctx, box, radius, y, color) {
  const band = new Path2D()
  band.addPath(roundRect(box.x, box.y, box.w, box.h, radius))
  band.addPath(roundRect(box.x, box.y + y * U, box.w, box.h, radius))
  ctx.fillStyle = color
  ctx.fill(band, 'evenodd')
}

const iconPaths = new Map()

function drawIcon(ctx, name, x, y, size, color) {
  const d = ICON_PATHS[name]
  if (!d) return
  if (!iconPaths.has(name)) iconPaths.set(name, new Path2D(d))
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(size / 24, size / 24)
  ctx.fillStyle = color
  ctx.fill(iconPaths.get(name))
  ctx.restore()
}

function setFont(ctx, style, color) {
  ctx.font = `${style.weight} ${(style.size * U).toFixed(2)}px ${FONT}`
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${((style.tracking || 0) * style.size * U).toFixed(2)}px`
  ctx.fillStyle = color
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
}

function measurer(ctx) {
  return (text, style) => {
    setFont(ctx, style, '#000')
    return ctx.measureText(text).width / U
  }
}

/* ------------------------------------------------------------------ */
/* 무대와 유리 오브젝트                                                 */
/* ------------------------------------------------------------------ */

function paintStage(ctx, theme, variant) {
  const W = THUMBNAIL_WIDTH
  const H = THUMBNAIL_HEIGHT
  const stage = { x: 0, y: 0, w: W, h: H }
  const [m1, m2, m3, m4] = theme.m
  if (theme.dark) {
    ctx.fillStyle = linearGradient(ctx, stage, 135, [[0, '#21606a'], [0.4, '#25566a'], [1, '#384a78']])
    ctx.fillRect(0, 0, W, H)
    fillEllipse(ctx, 0, 0, W * 0.7, H * 0.95, [[0, 'rgba(150, 255, 235, 0.13)'], [0.62, 'rgba(150, 255, 235, 0)']])
  } else {
    ctx.fillStyle = linearGradient(ctx, stage, 135, [
      [0, rgba(mixRgb(m3, 0.08, hexRgb('#f8f8f9')))],
      [0.5, rgba(mixRgb(m1, 0.2, hexRgb('#f3f3f6')))],
      [1, rgba(mixRgb(m2, 0.3, hexRgb('#efeff4')))],
    ])
    ctx.fillRect(0, 0, W, H)
    fillEllipse(ctx, 0, 0, W * 0.75, H * 1.05, [[0, 'rgba(255, 255, 255, 0.96)'], [0.64, 'rgba(255, 255, 255, 0)']])
  }

  // 앱 색 글로우 (kit .tD::before: 무대보다 14% 넓은 상자, 흐림·채도, 변형별 좌우·상하 반전)
  const gw = W * 1.28
  const gh = H * 1.28
  const glow = makeCanvas(gw, gh)
  const glowCtx = context(glow)
  const layers = [
    [0.12, 0.04, 0.18, 0.26, mixRgb(m3, 0.6, WHITE)],
    [0.06, 1, 0.2, 0.28, m4],
    [0.5, 1.08, 0.3, 0.32, m1],
    [1, 0.34, 0.26, 0.36, m3],
    [0.84, 0.84, 0.3, 0.4, m2],
  ]
  for (const [cx, cy, rx, ry, color] of layers) {
    fillEllipse(glowCtx, cx * gw, cy * gh, rx * gw, ry * gh, [[0, rgba(color, 1)], [0.7, rgba(color, 0)]])
  }
  const soft = filtered(glow, { blur: (theme.dark ? 4 : 3.6) * U, saturate: theme.dark ? 1.4 : 1.18 })
  ctx.save()
  ctx.globalAlpha = theme.dark ? 0.95 : 0.7
  ctx.translate(W / 2, H / 2)
  ctx.scale(variant & 1 ? -1 : 1, variant & 2 ? -1 : 1)
  ctx.drawImage(soft, -gw / 2, -gh / 2)
  ctx.restore()
}

function paintDeco(ctx, theme, deco, images) {
  for (const item of deco.items) {
    const image = images[item.shape]
    if (!image) continue
    const w = item.w * U
    const h = (w * (image.naturalHeight || image.height)) / (image.naturalWidth || image.width)
    const x = item.x != null ? item.x * U : THUMBNAIL_WIDTH - item.right * U - w
    const y = item.y != null ? item.y * U : THUMBNAIL_HEIGHT - item.bottom * U - h
    const [offsetY, blur, color] = theme.dark
      ? (item.far ? [1.2, 1.6, 'rgba(4, 10, 20, 0.35)'] : [2.4, 3, 'rgba(4, 10, 20, 0.4)'])
      : (item.far ? [1.2, 1.6, rgba(theme.tint, 0.22)] : [2.4, 2.8, rgba(theme.tint, 0.26)])

    let source = image
    let pad = 0
    if (item.far) {
      const sized = makeCanvas(w, h)
      context(sized).drawImage(image, 0, 0, sized.width, sized.height)
      pad = Math.ceil(0.28 * U * 3)
      source = filtered(sized, { blur: 0.28 * U }, pad)
    }
    ctx.save()
    ctx.shadowColor = color
    ctx.shadowBlur = blur * U
    ctx.shadowOffsetY = offsetY * U
    ctx.translate(x + w / 2, y + h / 2)
    if (item.rotate) ctx.rotate((item.rotate * Math.PI) / 180)
    if (item.far) ctx.drawImage(source, -w / 2 - pad, -h / 2 - pad)
    else ctx.drawImage(source, -w / 2, -h / 2, w, h)
    ctx.restore()
  }
}

/* ------------------------------------------------------------------ */
/* 유리 창 · 카드 · 알약                                                */
/* ------------------------------------------------------------------ */

function panelShadows(theme, kind) {
  if (theme.dark) {
    return [
      { y: 4.4, blur: 9, spread: -4, color: 'rgba(4, 10, 20, 0.55)' },
      { y: 3, blur: 8, spread: -4, color: rgba(theme.tint, 0.3) },
    ]
  }
  const ring = { spread: 0.14, color: 'rgba(20, 22, 30, 0.05)' }
  return kind === 'window'
    ? [ring, { y: 4, blur: 9, spread: -4, color: rgba(theme.tint, 0.4) }, { y: 1.4, blur: 3, spread: -1.6, color: 'rgba(20, 22, 30, 0.14)' }]
    : [ring, { y: 3.4, blur: 7.4, spread: -3.2, color: rgba(theme.tint, 0.4) }, { y: 1, blur: 2.4, spread: -1.4, color: 'rgba(20, 22, 30, 0.14)' }]
}

/** 그림자 → 흐린 배경(backdrop-filter) → 유리 그라데이션 → 안쪽 테두리. 이후 내용은 path 안에 그린다. */
function paintGlassPanel(ctx, theme, box, radius, kind, backdrop) {
  const path = roundRect(box.x, box.y, box.w, box.h, radius)
  boxShadows(ctx, box, radius, panelShadows(theme, kind))
  ctx.save()
  ctx.clip(path)
  ctx.drawImage(backdrop, 0, 0)
  if (theme.dark) {
    ctx.fillStyle = linearGradient(ctx, box, 180, [[0, 'rgba(14, 40, 54, 0.14)'], [1, 'rgba(14, 40, 54, 0.36)']])
    ctx.fill(path)
    ctx.fillStyle = linearGradient(ctx, box, 160, [[0, 'rgba(255, 255, 255, 0.21)'], [0.55, 'rgba(255, 255, 255, 0.08)'], [1, 'rgba(255, 255, 255, 0.06)']])
    ctx.fill(path)
    insetTop(ctx, box, radius, 0.18, 'rgba(255, 255, 255, 0.14)')
  } else {
    ctx.fillStyle = linearGradient(ctx, box, 160, [[0, 'rgba(255, 255, 255, 0.88)'], [0.55, 'rgba(255, 255, 255, 0.7)'], [1, 'rgba(255, 255, 255, 0.62)']])
    ctx.fill(path)
    insetRing(ctx, path, 0.18, 'rgba(255, 255, 255, 0.92)')
  }
  ctx.restore()
  return path
}

/** 다크 유리의 밝은 그라데이션 가장자리 (kit .dark .win::after). 내용 위에 그린다. */
function paintDarkEdge(ctx, box, radius) {
  const path = roundRect(box.x, box.y, box.w, box.h, radius)
  ctx.save()
  ctx.clip(path)
  ctx.lineWidth = 0.17 * U * 2
  ctx.strokeStyle = linearGradient(ctx, box, 155, [
    [0, 'rgba(255, 255, 255, 0.55)'],
    [0.38, 'rgba(255, 255, 255, 0.12)'],
    [0.62, 'rgba(255, 255, 255, 0.06)'],
    [1, 'rgba(255, 255, 255, 0.26)'],
  ])
  ctx.stroke(path)
  ctx.restore()
}

function paintCheck(ctx, theme, cx, cy) {
  const size = ROW.check * U
  const box = { x: cx - size / 2, y: cy - size / 2, w: size, h: size }
  ctx.fillStyle = linearGradient(ctx, box, 135, [[0, rgba(theme.grad[0])], [1, rgba(theme.grad[1])]])
  ctx.fill(roundRect(box.x, box.y, size, size, 0.7 * U))
  ctx.save()
  ctx.translate(cx, cy - 0.15 * U)
  ctx.rotate(-Math.PI / 4)
  ctx.beginPath()
  ctx.moveTo(-0.425 * U, -0.325 * U)
  ctx.lineTo(-0.425 * U, 0.15 * U)
  ctx.lineTo(0.6 * U, 0.15 * U)
  ctx.lineWidth = 0.35 * U
  ctx.lineJoin = 'miter'
  ctx.lineCap = 'butt'
  ctx.strokeStyle = '#ffffff'
  ctx.stroke()
  ctx.restore()
}

function paintRow(ctx, theme, row) {
  const box = toPx(row)
  const radius = ROW.r * U
  if (row.highlight) {
    // kit .hl: 앱 색 테두리 + 옅은 후광 + 앱 색 그림자
    boxShadows(ctx, box, radius, [
      { spread: 0.3, color: rgba(theme.tint, 1) },
      { spread: 1.2, color: rgba(theme.tint, 0.15) },
      { y: 2.4, blur: 4.8, spread: -2, color: rgba(theme.tint, 0.5) },
    ])
  }
  ctx.fillStyle = theme.soft
  ctx.fill(roundRect(box.x, box.y, box.w, box.h, radius))
  const cy = box.y + box.h / 2
  paintCheck(ctx, theme, box.x + (ROW.padX + ROW.check / 2) * U, cy)
  setFont(ctx, TYPE.b, theme.ink[0])
  ctx.fillText(row.text, box.x + (ROW.padX + ROW.check + ROW.checkGap) * U, cy)
}

function paintWindow(ctx, theme, scene, icon, backdrop) {
  const box = toPx(scene.window)
  const radius = WINDOW.r * U
  const path = paintGlassPanel(ctx, theme, box, radius, 'window', backdrop)
  ctx.save()
  ctx.clip(path)

  // 제목 표시줄: 앱 아이콘 + 앱 이름, 아래 얇은 선
  const barH = WINDOW.bar * U
  const border = 0.15 * U
  ctx.fillStyle = theme.dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(20, 22, 30, 0.06)'
  ctx.fillRect(box.x, box.y + barH - border, box.w, border)
  const barMid = box.y + (barH - border) / 2
  let textX = box.x + WINDOW.barPad * U
  if (icon) {
    const size = WINDOW.icon * U
    try {
      ctx.drawImage(icon, textX, barMid - size / 2, size, size)
      textX += size + WINDOW.iconGap * U
    } catch {
      // 아이콘을 그릴 수 없으면 이름만 둔다.
    }
  }
  setFont(ctx, TYPE.bar, theme.ink[0])
  ctx.fillText(theme.name, textX, barMid)

  const { title } = scene
  setFont(ctx, title.style, theme.ink[0])
  title.lines.forEach((line, index) => {
    ctx.fillText(line, title.x * U, (title.y + title.lineHeight * (index + 0.5)) * U)
  })

  for (const row of scene.rows) paintRow(ctx, theme, row)

  if (scene.paragraph) {
    const { paragraph } = scene
    setFont(ctx, TYPE.m, theme.ink[1])
    paragraph.lines.forEach((line, index) => {
      ctx.fillText(line, paragraph.x * U, (paragraph.y + paragraph.lineHeight * (index + 0.5)) * U)
    })
  }

  ctx.fillStyle = theme.skeleton
  for (const bar of scene.skeleton) {
    const b = toPx(bar)
    ctx.fill(roundRect(b.x, b.y, b.w, b.h, b.h / 2))
  }
  ctx.restore()
  if (theme.dark) paintDarkEdge(ctx, box, radius)
}

function paintCard(ctx, theme, card, backdrop) {
  const box = toPx(card)
  const radius = CARD.r * U
  const path = paintGlassPanel(ctx, theme, box, radius, 'card', backdrop)
  ctx.save()
  ctx.clip(path)

  const left = box.x + CARD.pad * U
  const headMid = box.y + (CARD.pad + CARD.head / 2) * U
  drawIcon(ctx, card.icon, left, headMid - (CARD.icon * U) / 2, CARD.icon * U, rgba(theme.tint))
  setFont(ctx, TYPE.label, theme.ink[0])
  ctx.fillText(card.label, left + (CARD.icon + CARD.iconGap) * U, headMid)
  ctx.fillStyle = theme.line
  ctx.fillRect(left, box.y + (CARD.pad + CARD.head + 1.6) * U, box.w - CARD.pad * 2 * U, 0.15 * U)

  if (card.kind === 'outline') {
    const textX = left + (CARD.badge + CARD.badgeGap) * U
    for (const item of card.items) {
      const firstMid = (item.y + card.lineHeight / 2) * U
      const badgeR = (CARD.badge * U) / 2
      ctx.fillStyle = theme.badge
      ctx.beginPath()
      ctx.arc(left + badgeR, firstMid, badgeR, 0, Math.PI * 2)
      ctx.fill()
      setFont(ctx, TYPE.num, rgba(theme.tint))
      ctx.textAlign = 'center'
      ctx.fillText(String(item.number), left + badgeR, firstMid)
      setFont(ctx, TYPE.m, theme.ink[1])
      item.lines.forEach((line, index) => ctx.fillText(line, textX, (item.y + card.lineHeight * (index + 0.5)) * U))
    }
  } else {
    setFont(ctx, TYPE.m, theme.ink[1])
    card.paragraph.lines.forEach((line, index) => {
      ctx.fillText(line, left, (card.paragraph.y + card.lineHeight * (index + 0.5)) * U)
    })
  }
  ctx.restore()
  if (theme.dark) paintDarkEdge(ctx, box, radius)
}

function paintPill(ctx, theme, pill, backdrop) {
  const box = toPx(pill)
  const radius = box.h / 2
  const path = roundRect(box.x, box.y, box.w, box.h, radius)
  boxShadows(ctx, box, radius, theme.dark
    ? [{ y: 1.8, blur: 4, spread: -1.8, color: 'rgba(4, 10, 20, 0.55)' }]
    : [{ spread: 0.12, color: 'rgba(20, 22, 30, 0.05)' }, { y: 1.8, blur: 4, spread: -1.8, color: 'rgba(20, 22, 30, 0.32)' }])
  ctx.save()
  ctx.clip(path)
  ctx.drawImage(backdrop, 0, 0)
  if (theme.dark) {
    ctx.fillStyle = 'rgba(14, 40, 54, 0.22)'
    ctx.fill(path)
    ctx.fillStyle = linearGradient(ctx, box, 160, [[0, 'rgba(255, 255, 255, 0.26)'], [1, 'rgba(255, 255, 255, 0.12)']])
    ctx.fill(path)
    insetTop(ctx, box, radius, 0.2, 'rgba(255, 255, 255, 0.22)')
    insetRing(ctx, path, 0.16, 'rgba(255, 255, 255, 0.3)')
  } else {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.fill(path)
    insetRing(ctx, path, 0.18, 'rgba(255, 255, 255, 0.95)')
  }
  ctx.restore()

  // 검정 원형 아이콘 (다크는 흰 원) + 문구
  const piR = (PILL.pi * U) / 2
  const piX = box.x + PILL.padLeft * U + piR
  const cy = box.y + box.h / 2
  ctx.fillStyle = theme.dark ? '#ffffff' : '#121316'
  ctx.beginPath()
  ctx.arc(piX, cy, piR, 0, Math.PI * 2)
  ctx.fill()
  const iconSize = PILL.icon * U
  drawIcon(ctx, theme.pillIcon, piX - iconSize / 2, cy - iconSize / 2, iconSize, theme.dark ? '#17181b' : '#ffffff')
  setFont(ctx, TYPE.pill, theme.dark ? '#ffffff' : theme.ink[0])
  ctx.fillText(pill.text, piX + piR + PILL.gap * U, cy)
}

/* ------------------------------------------------------------------ */
/* 내보내기                                                             */
/* ------------------------------------------------------------------ */

function loadImage(src, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const timer = setTimeout(() => {
      image.src = ''
      reject(new Error('IMAGE_TIMEOUT'))
    }, timeoutMs)
    image.onload = () => {
      clearTimeout(timer)
      resolve(image)
    }
    image.onerror = () => {
      clearTimeout(timer)
      reject(new Error('IMAGE_LOAD_FAILED'))
    }
    image.src = src
  })
}

function canvasToFile(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('THUMBNAIL_EXPORT_FAILED'))
        return
      }
      resolve(new File([blob], 'auto-thumbnail.png', { type: 'image/png', lastModified: Date.now() }))
    }, 'image/png')
  })
}

/**
 * 게시글 내용으로 썸네일 PNG 파일을 만든다.
 * @param {{ app: string, title: string, excerpt?: string, html?: string }} post
 * @returns {Promise<File>}
 */
export async function renderAutoThumbnail({ app, title, excerpt, html }) {
  const theme = getTheme(app)
  const content = extractThumbnailContent({ title, excerpt, html })
  const canvas = makeCanvas(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT)
  const ctx = context(canvas)
  const scene = planThumbnailScene(content, { app, dark: theme.dark, measure: measurer(ctx) })

  const shapes = scene.deco.items.map((item) => item.shape)
  const [icon, ...glass] = await Promise.all([
    theme.icon ? loadImage(theme.icon).catch(() => null) : null,
    ...shapes.map((shape) => {
      const url = GLASS_URLS[`../assets/glass/${app}/${shape}.webp`]
      return url ? loadImage(url).catch(() => null) : null
    }),
  ])

  paintStage(ctx, theme, scene.deco.v)
  paintDeco(ctx, theme, scene.deco, Object.fromEntries(shapes.map((shape, index) => [shape, glass[index]])))
  // 창·카드는 무대와 유리 오브젝트를 흐려 비춘다 (backdrop-filter: blur(3.2cqw) saturate(180%), 다크 160%).
  const frost = filtered(canvas, { blur: 3.2 * U, saturate: theme.dark ? 1.6 : 1.8 })
  paintWindow(ctx, theme, scene, icon, frost)
  if (scene.card) paintCard(ctx, theme, scene.card, frost)
  paintPill(ctx, theme, scene.pill, filtered(canvas, { blur: 1.8 * U, saturate: 1.8 }))
  return canvasToFile(canvas)
}
