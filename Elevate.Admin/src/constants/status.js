/**
 * 관리자 화면의 게시 상태는 '게시'와 '보관' 두 가지다.
 * 서버 저장 값은 그대로 draft/published/archived이며, published가 아니면 모두 '보관'으로 보여 준다.
 * 새 글은 보관(archived)으로 시작한다. 기존 임시저장(draft) 글은 상태를 바꾸지 않으면 draft로 유지한다.
 */
export const PUBLISHED = 'published'
export const ARCHIVED = 'archived'

export const STATUS_OPTIONS = [
  { value: PUBLISHED, label: '게시' },
  { value: ARCHIVED, label: '보관' },
]

export function isPublished(status) {
  return status === PUBLISHED
}

/** 화면에서 쓰는 상태 키: 'published' 또는 'archived'(draft 포함). */
export function toStatusKey(status) {
  return isPublished(status) ? PUBLISHED : ARCHIVED
}

export function getStatusLabel(status) {
  return isPublished(status) ? '게시' : '보관'
}
