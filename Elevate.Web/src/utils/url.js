/**
 * @file url.js
 * @description URL 문자열 처리 유틸리티 모음.
 *
 * 현재는 `http://` 또는 `https://` 프로토콜이 없는 URL에 자동으로 `https://`를 앞에 붙이는
 * `normalizeUrl` 함수만 포함한다.
 */

/**
 * URL을 정규화합니다 (http/https 프로토콜 추가)
 * @param {string} url - 정규화할 URL
 * @returns {string} 정규화된 URL
 */
export const normalizeUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return "https://" + url.replace(/^\/+/, "");
};

/**
 * ISO8601 날짜 문자열을 한국어 형식으로 변환한다.
 *
 * @param {string|null|undefined} dateStr - ISO8601 날짜 문자열 (예: "2026-04-09T00:00:00Z")
 * @returns {string} 한국어 날짜 문자열 (예: "2026년 4월 9일"), 변환 실패 시 원본 반환
 */
export const formatDateKo = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Seoul' });
};
