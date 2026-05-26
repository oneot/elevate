# Editor UX Improvements Design

**Date:** 2026-05-26  
**Branch:** `YoonKeumJae/editor-enhancements`  
**Scope:** `Elevate.Admin/src/components/editor/HtmlEditor.jsx`

---

## Problem

When writing long posts in the Admin editor, the toolbar scrolls out of view, making formatting buttons inaccessible. Additionally, there is no way to attach images by dragging them onto the editor, and any unsaved work is lost on accidental page refresh.

---

## Features

### 1. Sticky Toolbar (Editor-Internal Scroll)

**Approach:** CSS only — no JavaScript or new packages required.

- The toolbar div gets `sticky top-0 z-10` (Tailwind) so it stays pinned to the top of its scroll container.
- The editor content area gets `max-h-[70vh] overflow-y-auto` so the content scrolls independently while the toolbar remains visible.

**Outcome:** The editor box has a fixed max height. The user scrolls within the editor; the toolbar is always visible.

---

### 2. Drag-and-Drop + Clipboard Paste Image

**Approach:** React synthetic event handlers on the editor wrapper div.

**Events handled:**
- `onDragEnter` / `onDragOver` — set `isDragging = true` (show visual feedback)
- `onDragLeave` / `onDrop` — set `isDragging = false`
- `onDrop` — extract `dataTransfer.files`, filter `image/*`, upload each via `onUploadImage`, insert into editor
- `onPaste` — extract `clipboardData.files`, same upload flow

**Visual feedback (drag state):**
- Border changes to dashed blue (`border-dashed border-blue-400`)
- Background lightens to `bg-blue-50`
- Text label: "이미지를 여기에 놓으세요 ⬆" centered over the editor

**Error handling:**
- If `onUploadImage` is not provided, drag/paste silently falls through (no alert, no broken state).
- Upload failures show an alert per file (consistent with existing toolbar button behavior).

**No new npm packages needed.** Reuses the existing `onUploadImage` prop already used by the toolbar image button.

---

### 3. Auto-Save to localStorage (3-second Debounce)

**New prop:** `storageKey?: string` added to `HtmlEditor`.

**Save behavior:**
- On every `onUpdate` event, a 3-second debounce timer resets.
- After 3 seconds of inactivity, `localStorage.setItem(storageKey, html)` is called.
- If `storageKey` is not provided, auto-save is disabled.

**Restore behavior:**
- On mount, if `localStorage.getItem(storageKey)` exists and differs from the current `value` prop, a restore banner appears above the editor:
  > "저장되지 않은 작업이 있습니다. 복구하시겠어요?"  [복구하기] [버리기]
- **복구하기:** loads the saved content into the editor, clears localStorage entry.
- **버리기:** clears localStorage entry, dismisses banner.

**Clearing on explicit save:**
- The parent component is responsible for calling `localStorage.removeItem(storageKey)` after a successful API save.
- This keeps `HtmlEditor` stateless with respect to server persistence.

**localStorage key convention:** `post-draft-{postId}` for existing posts, `post-draft-new` for new posts. The parent component sets this.

---

## Component Interface Changes

```jsx
// Before
<HtmlEditor value={html} onChange={setHtml} onUploadImage={uploadFn} />

// After (storageKey is optional)
<HtmlEditor value={html} onChange={setHtml} onUploadImage={uploadFn} storageKey="post-draft-123" />
```

---

## Files Changed

| File | Change |
|------|--------|
| `Elevate.Admin/src/components/editor/HtmlEditor.jsx` | Sticky toolbar CSS, drag/paste handlers, auto-save logic |
| Parent components that render `HtmlEditor` | Pass `storageKey` prop, call `localStorage.removeItem` on save |

---

## Out of Scope

- Server-side draft persistence (localStorage only)
- Drag-and-drop reordering of blocks
- Auto-save status indicator in UI (e.g., "저장됨 3초 전") — can be added later
