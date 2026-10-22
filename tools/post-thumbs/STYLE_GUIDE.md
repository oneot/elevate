# UI 미니어처 썸네일 — 스타일 가이드

Elevate 블로그(microsoft-elevate.com) 게시글 카드 썸네일을 **"UI 미니어처"** 스타일로 만든다.
각 썸네일은 게시글이 다루는 기능 화면을 **크고 단순하게 다시 그린 제품 샷**이다.
새 카드는 **v3 플루이드** 스킨으로 그린다(아래 'v3 플루이드'). Microsoft 365 아이콘 리프레시("Fluid forms, vibrant colors")처럼
부드럽게 접히는 3D 형태, 인접색이 선명하게 이어지는 그라데이션, 새 스타일 앱 아이콘 타일로 같은 제품 샷을 더 밝고 경쾌하게 보여 준다.
먼저 공개된 80개 카드(v2 소프트 글래스)는 그대로 두며, 그 장면들은 글 내용을 구체적으로 보여 주는 밀도·말투의 기준이다.
작업 전에 `node render.mjs review <앱>`으로 같은 앱 카드를 먼저 본다(지금 키트로 그리므로 v3 스킨으로 보인다. 구성은 v3 규칙을 따른다).
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
  app/                     카테고리 앱 아이콘 (새 스타일, 글자판)
  assets/fluid/<cat>/      v3 유동 형태 (fold, ribbon, sphere, bubbles WebP). `python3 make_fluid.py`로 만든다. palette.json = 앱별 색 램프
  assets/glass/<cat>/      v2 유리 오브젝트 (640px WebP), assets/mascots/ GitHub 마스코트
  review/                  렌더 결과 (저장소에 넣지 않음)
