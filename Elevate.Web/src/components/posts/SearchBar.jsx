/**
 * @file SearchBar.jsx
 * @description 게시글 목록 페이지의 검색 입력 폼 컴포넌트.
 *
 * 내부 state `q`로 입력값을 관리하며, 폼 제출 시 `onSubmit(q)`를 호출한다.
 * 초기 `value` prop은 초기값으로만 사용되며, 이후 변경은 추적하지 않는다.
 */
import React, { useState } from 'react';

/**
 * 검색 입력 폼 컴포넌트.
 *
 * @param {Object} props
 * @param {string} [props.value=''] - 검색어 초기값
 * @param {Function} [props.onChange] - 입력값 변경 시 호출되는 콜백 `(value: string) => void`
 * @param {Function} [props.onSubmit] - 폼 제출 시 호출되는 콜백 `(query: string) => void`
 * @param {string} [props.placeholder='검색하기'] - input placeholder 텍스트
 * @returns {JSX.Element}
 */
const SearchBar = ({ value = '', onChange = () => {}, onSubmit = () => {}, placeholder = '검색하기' }) => {
  const [q, setQ] = useState(value);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(q);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); onChange(e.target.value); }}
          placeholder={placeholder}
          className="w-full rounded-full border border-white/70 bg-white/85 backdrop-blur px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-ms-blue/30 focus:border-ms-blue/30"
          aria-label={placeholder}
        />
      </div>
    </form>
  );
};

export default SearchBar;
