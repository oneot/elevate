# 배포 가이드 (DEPLOYMENT)

이 문서는 Microsoft Elevate Web 프로젝트의 로컬 빌드, 프리뷰, 그리고 프로덕션 배포 과정을 설명합니다.

---

## 빠른 시작

```bash
# 1. 저장소 클론
git clone https://github.com/oneot/elevate.git
cd elevate/Elevate.Web

# 2. 의존성 설치
npm install

# 3. 로컬 빌드
npm run build

# 4. 빌드 결과 미리보기
npm run preview

# 5. 배포 준비
# (호스팅 플랫폼에 따라 다름 - 아래 참고)
```

---

## 로컬 빌드

### 빌드 과정

#### 1단계: 게시글 JSON 생성 (자동)
```bash
npm run prebuild  # 또는 npm run generate-posts
```

- `scripts/generate-posts.js` 실행
- `posts/` 폴더의 마크다운 파일을 파싱
- `public/api/posts.json` 생성 (전체 포스트 메타)
- `public/api/posts/{category}--{slug}.json` 생성 (개별 포스트 상세)
- `public/images/` 폴더로 이미지 복사

**에러 처리**:
```bash
# YAML 파싱 에러 또는 파일 누락 시 메시지 출력
# 예: "Missing required field: title in posts/copilot/copilot.md"
```

#### 2단계: React 번들링 및 최적화
```bash
npm run build
```

- `src/` 폴더의 React 컴포넌트 번들링
- 코드 분할 (Code Splitting) 적용
- CSS/JS 최소화 (Minification)
- 소스맵 생성 (선택)
- 최종 산출물: `dist/` 디렉터리

**산출물 구조**:
```
dist/
├── index.html           # 진입점
├── assets/
│   ├── index-*.js       # 번들링된 JS
│   ├── index-*.css      # 번들링된 CSS
│   └── [사용자 에셋]
├── api/                 # 생성된 JSON 파일 (복사됨)
│   ├── posts.json
│   └── posts/
│       ├── copilot--copilot.json
│       ├── excel--excel-1.json
│       └── ...
└── images/             # 게시글 이미지 (복사됨)
    ├── copilot-banner-*.png
    ├── excel-screenshot-*.png
    └── ...
```

### 빌드 테스트

```bash
# 빌드 실행
npm run build

# 빌드 결과 로컬 미리보기
npm run preview

# 브라우저에서 http://localhost:4173 확인
```

**테스트 체크리스트**:
- [ ] 홈페이지가 잘 로드되는가?
- [ ] 블로그 목록이 나타나는가?
- [ ] 게시글 카드가 이미지와 함께 표시되는가?
- [ ] 게시글 상세 페이지 로드가 빠른가?
- [ ] 시리즈 사이드바가 정상 표시되는가?
- [ ] 모바일 뷰가 반응형으로 표시되는가?
- [ ] 외부 링크가 정상 작동하는가?

---

## 배포 전 체크리스트

배포 전에 반드시 확인:

### 콘텐츠 검증
- [ ] 모든 마크다운 파일이 `posts/<category>/` 아래에 있는가?
- [ ] 각 게시글에 `title` 필드가 있는가?
- [ ] Frontmatter가 유효한 YAML인가? (`---` 구분선 포함)
- [ ] 상대경로 이미지가 모두 마크다운 파일과 같은 디렉터리에 있는가?
- [ ] 외부 URL이 모두 HTTPS인가?
- [ ] `npm run generate-posts` 실행 시 에러가 없는가?
- [ ] `public/api/posts.json`이 생성되었는가?
- [ ] 시리즈 게시글의 `seriesOrder`가 모두 숫자인가?

### 코드 검증
- [ ] `npm run lint` 통과했는가?
- [ ] 깨진 이미지 링크가 없는가? (브라우저 DevTools 콘솔 확인)
- [ ] 콘솔 에러가 없는가?

### 빌드 검증
- [ ] `npm run build` 성공?
- [ ] `npm run preview`에서 모든 페이지 정상 작동?
- [ ] 빌드 크기가 합리적인가? (대략 <5MB 권장)

### SEO 및 메타데이터
- [ ] 각 페이지의 `<title>` 태그가 고유한가?
- [ ] 각 게시글의 `<meta description>`이 설정되었는가?
- [ ] 구조화된 데이터 (Schema.org)가 필요한가?

### 성능
- [ ] 라이트하우스 점수 확인 (Chrome DevTools)
- [ ] 최대 이미지 크기: 2MB 이하 권장
- [ ] 느린 네트워크에서 로딩 시간 확인

