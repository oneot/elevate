# UI 미니어처 썸네일 — 스타일 가이드

Elevate 블로그(microsoft-elevate.com) 게시글 카드 썸네일을 **"UI 미니어처"** 스타일로 만든다.
각 썸네일은 게시글이 다루는 기능 화면을 **크고 단순하게 다시 그린 제품 샷**이다.
품질 기준은 이미 공개된 80개 카드다. 작업 전에 `node render.mjs review <앱>`으로 같은 앱 카드를 먼저 본다.
새 글의 장면은 GitHub Actions 'Post thumbnails'에서 AI가 이 가이드와 `TASK.md`를 따라 만든다 (README.md).

## 폴더

```
tools/post-thumbs/
  kit.css, kit.js          공용 스타일·헬퍼 (수정 금지)
  render.html, render.mjs  렌더러 (수정 금지)
  scenes/<category>.js     기존 80개 글의 장면 (사람이 쓴 것)
  scenes/auto/<cat>/<slug>.js  AI가 만든 장면 (글마다 한 파일. scenes/<category>.js의 같은 key보다 나중에 불려 덮어쓴다)
  sources/<cat>/<slug>.json    그 썸네일을 그린 글 버전(내용 지문). 글이 바뀌면 새 버전을 만든다
  data/posts.json          공개 글 목록 (key, title, excerpt …). `node data.mjs`로 만든다 (저장소에 넣지 않음)
  work/<cat>__<slug>/post.md  AI가 읽는 글 본문 전체 (`node prepare.mjs`, 저장소에 넣지 않음)
  node_modules/@fluentui/svg-icons/icons/  Fluent System Icons (20,000+ SVG, `npm ci`). 페이지에서는 icons/<이름>.svg
  app/                     카테고리 앱 아이콘
  assets/glass/<cat>/      유리 오브젝트 (640px WebP), assets/mascots/ GitHub 마스코트
  review/                  렌더 결과 (저장소에 넣지 않음)
```

## 확인 방법

```
node render.mjs review <cat>        # review/<cat>.png : 실제 카드 크기(≈342px) 2배 해상도
node render.mjs zoom <cat>/<slug>   # review/zoom_<cat>__<slug>.png : 960px 확대본
node render.mjs export <cat>/<slug> # Elevate.Web/src/assets/post-thumbs/<cat>/<slug>-960.webp, -480.webp
```
- 글꼴은 macOS 시스템 글꼴(SF Pro, Apple SD Gothic Neo)이다. 기존 카드와 같게 그리려면 macOS에서 렌더한다(Actions도 macOS 러너).
- 렌더 후 **반드시 view 도구로 이미지를 열어** 실제 카드 크기에서 확인한다.
- 출력되는 `! audit:` 경고(잘린 글자, 무대 밖 pill, 없는 아이콘)는 모두 해결한다. 다른 카테고리의 "no scene yet"은 무시.

## 장면 등록

각 카테고리 파일은 **IIFE로 감싼다** (모든 장면 파일이 같은 전역에서 로드되므로 이름 충돌 방지):

```js
(() => {
  scene('teams/teams-home', (K, c) => K.win({ … }) + K.pill({ … }), {
    css: `.hero { … }`,          // 이 장면에만 적용 (자동 스코프). 클래스는 자유롭게.
    after(stage, K) { … },        // (선택) 레이아웃 후 DOM 측정이 필요할 때 (예: 연결선)
  });
})();
```
- key = `<표시 카테고리>/<slug>` (data/posts.json의 `key`, 공개 글 주소와 같다).
- `c` = 카테고리 팔레트: `c.name`, `c.icon`, `c.tint`("r, g, b") 등. CSS에서는 `rgb(var(--tint))`.
- 참고 장면: `scenes/teams.js`(발표자 진행), `scenes/onenote.js`(캘린더), `scenes/forms.js`(섹션 분기).

## 좌표와 크기

