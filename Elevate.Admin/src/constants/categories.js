/**
 * 서비스에서 사용하는 콘텐츠 카테고리 목록.
 * group: 'main' — 주요 제품/서비스 카테고리 (사이드바 상단 그룹)
 * group: 'sub'  — 부가 프로그램 및 뉴스 카테고리 (사이드바 하단 그룹)
 */
export const CATEGORIES = [
  { value: 'm365',         label: 'M365',     group: 'main' },
  { value: 'copilot',      label: 'Copilot',  group: 'main' },
  { value: 'teams',        label: 'Teams',    group: 'main' },
  { value: 'minecraft',    label: 'Minecraft', group: 'main' },
  { value: 'excel',        label: 'Excel',    group: 'main' },
  { value: 'onenote',      label: 'OneNote',  group: 'main' },
  { value: 'agenthon',     label: 'Agenthon', group: 'sub' },
  { value: 'update',       label: 'Update',   group: 'sub' },
  { value: 'mee',          label: 'MEE',      group: 'sub' },
  { value: 'program-news', label: '행사 소식', group: 'sub' },
]

/** value → label 빠른 조회를 위한 맵. UI 렌더링 시 카테고리 이름을 표시할 때 사용한다. */
export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]))