### 보안
- [ ] 민감한 정보(API 키, 비밀번호)가 코드에 노출되어있지 않은가?
- [ ] 외부 링크가 신뢰할 수 있는 도메인인가?
- [ ] HTTPS 전용 호스팅으로 설정되었는가?

---

## 호스팅 플랫폼별 배포

### Vercel (추천)

**장점**: Git 연동, 자동 배포, 캐시 자동 무효화, 무료 티어

#### 1단계: Vercel 프로젝트 생성
```
1. https://vercel.com으로 이동
2. "New Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정 > "Continue"
```

#### 2단계: 빌드 설정 확인
| 설정 | 값 |
|------|-----|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

#### 3단계: 배포
```bash
# 로컬에서
git push origin <branch>

# 또는 Vercel에서 수동 배포
# Vercel 대시보드 > "Redeploy"
```

**환경변수**: 특별히 필요한 환경변수는 없습니다.

**배포 후**:
```
https://<project-name>.vercel.app/
```

### Netlify

**장점**: CMS 통합 가능, 폼 처리, 자동 배포

#### 1단계: Netlify 프로젝트 생성
```
1. https://app.netlify.com으로 이동
2. "New site from Git" 클릭
3. GitHub 저장소 선택
4. 빌드 설정 입력
```

#### 2단계: 빌드 설정
| 설정 | 값 |
|------|-----|
| **Build Command** | `npm run build` |
| **Publish Directory** | `dist` |

#### 3단계: 배포
```bash
# 자동 배포 (Git push)
git push origin <branch>

# 또는 Netlify CLI 사용
npm install -g netlify-cli
netlify deploy
```

**환경변수**: 특별히 필요한 환경변수는 없습니다.

**배포 후**:
```
https://<site-name>.netlify.app/
```

### GitHub Pages

**장점**: 무료, GitHub과 통합, 커스텀 도메인 지원

#### 1단계: 저장소 설정
```
1. GitHub > Settings > Pages
2. Source: GitHub Actions
3. 아래 단계 진행
```

#### 2단계: 배포 스크립트 생성
`.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### 3단계: 배포
```bash
git push origin main

# GitHub Actions가 자동으로 빌드 및 배포
```

**배포 후**:
```
https://<username>.github.io/elevate/
```

### AWS S3 + CloudFront

**장점**: 높은 성능, 복잡한 설정 가능, 비용 제어 가능

#### 1단계: S3 버킷 생성
```bash
aws s3 mb s3://elevate-web --region us-east-1
```

#### 2단계: 정적 웹사이트 호스팅 활성화
```bash
aws s3 website s3://elevate-web \
  --index-document index.html \
  --error-document index.html
```

#### 3단계: 파일 업로드
```bash
aws s3 sync dist/ s3://elevate-web
```

#### 4단계: CloudFront 배포 생성
```
AWS Console > CloudFront > Create Distribution
Origin Domain: elevate-web.s3.amazonaws.com
Default Root Object: index.html
```

**배포 후**:
```
https://<distribution-id>.cloudfront.net
```

---

## 환경변수

현재 프로젝트는 특별한 환경변수가 필요하지 않습니다.

다만, 향후 다음과 같은 경우 환경변수를 추가할 수 있습니다:

```bash
# 예시: 외부 API 연동 시
VITE_API_BASE_URL=https://api.example.com
VITE_BOT_DIRECT_LINE_SECRET=<bot-framework-key>
```

환경변수는 `VITE_` 접두사로 시작해야 클라이언트 코드에서 접근 가능합니다:

```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

---

## 콘텐츠 업데이트 (배포 후)

### 게시글 추가/수정
```bash
# 1. 마크다운 파일 추가/수정
vim posts/<category>/<slug>.md

# 2. 로컬 테스트
npm run generate-posts
npm run build
npm run preview

# 3. 커밋 및 푸시
git add posts/
git commit -m "docs(<category>): add/update <slug>"
git push origin <branch>

# 4. PR 생성 및 병합
# (또는 직접 main에 푸시 - 자동 배포)
```

### 배포 후 캐시 무효화

#### Vercel
- 자동으로 무효화됨 (별도 설정 불필요)

#### Netlify
- 자동으로 무효화됨 (별도 설정 불필요)

#### GitHub Pages
- 자동으로 무효화됨 (별도 설정 불필요)

#### AWS S3 + CloudFront
```bash
# CloudFront 캐시 무효화
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/*"
```

---

## 모니터링 및 로깅

### 배포 상태 확인

#### Vercel
```
Dashboard > Deployments > [최신 배포]
```

#### Netlify
```
Deploys > [최신 배포]
```

