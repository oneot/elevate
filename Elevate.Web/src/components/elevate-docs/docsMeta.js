/**
 * @file docsMeta.js
 * @description Visual metadata (tint, icons, hero copy) for the docs-style blog pages.
 */
import { CATEGORY_DISPLAY_NAMES } from '../../constants/categories';
import { DEFAULT_DESCRIPTION } from '../../constants/seo';
import m365Icon from '../../assets/docs-icons/m365-64.webp';
import m365Paint from '../../assets/docs-icons/paint-m365.webp';
import copilotIcon from '../../assets/docs-icons/copilot-64.webp';
import copilotPaint from '../../assets/docs-icons/paint-copilot.webp';
import copilotStudioIcon from '../../assets/docs-icons/copilot-studio-64.webp';
import copilotStudioPaint from '../../assets/docs-icons/paint-copilot-studio.webp';
import teamsIcon from '../../assets/docs-icons/teams-64.webp';
import teamsPaint from '../../assets/docs-icons/paint-teams.webp';
import minecraftIcon from '../../assets/docs-icons/minecraft-64.webp';
import minecraftPaint from '../../assets/docs-icons/paint-minecraft.webp';
import excelIcon from '../../assets/docs-icons/excel-64.webp';
import excelPaint from '../../assets/docs-icons/paint-excel.webp';
import onenoteIcon from '../../assets/docs-icons/onenote-64.webp';
import onenotePaint from '../../assets/docs-icons/paint-onenote.webp';
import wordIcon from '../../assets/docs-icons/word.svg';
import powerpointIcon from '../../assets/docs-icons/powerpoint.svg';
import formsIcon from '../../assets/docs-icons/forms.svg';
import onedriveIcon from '../../assets/docs-icons/onedrive.svg';
import wordPaint from '../../assets/docs-icons/paint-word.webp';
import powerpointPaint from '../../assets/docs-icons/paint-powerpoint.webp';
import formsPaint from '../../assets/docs-icons/paint-forms.webp';
import onedrivePaint from '../../assets/docs-icons/paint-onedrive.webp';
import allPaint from '../../assets/docs-icons/paint-all.webp';
import allGlyph from '../../assets/docs-icons/glyph-all.webp';
import m365Glyph from '../../assets/docs-icons/glyph-m365.webp';
import copilotGlyph from '../../assets/docs-icons/glyph-copilot.webp';
import copilotStudioGlyph from '../../assets/docs-icons/glyph-copilot-studio.webp';
import teamsGlyph from '../../assets/docs-icons/glyph-teams.webp';
import minecraftGlyph from '../../assets/docs-icons/glyph-minecraft.webp';
import excelGlyph from '../../assets/docs-icons/glyph-excel.webp';
import onenoteGlyph from '../../assets/docs-icons/glyph-onenote.webp';
import wordGlyph from '../../assets/docs-icons/glyph-word.webp';
import powerpointGlyph from '../../assets/docs-icons/glyph-powerpoint.webp';
import formsGlyph from '../../assets/docs-icons/glyph-forms.webp';
import onedriveGlyph from '../../assets/docs-icons/glyph-onedrive.webp';
import activityPaint from '../../assets/docs-icons/paint-activity.webp';
import activityGlyph from '../../assets/docs-icons/glyph-activity.webp';

const BASE = {
  icon: null,
  paint: allPaint,
  glyph: allGlyph,
  mesh: ['#ff7a59', '#9bd14a', '#3fb8f5', '#ffc93c'],
  tint: '0, 103, 184',
  heroA: '#edf3fa',
  heroB: '#f7f9fc',
  description: '',
};

