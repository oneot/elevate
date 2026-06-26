# Deployment and Incident Runbook

## GitHub Pages Smoke Test

After deploy, verify these routes return `HTTP 200` and reference existing assets:

- `https://microsoft-elevate.com/`
- `https://microsoft-elevate.com/m365`
- `https://microsoft-elevate.com/program-news`

Manual command:

```bash
for route in / /m365 /program-news; do
  curl -sS -L -D - -o /tmp/elevate-route.html "https://microsoft-elevate.com${route}" | sed -n '1,8p'
  grep -Eo '/assets/[^"]+\.(js|css)' /tmp/elevate-route.html | sort -u
done
```

## Intermittent `/m365` Failure Capture

Ask reporter for:

- 발생 시각과 timezone
- URL
- OS/browser/version
- 일반 창 또는 시크릿 모드 여부
- Console 첫 오류 1-2줄
- Network에서 실패한 `/assets/*.js` 또는 `/assets/*.css` URL과 status
- 화면에 표시된 build id

## First Response

1. Ask user to try hard reload.
2. Ask user to retry in incognito mode with extensions disabled.
3. Compare failing asset URL hash with current deployed HTML asset hashes.

## Rollback Criteria

Disable chunk auto-recovery if either condition happens:

- Normal users enter repeated reload loops.
- `chunk_load_failed` appears repeatedly for the same session after one reload.

Rollback patch:

```js
// Elevate.Web/src/main.jsx
// Remove or comment out startChunkLoadRecovery() while preserving ErrorBoundary fallback.
```

## Four-Week Hosting Decision

After four weeks, review:

- `chunk_load_failed` count and affected route distribution
- support tickets requiring manual hard reload
- smoke test failures after deploy

If stale asset failures remain material, evaluate Azure Static Web Apps for stronger routing and cache header control.
