import React from 'react';

export default function TagFilter({ allTags = [], selectedTags = [], onTagToggle, onClearAll }) {
  if (!allTags.length) return null;

  return (
    <div className="clean-card no-hover rounded-2xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-sm p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">태그 필터</h3>
        {selectedTags.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs px-2 py-1 rounded-full bg-white/80 border border-white/70 text-ms-blue hover:border-ms-blue/30 transition-colors"
          >
            전체 해제
          </button>
        )}
      </div>
      <ul className="flex flex-wrap gap-2">
        {allTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <li key={tag}>
              <button
                onClick={() => onTagToggle(tag)}
                className={`inline-block px-3 py-1 text-sm rounded-full border transition-all duration-200 ${
                  isSelected
                    ? 'bg-ms-blue text-white border-ms-blue shadow-[0_8px_20px_-10px_rgba(0,120,212,0.8)]'
                    : 'bg-white/85 text-slate-600 border-white/70 hover:border-ms-blue/40 hover:text-ms-blue'
                }`}
              >
                {tag}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
