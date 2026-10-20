import { createContext, useContext } from 'react'

/**
 * 관리자 화면 전체가 함께 쓰는 게시글 목록 상태 (AdminPostsProvider가 채운다).
 * @type {import('react').Context<null | {
 *   posts: Array<object>,
 *   byCategory: Record<string, Array<object>>,
 *   errors: Record<string, string>,
 *   initialized: boolean,
 *   loading: boolean,
 *   refresh: (options?: { ifOlderThan?: number }) => void,
 * }>}
 */
export const AdminPostsContext = createContext(null)

export function useAdminPosts() {
  const value = useContext(AdminPostsContext)
  if (!value) throw new Error('useAdminPosts must be used inside AdminPostsProvider')
  return value
}
