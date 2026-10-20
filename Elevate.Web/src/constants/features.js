/**
 * @file features.js
 * @description 화면 노출을 켜고 끄는 플래그 모음.
 */

/**
 * 'AI & M365 최신 정보'(/update)와 '행사 및 프로그램 소식'(/program-news) 노출 여부.
 *
 * 요즘 업데이트하지 않아 홈 화면 카드와 헤더 '소식' 메뉴에서 숨긴다.
 * 페이지·라우트·게시글은 그대로 남아 있어 주소로 직접 들어가면 열린다.
 * 다시 보이게 하려면 true로 바꾼다.
 */
export const SHOW_NEWS_SECTIONS = false;
