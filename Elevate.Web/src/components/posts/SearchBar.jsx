/**
 * @file SearchBar.jsx
 * @description 게시글 목록 페이지의 검색 입력 폼 컴포넌트.
 *
 * 내부 state `q`로 입력값을 관리하며, 폼 제출(Enter 또는 버튼 클릭) 시 `onSubmit(q)`를 호출한다.
 * 외부 `value` prop이 변경되면 입력창을 동기화한다.
 * 입력을 지울 때(빈 문자열)는 즉시 `onSubmit('')`를 호출하여 검색을 초기화한다.
 */
import React from 'react';

/**
 * 검색 입력 폼 컴포넌트.
 *
 * @param {Object} props
 * @param {string} [props.value=''] - 검색어 초기값 (URL 쿼리 파라미터 등 외부 값과 동기화)
 * @param {Function} [props.onChange] - 입력값 변경 시 호출되는 콜백 `(value: string) => void`
 * @param {Function} [props.onSubmit] - 폼 제출 시 호출되는 콜백 `(query: string) => void`
 * @param {string} [props.placeholder='검색하기'] - input placeholder 텍스트
 * @returns {JSX.Element}
 */
const SearchBar = ({ value = '', onChange = () => {}, onSubmit = () => {}, placeholder = '검색하기' }) => {
  const [q, setQ] = React.useState(value);

  // 외부에서 value prop이 변경될 때 입력창을 동기화한다 (예: URL 파라미터 직접 조작 시).
  React.useEffect(() => {
    setQ(value);
  }, [value]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(q);
  };

  const handleChange = (e) => {
    const newVal = e.target.value;
    setQ(newVal);
    onChange(newVal);
    // 입력을 모두 지웠을 때 즉시 검색 초기화 (브라우저 × 버튼 포함)
    if (newVal === '') onSubmit('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center gap-2">
        <input
          type="text"
          value={q}
          onChange={handleChange}
          placeholder={placeholder}
          className="flex-1 rounded-full border border-white/70 bg-white/85 backdrop-blur px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-ms-blue/30 focus:border-ms-blue/30"
          aria-label={placeholder}
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-ms-blue px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-ms-blue/90 focus:outline-none focus:ring-2 focus:ring-ms-blue/50 transition-colors"
          aria-label="검색"
        >
          검색
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