- 무대는 16:9. **모든 크기는 cqw** (1cqw = 썸네일 너비의 1%). 가로 0–100, 세로 0–56.25.
- 숫자를 넘기면 cqw로 처리된다: `K.win({ x: 9, y: 10, w: 82, h: 52 })`.

## K 헬퍼 (kit.js)

| 헬퍼 | 설명 |
| --- | --- |
| `K.win({x,y,right,bottom,w,h,title,sub,icon,dark,body,barRight,bar,dots,cls})` | 제목 표시줄 있는 앱 창. `icon` 기본=카테고리 앱 아이콘, `'teams'` 등 다른 앱, `'ico:globe'` Fluent 아이콘, `false` 없음. `dark:true` 어두운 창(터미널·코드). `body`는 창 안 HTML. |
| `K.card({x,y,…,w,h,body,top,flat,cls})` | 제목 표시줄 없는 떠 있는 카드. `top:true`면 위쪽 색 띠. |
| `K.pill({x,y,right,bottom,icon,app,text,dark,tint})` | **장면당 하나**의 핵심 한 줄. `dark:true`(검정), `tint:true`(앱 색), 기본 흰색. |
| `K.ico(name,{s,c})` | Fluent 아이콘. `'send'`=send_24_filled, `'send:r'`=regular, 또는 전체 이름. `s`=크기(cqw), `c`=색 |
| `K.app(which,{s})` | 앱 아이콘 이미지 (m365, copilot, copilot-studio, teams, onenote, forms, onedrive, powerpoint, excel, word, minecraft, github, azure) |
| `K.chip(text,{dot,icon,tint,solid,line})` | 작은 알약 라벨 |
| `K.btn(text,{primary,line,icon})` | 버튼 |
| `K.skel(width,{tint,h})` | 회색 텍스트 자리 막대 |
| `K.avatar(text,{c,s})` | 원형 이니셜 |
| `K.ring({p,s,value,label,vs,c})` | 도넛 게이지 (`p` 0–100) |
| `K.bars(values,{on,h,gap,colors})` | 세로 막대 차트 (`values`는 % 높이) |
| `K.bubble(text,{me})` | 채팅 말풍선 (`me:true` 오른쪽 앱 색) |
| `K.prompt(text,{lead,icon})` | 입력창 + 보내기 버튼 |
| `K.wires(svgInner,{z})` + `K.curve(x1,y1,x2,y2,{c,w,dash,arrow,dot,bend})` | 연결선 (무대 좌표 cqw). `bend:'h'|'v'|'none'` |
| `K.cursor({x,y})` | 마우스 포인터 (끝점 x,y) |
| `K.mascot(name,{x,y,right,bottom,w,z,rotate,flip})` | GitHub 마스코트 머리 (`assets/mascots/`: `mona-*`, `copilot-*`, `ducky-*`). `flip:true` 좌우 반전. 창 뒤에서 내다보게 하려면 창에 `z:2`, 마스코트에 `z:1` |
| `K.pos({...})` | 위치 style 문자열 |

kit.css 클래스: `.row .col .grow .pad .sep .soft .hl(강조 테두리) .t-num .t-h .t-h2 .t-b .t-m .t-s .t-xs .t-tint .nowrap`,
`.toggle(.on) .check(.on) .radio(.on) .progress>i(--p)`, `.code`(토큰 `.ln .k .s .f .c .n .t .a`), `.term`(`.p .m .y .b`),
`.phone > .phone__screen`(`--w`로 너비), `.slide`, `.page`, `.xl`(엑셀 격자: `--cols`, 셀 `.h .th .r .sel`), `.node`(+`.ni` 아이콘 칸, `small`), `.vid`(+`.name`, `--a --b` 그라데이션).
색 변수: `--green --amber --red --pink --blue --ink(-2,-3,-4) --line --fill`.

## 디자인 규칙 (꼭 지킬 것)