```

## 확인 방법

```
node render.mjs review <cat>        # review/<cat>.png : 실제 카드 크기(≈342px) 2배 해상도
node render.mjs zoom <cat>/<slug>   # review/zoom_<cat>__<slug>.png : 960px 확대본, review/card_<cat>__<slug>.png : 실제 카드 480px
node render.mjs export <cat>/<slug> # Elevate.Web/src/assets/post-thumbs/<cat>/<slug>-960.webp, -480.webp
node render.mjs … --skin v2         # 처음 80개 카드의 v2 스킨으로 그린다 (기본은 v3)
```
- 글꼴은 macOS 시스템 글꼴(SF Pro, Apple SD Gothic Neo)이다. 기존 카드와 같게 그리려면 macOS에서 렌더한다(Actions도 macOS 러너).
- 렌더 후 **반드시 view 도구로 이미지를 열어** 실제 카드 크기에서 확인한다.
- 출력되는 `! audit:` 경고(잘린 글자, 무대 밖 pill, 없는 아이콘, AI 장면의 v3 규칙)는 모두 해결한다. 다른 카테고리의 "no scene yet"은 무시.

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
| `K.mascot(name,{x,y,right,bottom,w,z,rotate,flip})` | GitHub 마스코트 머리 (`assets/mascots/`: `mona-*`, `copilot-*`, `ducky-*`). `flip:true` 좌우 반전. 창 뒤에서 내다보게 하려면 창에 `z:2`, 마스코트에 `z:1`. GitHub AI 장면은 배정된 1–2마리를 아래 'GitHub 마스코트' 크기로 |
| `K.pos({...})` | 위치 style 문자열 |
| `K.tile({x,y,right,bottom,s,app,plinth,rotate,z})` | **v3 앱 타일**: 새 스타일 앱 아이콘(글자판)을 얹은 유리 타일. 장면당 1개, 주 화면 모서리에 걸쳐 띄운다(`s` 기본 10). `plinth:true`면 흰 받침대 위에 선다 |
| `K.float({x,y,right,bottom,s,icon,app,text,square,far,z})` | **v3 떠 있는 조각**: 작은 유리 원(또는 `square`)에 Fluent 아이콘·앱 아이콘(`app:true`/`'teams'`)·짧은 숫자(`text`)를 앱 그라데이션으로. 0–2개 |
| `K.form(shape,{x,y,right,bottom,w,rotate,flip,far,z})` | **v3 유동 형태** 직접 놓기: `fold`(접힌 시트) `ribbon`(리본) `sphere`(구) `bubbles`(방울). 보통은 장면 옵션 `deco`로 충분 |

kit.css 클래스: `.row .col .grow .pad .sep .soft .hl(강조 테두리) .t-num .t-h .t-h2 .t-b .t-m .t-s .t-xs .t-tint .nowrap`,
`.toggle(.on) .check(.on) .radio(.on) .progress>i(--p)`, `.code`(토큰 `.ln .k .s .f .c .n .t .a`), `.term`(`.p .m .y .b`),
`.phone > .phone__screen`(`--w`로 너비), `.slide`, `.page`, `.xl`(엑셀 격자: `--cols`, 셀 `.h .th .r .sel`), `.node`(+`.ni` 아이콘 칸, `small`), `.vid`(+`.name`, `--a --b` 그라데이션).
색 변수: `--green --amber --red --pink --blue --ink(-2,-3,-4) --line --fill`.

## 디자인 규칙 (꼭 지킬 것)

1. **한 장면 = 한 가지 메시지.** 글의 핵심 기능 화면 하나를 크게. 그 기능의 "결과/핵심 요소"(점수, 강조된 행, 생성된 결과, 설정 스위치 등)가 초점이 되게 한다.
2. **구성 (v3)**: 주 화면(창·휴대폰·슬라이드·문서) 1개가 무대 너비의 **58–72%**를 차지하고, 보통 아래나 한쪽 가장자리로 살짝 잘려 깊이를 준다.
   반대쪽(약 1/3)은 비워 큰 유동 형태가 보이게 하고, 보조 요소(떠 있는 카드·팝오버·메뉴) 최대 1–2개는 그 형태 위에 걸치게 둔다.
   **pill은 장면당 정확히 1개** (짧게, 한국어 12자 안팎, 글의 효용).
3. **같은 카테고리 안에서 구성을 반복하지 않는다.** 창 위치(왼쪽/오른쪽/가운데), 휴대폰, 카드 여러 장+연결선, 대화 상자, 어두운 창 등을 섞는다. pill 위치도 다양하게(오른쪽 위가 기본, 왼쪽 아래 등).
4. **글자 (480px 카드 기준)**: 핵심 라벨 ≥ 2.6cqw, 보조 ≥ 2.0cqw, 어떤 글자도 1.8cqw 미만 금지(아바타 이니셜·차트 눈금 포함). 큰 숫자 6–8cqw.
   한 장면의 글자 덩어리는 **12개 안팎**(16개를 넘으면 audit 경고). 나머지는 `K.skel` 막대로. 말줄임·잘린 글자 금지 (audit 경고 0).
   480px로 줄인 `review/card_<id>.png`에서 핵심 글자 2–3개가 바로 읽혀야 한다.
5. **내용은 글 본문(post.md)에 근거**: 실제 제품(한국어 UI)의 메뉴·버튼 이름을 쓴다 (예: Teams "게시물/파일/과제/성적", Forms "새 양식/새 퀴즈/응답", Excel "홈/삽입/데이터"). 예시 데이터는 학교 맥락(학년·반·수행평가·현장체험학습·학부모 상담 등). 실존 인물 이름·사진·외부 로고 이미지 금지 (아바타는 성 한 글자나 "1반" 같은 이니셜).
6. **색 (v3)**: 강조는 앱 색 `rgb(var(--tint))`과 인접색 그라데이션 `var(--grad)`(앱 색 → 밝은 인접색). 무대와 유동 형태의 색 램프는 `--f1`(밝은)–`--f4`(깊은)이다.
   의미 색(초록 완료, 주황 주의, 빨강 오류, 분홍)은 점·칩 정도로만. 배경은 kit의 무대 배경을 그대로 쓴다 (덮지 말 것). 주 화면은 유리라 뒤의 색이 은은하게 비친다.
7. **다듬기**: 창 안 여백 2.6–3.4cqw, 요소 간격 일정하게, 정렬 맞춤. 창이 무대 밖으로 나갈 땐 의도적으로 한쪽만. 장식용 아이콘 남발 금지.
8. 외부 이미지·폰트·네트워크 사용 금지 (icons/, app/ 만). 화면 글자에도 `http://`·`https://`를 쓰지 않는다(장면 검사에서 외부 URL로 거부된다). 주소는 `oneot.github.io/ai`처럼 도메인부터 쓴다.
9. **앱 타일 (v3)**: `K.tile()`을 **정확히 1개**. 크기 9–12cqw로 주 화면의 위쪽 모서리(왼쪽 위가 기본)에 반쯤 걸쳐 띄운다.
   새 스타일 앱 아이콘(글자판)이 앱 정체성을 맡으므로, 타일이 걸친 창은 제목 표시줄 아이콘을 끄고(`icon: false`) 그만큼 왼쪽 여백을 둔다.
   가운데 정렬 구성(개념·소개 글)이면 `plinth: true`로 받침대 위에 세워도 된다. 다른 앱이 주인공이면 `app: 'teams'`처럼 바꾼다.
