import { useState } from 'react'
import { Search, X } from 'lucide-react'

/** 문서 바 검색창. 제출할 때만 검색어를 바꾼다 (`/` 키로 포커스). */
export default function SearchBox({ placeholder, value = '', onSubmit }) {
  const [query, setQuery] = useState(value)

  return (
    <form
      role="search"
      className="ea-search"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(query.trim())
      }}
    >
      <Search className="ea-search__icon" size={15} aria-hidden="true" />
      <input
        type="search"
        className="ea-search__input"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        enterKeyHint="search"
      />
      {query && (
        <button
          type="button"
          className="ea-search__clear"
          aria-label="검색어 지우기"
          onClick={() => {
            setQuery('')
            if (value) onSubmit('')
          }}
        >
          <X size={12} strokeWidth={3} aria-hidden="true" />
        </button>
      )}
    </form>
  )
}
