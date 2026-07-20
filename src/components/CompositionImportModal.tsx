import { useState } from 'react';
import { importCompositions } from '../lib/api/compositions';
import { Modal } from './Modal';
import { errorMessage } from '../lib/errors';
import type { CompositionImportResult } from '../lib/types';

export function CompositionImportModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<CompositionImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!file) return;
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      setResult(await importCompositions(file));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="구도 CSV 일괄 등록" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-xs text-slate-500">
          헤더: <code>region_code, place_name, seq(선택), title, description(선택)</code>
          <br />
          지역코드+장소명으로 여행지를 찾아 해당 place 의 구도를 교체합니다.
        </p>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
        />

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        )}

        {result && (
          <div className="space-y-2 rounded-lg bg-slate-50 p-3 text-sm">
            <p className="text-slate-700">
              여행지 {result.placesUpdated}곳 · 구도 {result.imported}건 등록
            </p>
            {result.skipped.length > 0 && (
              <div>
                <p className="font-medium text-amber-700">
                  건너뜀 {result.skipped.length}건
                </p>
                <ul className="mt-1 max-h-40 space-y-0.5 overflow-y-auto text-xs text-slate-500">
                  {result.skipped.map((s, i) => (
                    <li key={i}>
                      #{s.line}: {s.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            닫기
          </button>
          <button
            type="button"
            disabled={busy || !file}
            onClick={() => void run()}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {busy ? '등록 중…' : '업로드'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