10. **유동 형태 (v3)**: 무대 뒤의 큰 형태 1개와 작은 형태 1개는 kit이 자동으로 깐다. 장면 옵션 `deco: { big, v }`로 글에 맞는 형태와 자리를 고른다.
    `fold`(접힌 시트: 문서·페이지·쓰기), `ribbon`(리본: 흐름·연결·자동화·AI), `sphere`(구: 결과·데이터·초점), `bubbles`(방울: 사람·소통·협업).
    `v`는 큰 형태 기준 0 오른쪽 아래, 1 왼쪽 아래, 2 오른쪽 위, 3 왼쪽 위. 비워 둔 쪽에 오게 고르고, 핵심 글자 바로 뒤에는 두지 않는다.
11. **놀이 요소 (v3)**: `K.float()` 0–2개(최대 3)를 주 화면 가장자리 바깥에 띄워 글과 관련된 작은 조각을 보여 준다(완료 체크, 반짝임, 알림 수, 다른 앱 아이콘 등).
    핵심 글자를 가리지 않는다. 하나쯤은 `far: true`로 흐리게 해 깊이를 줘도 된다. 장식용 아이콘 남발 금지.

GitHub 장면은 아래 'GitHub 마스코트' 절이 규칙 2(주 화면 크기)와 11(놀이 요소)보다 우선한다.

## 작업 순서

1. `node render.mjs review <앱>`으로 같은 앱의 기존 카드와 참고 장면 3개를 본다.
2. 글 본문 전체(`work/<cat>__<slug>/post.md`)를 읽고, 글마다 "무엇을 보여 줄지"(초점 요소 + pill 문구)와 어울리는 유동 형태(`deco`)를 정한다.
3. 장면을 작성하고 `zoom`으로 렌더해 960px(`zoom_`)과 480px 카드(`card_`)를 모두 본다 → 다듬기를 반복. `review`로 같은 앱 카드들 사이에서도 본다.
4. 모든 장면이 시안 수준(정돈·가독·관련성·v3 느낌)이 될 때까지 고친다.

## 테마·마스코트 (2026-10-19 추가)

- **다크 테마**: `kit.js`의 카테고리 팔레트에 `dark: { tint, solid }`가 있으면 무대에 `.tD.dark`가 붙는다.
  지금은 **Copilot Studio만 다크**(v2 위의 '밝은 유리 다크', 아래 섹션). 나머지는 라이트.
- **마스코트**: GitHub 장면은 Mona·Copilot·Ducky 중 글마다 배정된 1–2마리를 크게 넣는다(아래 'GitHub 마스코트'). 창 가장자리에서 내다보거나 카드 위에 앉히고, 핵심 글자는 가리지 않는다.
- 한 카테고리만 다시 내보내기: `node render.mjs export --cat copilot-studio,github`

## GitHub 마스코트 (2026-10-22, GitHub 장면만)

사용자 요청: "깃허브 게시물들은 첨부한 마스코트들이 조금 더 크게 배치가 되어서 다른 게시물들보다 조금 더 귀여운 느낌이 나면 좋을 것 같아."
"마스코트가 글 당 1-2마리 랜덤하게 들어가면 좋을 듯". 다른 앱의 규칙은 그대로다.

- **배정은 코드가 한다**: 글마다 1–2마리를 무작위로 고른다(`lib/mascots.mjs`). 다른 GitHub 글이 덜 쓴 캐릭터와 자세를 먼저 골라 카드 목록에서 되풀이되지 않게 한다.
  두 마리면 서로 다른 캐릭터이고 첫째가 주인공이다. 작업 지시의 'GitHub 마스코트'에 적힌 이름만 그대로 쓴다.
  고른 결과는 글 버전 기록(`sources/github/<slug>.json`의 `mascots`)에 남는다.

  | 캐릭터 | 자세 (`K.mascot` 이름) |
  | --- | --- |
  | Copilot | `copilot-front` `copilot-34` `copilot-side` `copilot-turn` `copilot-down` |
  | Ducky | `ducky-front` `ducky-side2` `ducky-side` `ducky-down` `ducky-up` |
  | Mona | `mona-front` `mona-34` `mona-side` `mona-34b` `mona-tilt` |

