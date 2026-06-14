import { useState, type FormEvent } from 'react';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (q: string) => void;
}

/** 제출 시점에 검색어를 상위로 전달하는 단순 검색 입력. */
export function SearchBar({ placeholder, onSearch }: SearchBarProps) {
  const [value, setValue] = useState('');

  function submit(e: FormEvent) {
    e.preventDefault();
    onSearch(value.trim());
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder ?? '검색'}
        className="w-64 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
      />
      <button
        type="submit"
        className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        검색
      </button>
    </form>
  );
}
