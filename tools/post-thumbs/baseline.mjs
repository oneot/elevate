#!/usr/bin/env node
/**
 * 공개 사이트 이미지가 있는데 글 버전 기록(sources/<앱>/<slug>.json)이 없는 글에 지금 내용을 기준으로 기록을 만든다.
 * 사람이 만든 기존 80개 썸네일처럼 파이프라인 밖에서 넣은 이미지를 '이 버전으로 그렸다'고 표시해,
 * 이후 글 내용이 바뀌면 plan이 새 버전을 만들 수 있게 한다.
 *   node baseline.mjs
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { REPO_ROOT, contentHash, fetchPostHtml, fetchPublishedPosts, readSource, thumbPaths } from './lib/posts.mjs'

let written = 0
for (const post of await fetchPublishedPosts()) {
  const paths = thumbPaths(post.key)
  if (!existsSync(join(REPO_ROOT, paths.large)) || readSource(post.key)) continue
  const record = {
    key: post.key,
    title: post.title,
    postUpdatedAt: post.updatedAt,
    contentHash: contentHash({ title: post.title, excerpt: post.excerpt, html: await fetchPostHtml(post) }),
    origin: 'manual',
  }
  const file = join(REPO_ROOT, paths.source)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, `${JSON.stringify(record, null, 2)}\n`)
  written += 1
}
console.log(`글 버전 기록 ${written}개를 만들었습니다.`)
