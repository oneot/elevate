import { useState, useRef, useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import CollapsibleCodeBlockExtension from './CollapsibleCodeBlockExtension'
import { createLowlight } from 'lowlight'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import bash from 'highlight.js/lib/languages/bash'
import html from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Image as ImageIcon,
  Minus,
  Undo,
  Redo,
  RemoveFormatting,
} from 'lucide-react'

// lowlight 인스턴스에 지원할 언어를 등록한다.
// 같은 언어에 여러 별칭(js/javascript, ts/typescript 등)을 등록해
// 코드 블록의 언어 표기 방식에 유연하게 대응한다.
const lowlight = createLowlight()
lowlight.register('javascript', javascript)
lowlight.register('js', javascript)
lowlight.register('typescript', typescript)
lowlight.register('ts', typescript)
lowlight.register('python', python)
lowlight.register('bash', bash)
lowlight.register('sh', bash)
lowlight.register('html', html)
lowlight.register('xml', html)
lowlight.register('css', css)
lowlight.register('json', json)

const COLOR_PALETTE = [
  { label: '빨강', value: '#EF4444' },
  { label: '주황', value: '#F97316' },
  { label: '노랑', value: '#EAB308' },
  { label: '초록', value: '#22C55E' },
  { label: '파랑', value: '#3B82F6' },
  { label: '보라', value: '#8B5CF6' },
  { label: '핑크', value: '#EC4899' },
  { label: '회색', value: '#6B7280' },
  { label: '검정', value: '#1F2937' },
  { label: '연회색', value: '#94A3B8' },
]

const ToolbarButton = ({ icon: IconComponent, onClick, isActive, title, disabled = false }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`rounded p-1.5 transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-ms-blue ${
      isActive
        ? 'bg-neutral-200 text-neutral-900 shadow-inner'
        : 'hover:bg-neutral-100 bg-transparent text-neutral-700'
    }`}
  >
    <IconComponent size={18} />
  </button>
)

const Divider = () => <div className="w-px h-5 bg-neutral-300 mx-1" />

function ColorPicker({ editor }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const currentColor = editor.getAttributes('textStyle').color || null

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        title="글자 색상"
        aria-label="글자 색상"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="color-picker-popover"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded p-1.5 transition-colors hover:bg-neutral-100 bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-ms-blue"
      >
        <span className="flex flex-col items-center leading-none">
          <span className="font-bold text-sm text-neutral-700">A</span>
          <span
            className="block h-1 w-4 rounded-full mt-0.5"
            style={{ background: currentColor || '#1F2937' }}
          />
        </span>
      </button>

      {open && (
        <div id="color-picker-popover" className="absolute top-full left-0 mt-1 z-50 bg-white border border-neutral-200 rounded-lg shadow-lg p-2 w-36">
          <div className="grid grid-cols-5 gap-1 mb-2">
            {COLOR_PALETTE.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                title={label}
                aria-label={label}
                aria-pressed={currentColor === value}
                onClick={() => {
                  editor.chain().focus().setColor(value).run()
                  setOpen(false)
                }}
                className="w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform"
                style={{
                  background: value,
                  borderColor: currentColor === value ? '#3B82F6' : '#e5e7eb',
                }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().unsetColor().run()
              setOpen(false)
            }}
            className="w-full text-xs text-neutral-500 hover:text-neutral-800 py-0.5"
          >
            색상 초기화
          </button>
        </div>
      )}
    </div>
  )
}