// Hero descriptions reuse the copy already used for each product on the Home page.
const META = {
  all: {
    tint: '0, 103, 184',
    heroA: '#ebf2fa',
    heroB: '#f6f8fc',
    description: DEFAULT_DESCRIPTION,
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
    description: 'Microsoft Forms로 설문, 퀴즈, 신청서를 만들고 결과를 확인하는 방법을 알아봅니다.',
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
    description: 'AI가 수업 자료 제작과 행정 업무를 돕고, 학생들의 아이디어를 함께 확장합니다.',
  },
  'copilot-studio': {
    mesh: ['#2fd0bd', '#e157be', '#24b3d8', '#a958e0'],
    icon: copilotStudioIcon,
    paint: copilotStudioPaint,
    glyph: copilotStudioGlyph,
    tint: '0, 128, 128',
    heroA: '#e7f4f3',
    heroB: '#f1f7fb',
    description: '학생들이 자신만의 AI 에이전트를 만들고 문제 해결에 활용할 수 있습니다.',
  },
  teams: {
    mesh: ['#8f97fc', '#6c5cf0', '#b4a8ff', '#5d74f2'],
    icon: teamsIcon,
    paint: teamsPaint,
    glyph: teamsGlyph,
    tint: '91, 95, 199',
    heroA: '#eeeefb',
    heroB: '#f6f6fd',
    description: '수업에 필요한 모든 소통이 한 공간에서 연결됩니다.',
  },
  minecraft: {
    mesh: ['#7cc33a', '#4f8f1a', '#a9dc6a', '#c79a6b'],
    icon: minecraftIcon,
    paint: minecraftPaint,
    glyph: minecraftGlyph,
    tint: '76, 135, 52',
    heroA: '#edf5e7',
    heroB: '#f6f9f1',
    description: '블록으로 만든 가상 세계에서 학생들이 코딩과 AI를 직접 다루며 문제 해결력을 키웁니다.',
  },
  excel: {
    mesh: ['#9ce671', '#2f9a45', '#6fd36a', '#c3f08a'],
    icon: excelIcon,
    paint: excelPaint,
    glyph: excelGlyph,
    tint: '16, 124, 65',
    heroA: '#e8f4ec',
    heroB: '#f3f9f5',
    description: '성적, 출석, 설문 결과까지 수업에서 다루는 모든 데이터를 표로 정리하고 분석합니다.',
  },
  onenote: {
    mesh: ['#dd67fd', '#9b3fd0', '#f0a0ec', '#b65cf0'],
    icon: onenoteIcon,
    paint: onenotePaint,
    glyph: onenoteGlyph,
    tint: '119, 25, 170',
    heroA: '#f4ebf9',
    heroB: '#faf5fc',
    description: '수업 노트, 학생 과제, 공동 작업을 한 권의 디지털 노트북에 담습니다.',
  },
  update: { tint: '0, 120, 212', heroA: '#eaf3fc', heroB: '#f5f9fd' },
  m365update: { tint: '0, 120, 212', heroA: '#eaf3fc', heroB: '#f5f9fd' },
  'program-news': { tint: '196, 118, 0', heroA: '#fdf4e4', heroB: '#fdf9f2' },
  event: { tint: '196, 118, 0', heroA: '#fdf4e4', heroB: '#fdf9f2' },
  agenthon: { tint: '80, 70, 229', heroA: '#eeedfd', heroB: '#f7f6fe' },
  mee: { tint: '0, 140, 180', heroA: '#e6f4f8', heroB: '#f2f9fb' },
  // 활동 사례(영상) 화면: 앱이 아니라 커뮤니티 영상이라 재생 아이콘과 부드러운 네 가지 색을 쓴다.
  activity: {
    mesh: ['#ff80b0', '#8c6cf5', '#46c3ff', '#ffb36b'],
    paint: activityPaint,
    glyph: activityGlyph,
    tint: '108, 84, 220',
    heroA: '#f1effd',
    heroB: '#fbf3f8',
    description: 'Microsoft Elevate for Educators (MEE) 커뮤니티에서 교육 혁신 인사이트를 나누며 함께 성장해 보세요.',
  },
};

/**
 * @param {string} category
 * @returns {{ key: string, name: string, icon: string|null, paint: string, glyph: string, mesh: string[], tint: string, heroA: string, heroB: string, description: string }}
 *   icon: 사이드바·eyebrow용 작은 앱 아이콘, paint: 유리 타일 안 빛을 칠할 컬러 이미지,
 *   glyph: 앱 아이콘을 흰 반투명 유리로 바꿔 미리 만들어 둔 이미지 (glyph-*.webp, 색 이미지는 paint-*.webp)
 *   mesh: 히어로 배경 전체에 은은하게 퍼지는 4색 (각 앱 아이콘의 색에서 골랐다)
 */
export function getDocsMeta(category) {
  const key = category && META[category] ? category : 'all';
  const name = key === 'all' ? '전체' : (CATEGORY_DISPLAY_NAMES[category] || category || '전체');
  return { ...BASE, ...META[key], key, name };
}

/** CSS custom properties that tint a subtree for the given category. */
export function getTintStyle(category) {
  const meta = getDocsMeta(category);
  return {
    '--edoc-tint-rgb': meta.tint,
    '--edoc-hero-a': meta.heroA,
    '--edoc-hero-b': meta.heroB,
    '--edoc-mesh-1': meta.mesh[0],
    '--edoc-mesh-2': meta.mesh[1],
    '--edoc-mesh-3': meta.mesh[2],
    '--edoc-mesh-4': meta.mesh[3],
  };
}

/** Which global-bar section a category belongs to. */
export function getDocsSection(category) {
  if (category === 'update' || category === 'm365update') return 'update';
  if (category === 'program-news' || category === 'event') return 'program';
  if (category === 'agenthon') return 'agenthon';
  return 'blog';
}
