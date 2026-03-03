import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
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

const lowlight = createLowlight(common)

// ToolbarButton 컴포넌트를 외부로 이동
// eslint-disable-next-line no-unused-vars
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

// Divider 컴포넌트를 외부로 이동
const Divider = () => <div className="w-px h-5 bg-neutral-300 mx-1" />

function HtmlEditor({ value, onChange, onUploadImage }) {

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // CodeBlockLowlight로 대체
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
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
      const url = window.prompt('이미지 URL을 입력하세요')
      if (url) {
        editor.chain().focus().setImage({ src: url }).run()
      }
      return
    }

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
          } catch (error) {
            console.error(error)
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
    <div className="rounded-md border border-neutral-300 bg-white overflow-hidden shadow-elevation-2 focus-within:border-ms-blue focus-within:ring-1 focus-within:ring-ms-blue transition-shadow duration-200">
      {/* 툴바 */}
      <div className="border-b border-neutral-200 bg-[#f3f2f1] p-1">
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
  )
}

export default HtmlEditor