1. **한 장면 = 한 가지 메시지.** 글의 핵심 기능 화면 하나를 크게. 그 기능의 "결과/핵심 요소"(점수, 강조된 행, 생성된 결과, 설정 스위치 등)가 초점이 되게 한다.
2. **구성**: 주 창(또는 휴대폰·슬라이드·문서) 1개가 무대 너비의 70–85%를 차지하고, 보통 아래나 오른쪽 가장자리로 살짝 잘려 나가 깊이를 준다. 보조 요소는 최대 1–2개(떠 있는 카드·팝오버·메뉴). **pill은 장면당 정확히 1개** (짧게, 한국어 12자 안팎, 글의 효용).
3. **같은 카테고리 안에서 구성을 반복하지 않는다.** 창 위치(왼쪽/오른쪽/가운데), 휴대폰, 카드 여러 장+연결선, 대화 상자, 어두운 창 등을 섞는다. pill 위치도 다양하게(오른쪽 위가 기본, 왼쪽 아래 등).
4. **글자**: 핵심 라벨 ≥ 2.4cqw, 보조 ≥ 1.85cqw, 큰 숫자 6–7cqw. 한 장면의 글자 덩어리는 12–15개 이하. 나머지는 `K.skel` 막대로. 말줄임·잘린 글자 금지 (audit 경고 0).
5. **내용은 글 본문(post.md)에 근거**: 실제 제품(한국어 UI)의 메뉴·버튼 이름을 쓴다 (예: Teams "게시물/파일/과제/성적", Forms "새 양식/새 퀴즈/응답", Excel "홈/삽입/데이터"). 예시 데이터는 학교 맥락(학년·반·수행평가·현장체험학습·학부모 상담 등). 실존 인물 이름·사진·외부 로고 이미지 금지 (아바타는 성 한 글자나 "1반" 같은 이니셜).
6. **색**: 강조는 카테고리 색 `rgb(var(--tint))` 하나. 의미 색(초록 완료, 주황 주의, 빨강 오류, 분홍)은 점·칩 정도로만. 배경은 kit의 무대 배경을 그대로 쓴다 (덮지 말 것).
7. **다듬기**: 창 안 여백 2.6–3.4cqw, 요소 간격 일정하게, 정렬 맞춤. 창이 무대 밖으로 나갈 땐 의도적으로 한쪽만. 장식용 아이콘 남발 금지.
8. 외부 이미지·폰트·네트워크 사용 금지 (icons/, app/ 만).

## 작업 순서

1. `node render.mjs review <앱>`으로 같은 앱의 기존 카드와 참고 장면 3개를 본다.
2. 글 본문 전체(`work/<cat>__<slug>/post.md`)를 읽고, 글마다 "무엇을 보여 줄지"(초점 요소 + pill 문구)를 정한다.
3. 장면을 작성하고 `review`로 렌더해 확인 → 다듬기를 반복. 필요하면 `zoom`으로 세부 확인.
4. 모든 장면이 시안 수준(정돈·가독·관련성)이 될 때까지 고친다.

## 테마·마스코트 (2026-10-19 추가)

- **다크 테마**: `kit.js`의 카테고리 팔레트에 `dark: { tint, solid }`가 있으면 무대에 `.tD.dark`가 붙는다.
  지금은 **Copilot Studio만 다크**(v2 위의 '밝은 유리 다크', 아래 섹션). 나머지는 라이트.
- **마스코트**: GitHub 장면은 Mona·Copilot·Ducky를 장면마다 1–2마리만 넣는다. 창 가장자리에서 내다보거나 카드 위에 앉히고, 핵심 글자는 가리지 않는다.
- 한 카테고리만 다시 내보내기: `node render.mjs export --cat copilot-studio,github`

## v2 소프트 글래스 스킨 (2026-10-20)

사용자 레퍼런스(이리데센트 유리 오브젝트, 흐린 그라데이션 카드, 글래스모피즘 패널, 검정 원형 버튼)에 맞춘 스킨. 장면 내용·배치는 v1 그대로이고 스킨만 바뀌었다.