function HtmlEditor({ value, onChange, onUploadImage }) {

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // CodeBlockLowlight로 대체
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-blue-600 underline hover:text-blue-800',
          },
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      CollapsibleCodeBlockExtension.configure({
        lowlight,
      }),
      TextStyle,
      Color,
    ],
    content: value || '',
    onUpdate: ({ editor: currentEditor }) => {
      onChange?.(currentEditor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          'min-h-80 rounded-lg px-4 py-3 text-base focus:outline-none',
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    const next = value || ''
    if (current !== next) {
      editor.commands.setContent(next, false)
    }
  }, [editor, value])

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('링크 URL을 입력하세요', previousUrl || '')

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const addImage = () => {
    if (!onUploadImage) {
      // onUploadImage 핸들러가 없으면 URL 직접 입력 방식으로 폴백한다.
      const url = window.prompt('이미지 URL을 입력하세요')
      if (url) {
        editor.chain().focus().setImage({ src: url }).run()
      }
      return
    }

    // 파일 선택 input을 동적으로 생성해 파일 피커를 열고,
    // 선택된 파일 각각을 onUploadImage로 업로드한 뒤 에디터에 삽입한다.
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = async () => {
      const files = Array.from(input.files || [])
      if (files.length > 0) {
        for (const file of files) {
          try {
            const url = await onUploadImage(file)
            if (url) {
              editor.chain().focus().setImage({ src: url }).run()
            }
          } catch {
            alert(`${file.name} 이미지 업로드에 실패했습니다.`)
          }
        }
      }
    }
    input.click()
  }

  if (!editor) {
    return null
  }

  return (
    <div className="rounded-md border border-neutral-300 bg-white shadow-elevation-2 focus-within:border-ms-blue focus-within:ring-1 focus-within:ring-ms-blue transition-shadow duration-200">
      <div className="max-h-[70vh] overflow-y-auto">
        {/* 툴바 - 스크롤 컨테이너 내에서 sticky */}
        <div className="border-b border-neutral-200 bg-[#f3f2f1] p-1 sticky top-0 z-10">
          <div className="flex flex-wrap gap-0.5 items-center px-1">
            {/* 실행취소/다시실행 */}
            <ToolbarButton
              icon={Undo}
              onClick={() => editor.chain().focus().undo().run()}
              isActive={false}
              title="실행취소 (Ctrl+Z)"
              disabled={!editor.can().undo()}
            />
            <ToolbarButton
              icon={Redo}
              onClick={() => editor.chain().focus().redo().run()}
              isActive={false}
              title="다시실행 (Ctrl+Shift+Z)"
              disabled={!editor.can().redo()}
            />

            <Divider />

            {/* 텍스트 서식 */}
            <ToolbarButton
              icon={Bold}
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="굵게 (Ctrl+B)"
            />
            <ToolbarButton
              icon={Italic}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="기울임 (Ctrl+I)"
            />
            <ToolbarButton
              icon={Strikethrough}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="취소선"
            />
            <ToolbarButton
              icon={Code}
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              title="인라인 코드"
            />

            <Divider />

            {/* 제목 */}
            <ToolbarButton
              icon={Heading1}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
              title="제목 1"
            />
            <ToolbarButton
              icon={Heading2}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
              title="제목 2"
            />
            <ToolbarButton
              icon={Heading3}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
              title="제목 3"
            />

            <Divider />

            {/* 목록 */}
            <ToolbarButton
              icon={List}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="글머리 목록"
            />
            <ToolbarButton
              icon={ListOrdered}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="번호 목록"
            />

            <Divider />

            {/* 블록 요소 */}
            <ToolbarButton
              icon={Quote}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="인용"
            />
            <ToolbarButton
              icon={Code}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive('codeBlock')}
              title="코드 블록"
            />
            <ToolbarButton
              icon={Minus}
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              isActive={false}
              title="구분선"
            />

            <Divider />

            {/* 링크 & 이미지 */}
            <ToolbarButton
              icon={Link2}
              onClick={setLink}
              isActive={editor.isActive('link')}
              title="링크"
            />
            <ToolbarButton
              icon={ImageIcon}
              onClick={addImage}
              isActive={false}
              title="이미지"
            />

            <Divider />

            {/* 글자 색상 */}
            <ColorPicker editor={editor} />

            <Divider />

            {/* 서식 지우기 */}
            <ToolbarButton
              icon={RemoveFormatting}
              onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
              isActive={false}
              title="서식 지우기"
            />
          </div>
        </div>

        {/* 에디터 */}
        <div className="p-4 bg-white cursor-text" onClick={() => editor.commands.focus()}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}

export default HtmlEditor