#### GitHub Pages
```
Settings > Pages > Deployments
```

### 에러 추적

#### 클라이언트 에러
```
브라우저 DevTools 콘솔 (F12) 확인
```

#### 빌드 에러
```bash
npm run build 2>&1 | tee build.log

# 로그 파일 확인
cat build.log

# 호스팅 플랫폼의 빌드 로그 확인
```

### 성능 모니터링 (선택)

```javascript
// 향후 추가 가능: Google Analytics, Sentry 등
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
});
```

---

## 롤백 (배포 취소)

배포 후 문제가 발생한 경우:

### Vercel
```
Deployments > [이전 배포] > "Promote to Production"
```

### Netlify
```
Deploys > [이전 배포] > "Publish deploy"
```

### GitHub Pages
```bash
git revert <commit-hash>
git push origin main
```

### AWS S3 + CloudFront
```bash
# 이전 버전으로 재배포
aws s3 sync dist/ s3://elevate-web
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/*"
```

---

## 커스텀 도메인 설정

각 플랫폼에서 커스텀 도메인을 추가할 수 있습니다:

### Vercel
```
Project Settings > Domains > Add Domain
elevate.example.com
```

### Netlify
```
Site Settings > Domain Management > Add Custom Domain
elevate.example.com
```

### GitHub Pages
```
Settings > Pages > Custom Domain
elevate.example.com
```

### DNS 설정 (공통)
도메인 DNS 레코드에 다음을 추가:

| 타입 | 이름 | 값 |
|------|------|-----|
| CNAME | elevate | `<platform-url>` |

DNS 결과 확인:
```bash
nslookup elevate.example.com
dig elevate.example.com CNAME
```

---

## 트러블슈팅

### 빌드 실패

**문제**: `npm run build`에서 에러 발생
```bash
# 1. 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# 2. 캐시 정리
npm cache clean --force

# 3. 빌드 재실행
npm run build
```

**일반적인 에러**:
```
Error: ENOENT: no such file or directory
→ 파일 경로 확인 (상대/절대 경로)

Error: Cannot find module
→ `npm install` 재실행

Syntax error in Frontmatter
→ POSTS_GUIDE.md 참고, YAML 형식 확인
```

### 배포 후 페이지가 로드되지 않음

**문제**: 배포는 성공했지만 페이지가 빈 화면
```
1. 브라우저 DevTools 콘솔 에러 확인
2. 네트워크 탭에서 리소스 로딩 상태 확인
3. 캐시 비우기 (Ctrl+Shift+Delete)
4. CloudFront의 경우, 캐시 무효화 (위 참고)
```

### 이미지가 표시되지 않음

**문제**: `404 Not Found` 또는 이미지 로드 실패
```bash
# 1. 이미지 파일이 public/images/에 있는가?
ls public/images/

# 2. JSON에서 imageUrl 필드 확인
cat public/api/posts.json | grep imageUrl

# 3. 이미지 경로에서 특수문자 확인
# 상대경로는 ./images/file.png가 아니라 ./file.png여야 함
```

### 시리즈가 표시되지 않음

**문제**: PostList에서 SeriesNavigator가 나타나지 않음
```bash
# 1. JSON의 seriesByCategory 확인
cat public/api/posts.json | jq '.seriesByCategory'

# 2. 조건 확인: 같은 시리즈에 2개 이상의 게시글이 있는가?
# 3. series 필드와 seriesOrder 필드가 모두 있는가?
```

---

## 성능 최적화 팁

### 이미지 최적화
```bash
# WebP로 변환 (선택)
cwebp input.png -o input.webp

# 크기 감소 (ImageMagick)
convert input.png -resize 800x600 output.png
```

### 번들 크기 분석
```bash
npm install --save-dev vite-plugin-visualizer

# 빌드 후 시각화
# dist/stats.html 확인
```

### 캐싱 전략
- `index.html`: 캐시 비활성화 (Always validate)
- `assets/*.js`, `assets/*.css`: 장기 캐시 (1년)
- `api/posts.json`: 중기 캐시 (1시간 ~ 1일)

---

## 관련 문서

- [프로젝트 개요](README.md)
- [아키텍처](ARCHITECTURE.md)
- [게시글 작성 가이드](POSTS_GUIDE.md)
- [컴포넌트 설명](COMPONENTS.md)
- [기여 가이드](CONTRIBUTING.md)

---

## 지원

배포 중 문제가 발생하면:
1. 위의 트러블슈팅 섹션 참고
2. 호스팅 플랫폼의 문서 참고
3. GitHub Issues에서 기존 이슈 검색
4. 새 이슈 생성 (관리자에게 할당)
