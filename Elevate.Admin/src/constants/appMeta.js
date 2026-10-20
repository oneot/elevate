/**
 * 앱별 화면 메타데이터 (아이콘, 유리 타일 색, 머리글 배경, 소개 문구).
 * 공개 사이트 블로그(Elevate.Web docsMeta.js)와 같은 색·아이콘·소개를 사용해 관리자 화면도 같은 앱으로 보이게 한다.
 */
import { APP_LABELS, ALL_APPS_KEY } from './apps.js'
import allPaint from '../assets/apps/paint-all.webp'
import allGlyph from '../assets/apps/glyph-all.webp'
import m365Icon from '../assets/apps/m365-64.webp'
import m365Paint from '../assets/apps/paint-m365.webp'
import m365Glyph from '../assets/apps/glyph-m365.webp'
import copilotIcon from '../assets/apps/copilot-64.webp'
import copilotPaint from '../assets/apps/paint-copilot.webp'
import copilotGlyph from '../assets/apps/glyph-copilot.webp'
import copilotStudioIcon from '../assets/apps/copilot-studio-64.webp'
import copilotStudioPaint from '../assets/apps/paint-copilot-studio.webp'
import copilotStudioGlyph from '../assets/apps/glyph-copilot-studio.webp'
import teamsIcon from '../assets/apps/teams-64.webp'
import teamsPaint from '../assets/apps/paint-teams.webp'
import teamsGlyph from '../assets/apps/glyph-teams.webp'
import minecraftIcon from '../assets/apps/minecraft-64.webp'
import minecraftPaint from '../assets/apps/paint-minecraft.webp'
import minecraftGlyph from '../assets/apps/glyph-minecraft.webp'
import excelIcon from '../assets/apps/excel-64.webp'
import excelPaint from '../assets/apps/paint-excel.webp'
import excelGlyph from '../assets/apps/glyph-excel.webp'
import onenoteIcon from '../assets/apps/onenote-64.webp'
import onenotePaint from '../assets/apps/paint-onenote.webp'
import onenoteGlyph from '../assets/apps/glyph-onenote.webp'
import wordIcon from '../assets/apps/word.svg'
import wordPaint from '../assets/apps/paint-word.webp'
import wordGlyph from '../assets/apps/glyph-word.webp'
import powerpointIcon from '../assets/apps/powerpoint.svg'
import powerpointPaint from '../assets/apps/paint-powerpoint.webp'
import powerpointGlyph from '../assets/apps/glyph-powerpoint.webp'
import formsIcon from '../assets/apps/forms.svg'
import formsPaint from '../assets/apps/paint-forms.webp'
import formsGlyph from '../assets/apps/glyph-forms.webp'
import onedriveIcon from '../assets/apps/onedrive.svg'
import onedrivePaint from '../assets/apps/paint-onedrive.webp'
import onedriveGlyph from '../assets/apps/glyph-onedrive.webp'
import githubIcon from '../assets/apps/github.svg'
import githubPaint from '../assets/apps/paint-github.webp'
import githubGlyph from '../assets/apps/glyph-github.webp'
import azureIcon from '../assets/apps/azure.svg'
import azurePaint from '../assets/apps/paint-azure.webp'
import azureGlyph from '../assets/apps/glyph-azure.webp'

const BASE = {
  icon: null,
  paint: allPaint,
  glyph: allGlyph,
  mesh: ['#ff7a59', '#9bd14a', '#3fb8f5', '#ffc93c'],
  tint: '0, 103, 184',
  heroA: '#ebf2fa',
  heroB: '#f6f8fc',
  description: '',
}

