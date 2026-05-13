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

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]))
