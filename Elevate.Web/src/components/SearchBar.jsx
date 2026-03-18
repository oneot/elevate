import React, { useState } from 'react';

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