const META = {
  [ALL_APPS_KEY]: {
    description: '13개 앱의 게시글을 한곳에서 작성하고 게시 상태를 관리합니다.',
  },
  m365: {
    mesh: ['#2f8fe0', '#c25bb4', '#6fbf6a', '#e3c24a'],
    icon: m365Icon,
    paint: m365Paint,
    glyph: m365Glyph,
    tint: '216, 59, 1',
    heroA: '#fcefe9',
    heroB: '#fdf7f3',
    description: '수업 준비, 협업, 평가까지 교실에 필요한 모든 도구를 한 곳에 모았습니다.',
  },
  word: {
    mesh: ['#42d6ff', '#2f62e8', '#98bcfe', '#1592ef'],
    icon: wordIcon,
    paint: wordPaint,
    glyph: wordGlyph,
    tint: '24, 90, 189',
    heroA: '#eaf1fb',
    heroB: '#f4f8fd',
    description: 'Word Online으로 문서를 만들고 함께 편집하는 방법을 알아봅니다.',
  },
  powerpoint: {
    mesh: ['#ff9a4d', '#e5513f', '#ff8a8a', '#f26a5c'],
    icon: powerpointIcon,
    paint: powerpointPaint,
    glyph: powerpointGlyph,
    tint: '196, 62, 28',
    heroA: '#fcefea',
    heroB: '#fdf7f4',
    description: 'PowerPoint Online으로 수업 자료와 발표 슬라이드를 쉽게 만드는 방법을 알아봅니다.',
  },
  forms: {
    mesh: ['#27c7d4', '#0f8fa3', '#6fe0e6', '#1a9fbd'],
    icon: formsIcon,
    paint: formsPaint,
    glyph: formsGlyph,
    tint: '3, 120, 124',
    heroA: '#e6f4f4',
    heroB: '#f2f9f9',
    description: ['설문과 퀴즈를 쉽게 만듭니다.', '응답 결과를 바로 확인해 보세요.'],
  },
  onedrive: {
    mesh: ['#2895fc', '#2bcaf8', '#5aa8ff', '#1d7af0'],
    icon: onedriveIcon,
    paint: onedrivePaint,
    glyph: onedriveGlyph,
    tint: '0, 120, 212',
    heroA: '#e9f2fc',
    heroB: '#f4f8fd',
    description: 'OneDrive로 파일을 어디서나 안전하게 저장하고 공유하는 방법을 알아봅니다.',
  },
  copilot: {
    mesh: ['#1aa0e8', '#d653ad', '#ff7d5c', '#f4b63a'],
    icon: copilotIcon,
    paint: copilotPaint,
    glyph: copilotGlyph,
    tint: '108, 92, 231',
    heroA: '#eef0fe',
    heroB: '#fbf2f8',
    description: ['AI가 수업과 업무를 돕습니다.', '가르치는 시간을 되찾으세요.'],
  },
  'copilot-studio': {
    mesh: ['#2fd0bd', '#e157be', '#24b3d8', '#a958e0'],
    icon: copilotStudioIcon,
    paint: copilotStudioPaint,
    glyph: copilotStudioGlyph,
    tint: '0, 128, 128',
    heroA: '#e7f4f3',
    heroB: '#f1f7fb',
    description: ['나만의 AI 에이전트를 만듭니다.', '코딩 없이 대화로 시작해 보세요.'],
  },
  teams: {
    mesh: ['#8f97fc', '#6c5cf0', '#b4a8ff', '#5d74f2'],
    icon: teamsIcon,
    paint: teamsPaint,
    glyph: teamsGlyph,
    tint: '91, 95, 199',
    heroA: '#eeeefb',
    heroB: '#f6f6fd',
    description: ['수업과 소통이 한곳에 모입니다.', '온라인 교실을 열어 보세요.'],
  },
  minecraft: {
    mesh: ['#7cc33a', '#4f8f1a', '#a9dc6a', '#c79a6b'],
    icon: minecraftIcon,
    paint: minecraftPaint,
    glyph: minecraftGlyph,
    tint: '76, 135, 52',
    heroA: '#edf5e7',
    heroB: '#f6f9f1',
    description: ['블록으로 코딩과 AI를 익힙니다.', '놀며 배우는 수업을 시작하세요.'],
  },
  excel: {
    mesh: ['#9ce671', '#2f9a45', '#6fd36a', '#c3f08a'],
    icon: excelIcon,
    paint: excelPaint,
    glyph: excelGlyph,
    tint: '16, 124, 65',
    heroA: '#e8f4ec',
    heroB: '#f3f9f5',
    description: ['수업 데이터를 표로 정리합니다.', '성적과 출석을 한눈에 보세요.'],
  },
  onenote: {
    mesh: ['#dd67fd', '#9b3fd0', '#f0a0ec', '#b65cf0'],
    icon: onenoteIcon,
    paint: onenotePaint,
    glyph: onenoteGlyph,
    tint: '119, 25, 170',
    heroA: '#f4ebf9',
    heroB: '#faf5fc',
    description: ['수업 기록을 한 권에 담습니다.', '흩어진 노트와 과제를 모으세요.'],
  },
  github: {
    mesh: ['#8957e5', '#2f81f7', '#3fb950', '#db61a2'],
    icon: githubIcon,
    paint: githubPaint,
    glyph: githubGlyph,
    tint: '130, 80, 223',
    heroA: '#f1edfb',
    heroB: '#f6f8fd',
    description: ['코드를 저장하고 공유합니다.', '전 세계 개발자와 협업해 보세요.'],
  },
  azure: {
    mesh: ['#50e6ff', '#0078d4', '#3ccbf4', '#2f5fd9'],
    icon: azureIcon,
    paint: azurePaint,
    glyph: azureGlyph,
    tint: '0, 120, 212',
    heroA: '#e8f2fc',
    heroB: '#f3f8fd',
    description: ['Microsoft의 클라우드입니다.', '앱과 AI를 손쉽게 운영해 보세요.'],
  },
}

/**
 * @param {string} appKey 앱 키 또는 'all'
 * @returns {{ key: string, name: string, icon: string|null, paint: string, glyph: string, mesh: string[], tint: string, heroA: string, heroB: string, description: string|string[] }}
 */
export function getAppMeta(appKey) {
  const key = appKey && META[appKey] ? appKey : ALL_APPS_KEY
  const name = key === ALL_APPS_KEY ? '전체 게시글' : APP_LABELS[key]
  return { ...BASE, ...META[key], key, name }
}

/** 하위 화면을 앱 색으로 물들이는 CSS 변수. */
export function getTintStyle(appKey) {
  const meta = getAppMeta(appKey)
  return {
    '--ea-tint-rgb': meta.tint,
    '--ea-hero-a': meta.heroA,
    '--ea-hero-b': meta.heroB,
    '--ea-mesh-1': meta.mesh[0],
    '--ea-mesh-2': meta.mesh[1],
    '--ea-mesh-3': meta.mesh[2],
    '--ea-mesh-4': meta.mesh[3],
  }
}
