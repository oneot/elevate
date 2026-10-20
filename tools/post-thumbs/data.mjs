#!/usr/bin/env node
/**
 * 공개 API에서 13개 앱의 게시된 글 목록을 받아 data/posts.json(렌더러가 쓰는 목록)을 다시 만든다.
 *   node data.mjs
 */
import { fetchPublishedPosts, writePostsData } from './lib/posts.mjs'

const posts = await fetchPublishedPosts()
console.log(`${writePostsData(posts)} — ${posts.length}개 글`)