- **크게**: 주인공 w 22–28cqw(최소 20), 둘째 w 15–19cqw(최소 14, 주인공보다 작게). 어떤 마스코트도 30cqw를 넘지 않는다. 지금까지의 w 11보다 확실히 크게.
- **자리 만들기**: 주 화면은 무대 너비의 52–64%로 조금 줄이고, `K.float`는 0–1개만 둔다(마스코트가 놀이 요소를 맡는다). 앱 타일과 pill은 그대로 1개씩.
- **화면과 어울리게**: 창 모서리 뒤에서 내다보기(창 `z: 2`, 마스코트 `z: 1`), 창·카드 윗변에 앉히기(카드보다 위 z, 아래쪽을 윗변에 살짝 걸침), 무대 가장자리에서 들어오기.
  옆을 보는 자세는 주 화면 쪽을 보게 `flip`한다. 두 마리면 서로 다른 자리에 둔다(예: 하나는 창 모서리, 하나는 카드 위).
- **가리지 않기**: 마스코트마다 60% 이상 보이고 얼굴이 가려지지 않게 한다. 글자와 앱 타일을 덮지 않는다.
- **audit** (`zoom`·`export`, GitHub AI 장면): 배정과 다른 마스코트, 크기, 보이는 비율, 흐림·투명, 덮은 글자·앱 타일, `K.float` 수.
  렌더러가 마스코트마다 맨 위로 올린 무대와 숨긴 무대를 찍어 실제로 보이는 픽셀을 센다(유리 창 뒤에 비치거나 무대 밖으로 잘린 부분은 보이지 않는 것으로 센다). `validate.mjs`도 같은 검사를 다시 한다.

```js
// 창 오른쪽 위 모서리 뒤에서 내다보기 (창 z:2, 마스코트 z:1, 약 64% 보임)
K.win({ x: 4, y: 12, w: 58, h: 46, z: 2, … }) + K.mascot('mona-tilt', { x: 48, y: 0.5, w: 25, z: 1 })
// 카드 윗변에 앉히기 (카드 z:3보다 위, 옆모습을 창 쪽으로 flip)
K.card({ right: 4, y: 30, w: 32, … }) + K.mascot('ducky-side', { right: 9, y: 17, w: 16, z: 4, flip: true })
```

## v3 플루이드 (2026-10-21, 새 카드 기준)

