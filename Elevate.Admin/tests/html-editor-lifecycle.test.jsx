// @vitest-environment jsdom
import { Activity, act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import HtmlEditor from '../src/components/editor/HtmlEditor.jsx'

let root
let host
let errors

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  localStorage.clear()
  errors = []
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host, {
    onCaughtError: (error) => errors.push(error),
    onUncaughtError: (error) => errors.push(error),
  })
})

afterEach(async () => {
  await act(() => root.unmount())
  host.remove()
  vi.unstubAllGlobals()
})

// 같은 요소를 다시 보여 주면 React는 HtmlEditor를 다시 렌더하지 않고 이펙트만 다시 연결한다 (실제 화면과 같은 경로).
const editorElement = <HtmlEditor value="<p>Existing body</p>" onChange={() => {}} storageKey="post-draft-new" />

function renderEditor(mode) {
  return act(() => root.render(<Activity mode={mode}>{editorElement}</Activity>))
}

// React가 표시하던 화면을 숨겼다가(Suspense 대체 화면, 라우트 전환 등) 다시 보여 주면 이펙트가 다시 연결된다.
// 숨겨진 동안 Tiptap은 마운트가 끊긴 인스턴스를 1ms 뒤 파괴하므로, 다시 연결된 이펙트가 파괴된 인스턴스를 받는다.
// 새 글 화면이 이 경우 "Cannot read properties of null (reading 'cached')"로 깨졌다.
it('keeps working when React reveals an editor whose previous Tiptap instance was already destroyed', async () => {
  await renderEditor('visible')
  expect(host.querySelector('.ProseMirror')?.textContent).toBe('Existing body')
  await renderEditor('hidden')
  await act(() => new Promise((resolve) => setTimeout(resolve, 20)))
  await renderEditor('visible')
  await act(() => new Promise((resolve) => setTimeout(resolve, 20)))

  expect(errors).toEqual([])
  expect(host.querySelector('.ProseMirror')?.textContent).toBe('Existing body')
})
