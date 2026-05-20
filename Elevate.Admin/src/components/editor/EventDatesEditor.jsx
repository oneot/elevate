/**
 * EventDatesEditor
 *
 * 행사 일정(eventDates)을 편집하는 컴포넌트.
 * 단발/기간/다중 타입을 지원하며, 유효성 검증 후 부모에게 알린다.
 *
 * Props:
 *  - value    {Array<{start: string, end: string}>|null} 현재 eventDates 값
 *  - onChange {function} (newValue: Array<{start, end}>|null) => void
 *
 * 내부 타입 (UI 전용, DB 미저장):
 *  - single: 단발 — 날짜 1개 (start === end인 원소 1개)
 *  - range:  기간 — 시작일~종료일 (start ≠ end인 원소 1개)
 *  - multi:  다중 — 날짜 여러 개 (각각 start === end인 원소들)
 */

import { useState, useEffect, useCallback } from 'react';
import { FormField } from '../ui/index.js';

const TYPE_LABELS = {
  single: '단발',
  range: '기간',
  multi: '다중',
};

function detectType(value) {
  if (!Array.isArray(value) || value.length === 0) return 'single';
  if (value.length === 1) return value[0].start === value[0].end ? 'single' : 'range';
  return 'multi';
}

export default function EventDatesEditor({ value, onChange }) {
  const [type, setType] = useState(() => detectType(value));
  const [entries, setEntries] = useState(() =>
    Array.isArray(value) && value.length > 0 ? value : [{ start: '', end: '' }]
  );

  // Memoize onChange to avoid useEffect dependency issues
  const notifyParent = useCallback(() => {
    // Validate all entries
    let isValid = false;
    let result = null;

    if (type === 'single') {
      isValid = entries[0]?.start && entries[0].start.trim() !== '';
      if (isValid) {
        result = [{ start: entries[0].start, end: entries[0].start }];
      }
    } else if (type === 'range') {
      isValid = entries[0]?.start && entries[0]?.end &&
                entries[0].start.trim() !== '' && entries[0].end.trim() !== '';
      if (isValid) {
        result = [{ start: entries[0].start, end: entries[0].end }];
      }
    } else if (type === 'multi') {
      isValid = entries.length > 0 && entries.every(e => e.start && e.start.trim() !== '');
      if (isValid) {
        result = entries.map(e => ({ start: e.start, end: e.start }));
      }
    }

    onChange(isValid ? result : null);
  }, [entries, type, onChange]);

  useEffect(() => {
    notifyParent();
  }, [notifyParent]);

  const handleTypeChange = (newType) => {
    setType(newType);
    setEntries([{ start: '', end: '' }]);
  };

  const handleEntryChange = (i, field, val) => {
    setEntries(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: val } : e));
  };

  const addEntry = () => {
    setEntries(prev => [...prev, { start: '', end: '' }]);
  };

  const removeEntry = (i) => {
    setEntries(prev => prev.filter((_, idx) => idx !== i));
  };

  const inputClassName = "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-shadow duration-200 focus:outline-none focus:ring-1 focus:ring-ms-blue focus:border-ms-blue";
  const buttonClassName = "px-3 py-1.5 rounded-md text-sm font-semibold transition-colors";

  return (
    <div className="space-y-4">
      <FormField label="행사 일정 타입">
        <div className="flex gap-2">
          {Object.entries(TYPE_LABELS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleTypeChange(key)}
              className={`${buttonClassName} ${
                type === key
                  ? 'bg-ms-blue text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </FormField>

      {type === 'single' && (
        <FormField label="날짜">
          <input
            type="date"
            className={inputClassName}
            value={entries[0]?.start || ''}
            onChange={(e) => handleEntryChange(0, 'start', e.target.value)}
          />
        </FormField>
      )}

      {type === 'range' && (
        <>
          <FormField label="시작일">
            <input
              type="date"
              className={inputClassName}
              value={entries[0]?.start || ''}
              onChange={(e) => handleEntryChange(0, 'start', e.target.value)}
            />
          </FormField>
          <FormField label="종료일">
            <input
              type="date"
              className={inputClassName}
              value={entries[0]?.end || ''}
              onChange={(e) => handleEntryChange(0, 'end', e.target.value)}
            />
          </FormField>
        </>
      )}

      {type === 'multi' && (
        <div className="space-y-3">
          {entries.map((entry, i) => (
            <FormField key={i} label={`날짜 ${i + 1}`}>
              <div className="flex gap-2">
                <input
                  type="date"
                  className={inputClassName}
                  value={entry.start || ''}
                  onChange={(e) => handleEntryChange(i, 'start', e.target.value)}
                />
                {entries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEntry(i)}
                    className={`${buttonClassName} bg-red-50 text-red-600 hover:bg-red-100 whitespace-nowrap`}
                  >
                    삭제
                  </button>
                )}
              </div>
            </FormField>
          ))}
          <button
            type="button"
            onClick={addEntry}
            className={`${buttonClassName} bg-neutral-100 text-neutral-700 hover:bg-neutral-200`}
          >
            + 날짜 추가
          </button>
        </div>
      )}
    </div>
  );
}
