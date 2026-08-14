// 게시글 본문 HTML에 남은 "고아 꼬리"를 제거한다.
//
// 배경: 첨부파일 읽기 SAS에는 Content-Disposition(rscd)이 포함되고, 그 값에는
// RFC 5987 규격상 filename*=UTF-8'' 형태의 리터럴 작은따옴표가 들어간다. 컨트롤러의
// BLOB_SAS_PATTERN은 문자 클래스에서 작은따옴표를 제외하므로 첫 작은따옴표에서 매치가
// 끊기고, SAS를 제거할 때 그 뒤 잔여물(''<퍼센트 인코딩된 파일명>)이 bare URL에 붙은 채
// 저장되었다. 이 잔여물이 다음 읽기에서 새로 발급한 SAS 뒤에 다시 이어붙어 rscd 값이
// 두 번 반복되고, Azure의 string-to-sign이 달라져 AuthenticationFailed가 발생했다.
//
// 발생 원인 자체는 storageClient.toHtmlSafeSasToken이 막지만, 이미 저장된 본문은
// 여기서 복구한다.

// 경로 문자 클래스에서 ? 와 # 를 제외한 이유: 살아 있는 SAS가 본문에 남아 있는 문서를
// 만나면 쿼리스트링 중간까지 캡처해 "잘린 반쪽 SAS"를 영구 저장하게 된다. 제외해 두면
// 캡처가 ? 에서 끝나고 다음 문자가 작은따옴표가 아니므로 매치 자체가 발생하지 않는다.
const BLOB_URL_TAIL_PATTERN =
  /(https?:\/\/[^\s"'<>]*\.blob\.core\.windows\.net\/[^\s"'<>?#]*)('[^\s"<>]*)/g;

// 꼬리에 '' 가 포함될 때만 제거한다.
//
// 잔여물은 rscd 값의 첫 작은따옴표 이후 전부이며 경우의 수는 둘뿐이다.
//   1. 첫 작은따옴표가 RFC 5987 구분자     -> 꼬리가 ''<enc> 로 시작한다
//   2. 첫 작은따옴표가 ASCII fallback 내부 -> 잔여물이 반드시 ...UTF-8'' 을 지난다
// 두 경우 모두 '' 를 포함한다. 반대로 정상 텍스트는 '' 를 만들지 않는다.
//   href='URL'>  -> 꼬리 '     /  URL's metadata -> 꼬리 's
// Cosmos patch에는 undo가 없으므로 이 가드가 무인 실행 안전성의 핵심이다.
function isOrphanTail(tail) {
  return typeof tail === 'string' && tail.includes("''");
}

function stripOrphanBlobUrlTails(html) {
  if (typeof html !== 'string' || html.length === 0) return html;

  BLOB_URL_TAIL_PATTERN.lastIndex = 0;
  return html.replace(BLOB_URL_TAIL_PATTERN, (match, url, tail) => (
    isOrphanTail(tail) ? url : match
  ));
}

function countOrphanBlobUrlTails(html) {
  if (typeof html !== 'string' || html.length === 0) return 0;

  BLOB_URL_TAIL_PATTERN.lastIndex = 0;
  let count = 0;
  let match;
  while ((match = BLOB_URL_TAIL_PATTERN.exec(html)) !== null) {
    if (isOrphanTail(match[2])) count += 1;
  }
  return count;
}

function hasOrphanBlobUrlTail(html) {
  return countOrphanBlobUrlTails(html) > 0;
}

function firstOrphanBlobUrlTail(html) {
  if (typeof html !== 'string' || html.length === 0) return null;

  BLOB_URL_TAIL_PATTERN.lastIndex = 0;
  let match;
  while ((match = BLOB_URL_TAIL_PATTERN.exec(html)) !== null) {
    if (isOrphanTail(match[2])) return match[2];
  }
  return null;
}

function shouldRepairPostContent(post, { force = false } = {}) {
  const content = post?.contentMarkdown;
  if (typeof content !== 'string' || content.length === 0) return false;
  if (!hasOrphanBlobUrlTail(content)) return false;
  if (force) return true;
  return stripOrphanBlobUrlTails(content) !== content;
}

function buildContentRepairPatch({ content }) {
  return [
    { op: 'set', path: '/contentMarkdown', value: content },
  ];
}

module.exports = {
  stripOrphanBlobUrlTails,
  countOrphanBlobUrlTails,
  hasOrphanBlobUrlTail,
  firstOrphanBlobUrlTail,
  shouldRepairPostContent,
  buildContentRepairPatch,
};
