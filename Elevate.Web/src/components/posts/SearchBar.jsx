/**
 * @file SearchBar.jsx
 * @description 게시글 목록 페이지의 검색 입력 폼 컴포넌트.
 *
 * 내부 state `q`로 입력값을 관리하며, 폼 제출(Enter 또는 버튼 클릭) 시 `onSubmit(q)`를 호출한다.
 * 외부 `value` prop이 변경되면 입력창을 동기화한다.
 * 입력창 오른쪽에 X 버튼이 표시되며, 클릭 시 입력값을 초기화하고 `onSubmit('')`를 호출한다.
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
  };

  const handleClear = () => {
    setQ('');
    onChange('');
    onSubmit('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={q}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full rounded-full border border-white/70 bg-white/85 backdrop-blur pl-4 pr-9 py-2 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-ms-blue/30 focus:border-ms-blue/30"
            aria-label={placeholder}
          />
          {q && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-slate-300 hover:bg-slate-400 text-white transition-colors focus:outline-none"
              aria-label="검색어 지우기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          )}
        </div>
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