- **무대**: 카테고리 색(`--m1..m4`)의 파스텔 그라데이션 + 흐린 글로우(`.tD::before`). `data-v`(0–3, 장면 key 해시)로 글로우를 좌우·상하 반전해 장면마다 달라 보이게 한다.
- **유리 오브젝트**: `assets/glass/<cat>/<shape>.webp` (`blob torus orb pebble capsule`. 원본은 numpy 레이마칭으로 만든 카테고리별 이리데센트 640px PNG이고, 저장소에는 640px WebP로 줄여 둔다).
  `renderScene`이 모든 장면 맨 뒤(`.deco`)에 큰 것 1개 + 작은 것 1개(살짝 흐림)를 자동으로 깐다. 위치·모양은 key 해시로 정해지고 창 뒤로 비친다.
  - 장면 옵션 `deco`: `false`(없음) · `{ v: 0–3 }`(배치 변형 고정) · `{ big: 'torus', small: false }` · `{ items: [['orb', { right: 4, y: 3, w: 8, far: true }], …] }`(직접 지정).
  - 변형: v0 큰 것 오른쪽 아래·작은 것 왼쪽 위, v1 좌우 반전, v2 상하 반전, v3 둘 다.
  - 직접 놓을 땐 `K.glass(shape, { x|right, y|bottom, w, rotate, far })`.
- **창·카드·노드**: 반투명 흰 유리(`--glass`) + `backdrop-filter`(`--frost`) + 흰 테두리(`--rim`), 큰 모서리(창 3cqw). 창의 신호등 점은 숨김.
- **pill**: 흰 유리 + 검정 원형 아이콘(`.pi`). `dark`/`tint` 변형 유지.
- **강조 채움**: `--grad`(tint→m2)는 `.tD`에 정의된다(장면 색을 따라가도록 `:root`가 아님). `.btn--primary .chip--solid .bubble--me .prompt .send .toggle.on .check.on .progress`가 쓴다.

## 밝은 유리 다크 (2026-10-20, Copilot Studio)

사용자 요청: "너무 어둡지는 않은 유리 다크". `kit.css` 끝의 `.tD.dark` 블록이 v2 스킨을 덮어쓴다. 라이트 카테고리에는 영향이 없다.
첫 시도(6장 평균 회색조 밝기 L≈79, 0–255)보다 밝은 L≈97로 맞췄다.

- **무대**: 딥 틸→인디고 그라데이션(`#21606a → #25566a → #384a78`) + 카테고리 글로우(opacity .95, saturate 140%).
- **유리**: 위는 흰빛(.21→.06), 아래로 갈수록 스모키(`--smoke` 14,40,54를 .14→.36)한 `--glass`. 밝은 글로우·오브젝트 위에서도 흰 글자가 읽힌다.
  창·카드·노드에 `::after` 그라데이션 테두리(왼쪽 위가 가장 밝음). pill도 스모크를 깔고 흰 원형 아이콘.
- **강조 채움**: 다크에선 `--grad` = 팔레트 `solid`(`#14a191 → #0d7d93`, 흰 글자 대비 확보). `.dark .bubble/.chip/.btn/.pill` 일반 규칙이
  `bubble--me` 등 강조 채움을 덮지 않도록 블록 맨 끝에 다시 지정한다(같은 특이성, 나중 규칙).
- 장면 쪽 다크 값은 `&.dark { … }`로 쓴다. 아이콘 색을 테마에 맞추려면 `K.ico(…, { c: 'var(--pink)' })`처럼 변수로 넘긴다(인라인 색은 CSS로 못 덮음).
- 흰 글자 카드 바로 뒤에 큰 오브젝트가 오면 글자가 씻겨 보인다. 그럴 땐 장면 `deco: { v: … }`로 오브젝트를 비운 곳으로 옮긴다(멀티 에이전트는 `v: 2`).
