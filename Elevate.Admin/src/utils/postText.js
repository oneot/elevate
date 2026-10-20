/**
 * 공개 사이트가 화면에서 다듬어 보여 주는 게시글 제목·요약 (Elevate.Web/src/constants/postText.js를 그대로 쓴다).
 *
 * 공개 사이트는 서버에 저장된 문구가 원래 문구와 같을 때만 다듬은 문구로 바꿔 보여 준다.
 * 관리자도 같은 문구를 목록과 편집 화면에 보여 준다. 편집 화면에서 저장하면 이 문구가 서버에 저장되고,
 * 그 뒤로는 공개 사이트도 저장된 문구를 그대로 보여 주므로 두 화면이 계속 같다.
 */
import { getDisplayExcerpt, getDisplayTitle } from '../../../Elevate.Web/src/constants/postText.js'

/**
 * 공개 사이트와 같은 제목·요약을 담은 게시글 사본 (Elevate.Web toDisplayPost의 제목·요약 부분).
 * 원래 서버 문구는 serverTitle·serverExcerpt에 남겨 검색과 정렬에 쓴다.
 */
export function withDisplayText(post) {
  if (!post) return post
  const title = getDisplayTitle(post)
  const excerpt = getDisplayExcerpt(post)
  if (title === post.title && excerpt === post.excerpt) return post
  return {
    ...post,
    title,
    excerpt,
    serverTitle: post.serverTitle ?? post.title,
    serverExcerpt: post.serverExcerpt ?? post.excerpt,
  }
}