사용자 요청: "앞으로 만들어지는 디자인들에서 이런 느낌이 나오면 좋을 것 같은데" + Microsoft Design, [Fluid forms, vibrant colors](https://microsoft.design/articles/fluid-forms-vibrant-colors/) (2025).
지금 카드의 장점(글 내용을 구체적으로 보여 주는 UI 미니어처)은 그대로 두고, 그 주변 세계를 글의 느낌으로 진화시켰다.

| 글의 핵심 | kit 반영 |
| --- | --- |
| 유동적인 형태: 날카로운 모서리·딱딱한 덩어리 대신 부드러운 접힘과 곡선 | 무대 뒤 3D 형태를 접힌 시트·리본·구·방울로 (`assets/fluid`, `make_fluid.py`, 유리 오브젝트와 같은 numpy 레이마칭) |
| 풍부하고 선명한 색: 인접색이 과감하게 이어지는 그라데이션, Copilot은 여러 색 | 앱별 색 램프 `--f1..--f4`(palette.json)로 무대·형태를 칠하고, 강조 채움 `--grad`도 인접색으로 잇는다. Copilot·M365는 Copilot 여러 색 |
| 단순함: 작은 크기에서도 읽힘 | 주 화면을 조금 줄이고 글자를 키웠다(규칙 2·4). AI 장면은 480px 카드 기준 audit를 받는다 |
| 입체감과 놀이성: 부드러운 3D, 빛과 그림자, 떠 있는 아이콘·미니 차트, 받침대·성좌 | 유동 형태의 스튜디오 조명, `K.float`, `K.tile({ plinth: true })` |
| 앱 정체성: 새 스타일 앱 아이콘(글자판) 유지 | `K.tile`: 앱 아이콘을 유리 타일에 얹어 주 화면 모서리에 띄운다. 공개 사이트의 썸네일 없는 카드(앱 아이콘 + 선명한 유동 그라데이션)와 같은 언어 |

- **스킨**: kit.js가 모든 무대에 `.fluid`를 붙인다. `--skin v2`(render.html?skin=v2)는 처음 80개 카드의 v2 스킨으로 그리며, 원래 키트와 바이트까지 같다.
  처음 80개 카드 이미지는 v2 그대로 둔다. 기존 장면의 `deco`는 그대로 쓰이고 유리 모양 이름은 가까운 유동 형태로 바뀐다(orb·pebble→sphere, blob→bubbles, torus→fold, capsule→ribbon).
- **AI 장면 audit (scenes/auto만)**: 1.8cqw 미만 글자, 글자 덩어리 16개 초과, pill ≠ 1, 앱 타일 ≠ 1, `K.float` 3개 초과, 무대 밖 타일. 사람이 쓴 80개 장면에는 적용하지 않는다.
  GitHub 장면은 마스코트 검사도 받는다(위 'GitHub 마스코트').
- **다크(Copilot Studio)**: 무대는 다크 그대로, 유동 형태·타일·조각도 같은 규칙이다. 장면 색은 `&.dark { … }`로 따로 준다(밝은 칠 위 흰 글자 금지).
- **kit 클래스**: v3 클래스는 `k-` 접두사(`.k-tile .k-tilebox .k-plinth .k-float`)다. 장면 CSS의 클래스 이름과 겹치지 않는다.
- **유동 형태 다시 만들기**: `python3 make_fluid.py [앱…] [--shapes fold,ribbon] [--sheet]` (numpy, Pillow). 형태는 한 번만 추적해 `.cache/fluid`에 두고 앱마다 색만 칠한다.

예시 (word/wordonline3를 v3 규칙으로 다시 그린 것, audit 경고 0):

```js
(() => {
  scene('word/wordonline3', (K) => {
    const msg = (av, c, who, text) => `<div class="cm">${K.avatar(av, { s: 4.4, c })}<div class="ct"><b>${who}</b><p>${text}</p></div></div>`;
    return K.win({
      x: 7, y: 9.5, w: 62, h: 50, title: '수행평가 안내', icon: false,
      barRight: `<span class="tb on">${K.ico('comment', { s: 2.8 })}메모</span>${K.btn('공유', { primary: true, icon: 'share' })}`,
      body: `<div class="cv"><div class="page pg">
        ${K.skel('46%', { h: 2.6, tint: true })}
        ${K.skel('92%')}${K.skel('80%')}
        <p class="mk">제출 기한: 10월 23일</p>
        ${K.skel('90%')}${K.skel('70%')}
      </div></div>`,
    })
      + K.card({
        x: 50, y: 20, w: 42, cls: 'th',
        body: `${msg('김', 'rgb(var(--tint))', '김 선생님', '기한을 하루 늦출까요?')}
          ${msg('이', '#7b61c9', '이 선생님', '좋아요, 반영할게요!')}`,
      })
      + K.tile({ x: 2.4, y: 3.4, s: 11 })
      + K.float({ right: 6, y: 6.5, icon: 'comment_checkmark' })
      + K.pill({ right: 4, bottom: 4.4, icon: 'comment', text: '메모로 함께 다듬기' });
  }, {
    deco: { big: 'fold', small: 'sphere', v: 0 },
    css: `
      .tb { display: inline-flex; align-items: center; gap: .7cqw; height: 4.6cqw; padding: 0 1.3cqw; border-radius: 1.2cqw; font-size: 2.4cqw; font-weight: 650; }
      .tb.on { background: color-mix(in srgb, rgb(var(--tint)) 10%, #fff); color: rgb(var(--tint)); }
      .win__bar { padding-left: 12cqw; }
      .win__bar .btn { padding: 1cqw 1.9cqw; font-size: 2.3cqw; }
      .cv { height: 100%; padding: 3cqw 0 0 5cqw; background: rgba(243, 243, 246, .7); }
      .pg { width: 40cqw; height: 100%; display: flex; flex-direction: column; gap: 1.9cqw; padding: 4.4cqw 4.4cqw 0; border-radius: 1cqw 1cqw 0 0; }
      .pg .skel:first-child { margin-bottom: 1cqw; }
      .mk { align-self: flex-start; padding: .4cqw .8cqw; border-radius: .4cqw; background: color-mix(in srgb, rgb(var(--tint)) 16%, #fff); box-shadow: inset 0 -.35cqw 0 rgb(var(--tint)); font-size: 2.8cqw; font-weight: 750; white-space: nowrap; }
      .th { z-index: 3; padding: 2.6cqw; display: flex; flex-direction: column; gap: 2.2cqw; }
      .cm { display: flex; gap: 1.5cqw; align-items: center; }
      .ct { display: flex; flex-direction: column; gap: .4cqw; }
      .ct b { font-size: 2.1cqw; font-weight: 700; color: var(--ink-3); }
      .ct p { font-size: 2.65cqw; font-weight: 650; color: var(--ink); white-space: nowrap; }
    `,
  });
})();
```

## v2 소프트 글래스 스킨 (2026-10-20, 처음 80개 카드)

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
