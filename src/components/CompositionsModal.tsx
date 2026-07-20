import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  createComposition,
  deleteComposition,
  listCompositions,
  uploadCompositionPhoto,
} from '../lib/api/compositions';
import { assetUrl } from '../lib/apiClient';
import { Modal } from './Modal';
import { errorMessage } from '../lib/errors';
import {
  LOCALES,
  type AdminPlace,
  type Composition,
  type CompositionSource,
  type CreateCompositionInput,
  type Locale,
} from '../lib/types';

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900';

type CompTransForm = Record<Locale, { title: string; description: string }>;

const emptyTrans: CompTransForm = {
  KO: { title: '', description: '' },
  EN: { title: '', description: '' },
  JA: { title: '', description: '' },
  ZH: { title: '', description: '' },
};

function koTitle(c: Composition): string {
  return c.translations.find((t) => t.locale === 'KO')?.title ?? '(제목 없음)';
}

export function CompositionsModal({
  place,
  onClose,
}: {
  place: AdminPlace;
  onClose: () => void;
}) {
  const [items, setItems] = useState<Composition[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // 생성 폼
  const [seq, setSeq] = useState('0');
  const [source, setSource] = useState<CompositionSource>('CURATED');
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [trans, setTrans] = useState<CompTransForm>(emptyTrans);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setListError(null);
    listCompositions(place.id)
      .then((rows) => setItems(rows.slice().sort((a, b) => a.seq - b.seq)))
      .catch((err) => setListError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [place.id]);

  useEffect(load, [load]);

  function setTransField(loc: Locale, field: 'title' | 'description', value: string) {
    setTrans((t) => ({ ...t, [loc]: { ...t[loc], [field]: value } }));
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setFormError(null);
    setUploading(true);
    try {
      const res = await uploadCompositionPhoto(place.id, file);
      setImageKey(res.imageKey);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  function resetForm() {
    setSeq('0');
    setSource('CURATED');
    setImageKey(null);
    setTrans(emptyTrans);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!trans.KO.title.trim()) {
      setFormError('KO(한국어) 제목은 필수입니다.');
      return;
    }
    const translations = LOCALES.filter((l) => trans[l].title.trim()).map((l) => ({
      locale: l,
      title: trans[l].title.trim(),
      description: trans[l].description.trim() || undefined,
    }));
    const input: CreateCompositionInput = {
      seq: Number(seq),
      source,
      imageKey: imageKey ?? undefined,
      translations,
    };
    setSaving(true);
    try {
      await createComposition(place.id, input);
      resetForm();
      load();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: Composition) {
    if (!window.confirm(`'${koTitle(c)}' 구도를 삭제할까요?`)) return;
    try {
      await deleteComposition(c.id);
      load();
    } catch (err) {
      window.alert(errorMessage(err));
    }
  }

  return (
    <Modal title={`구도 가이드 — ${place.regionCode}`} onClose={onClose}>
      <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        {/* 기존 목록 */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-800">등록된 구도</p>
          {loading ? (
            <p className="text-sm text-slate-400">불러오는 중…</p>
          ) : listError ? (
            <p className="text-sm text-rose-600">{listError}</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-400">등록된 구도가 없습니다.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((c) => {
                const img = assetUrl(c.exampleImageUrl);
                return (
                  <li
                    key={c.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 p-2"
                  >
                    {img ? (
                      <img
                        src={img}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-slate-100 text-xs text-slate-400">
                        없음
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {koTitle(c)}
                      </p>
                      <p className="text-xs text-slate-400">
                        #{c.seq} · {c.source}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void remove(c)}
                      className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                    >
                      삭제
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* 새 구도 추가 */}
        <form onSubmit={submit} className="space-y-3 border-t border-slate-200 pt-4">
          <p className="text-sm font-semibold text-slate-800">구도 추가</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">순서(seq)</label>
              <input
                type="number"
                min={0}
                value={seq}
                onChange={(e) => setSeq(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">출처</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as CompositionSource)}
                className={inputClass}
              >
                <option value="CURATED">CURATED (직접)</option>
                <option value="AI">AI</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              예시 사진 (선택)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => void onFile(e.target.files?.[0])}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
            />
            {uploading && <p className="mt-1 text-xs text-slate-400">업로드 중…</p>}
            {imageKey && (
              <p className="mt-1 text-xs text-emerald-600">업로드 완료 ({imageKey})</p>
            )}
          </div>
          {LOCALES.map((loc) => (
            <fieldset key={loc} className="rounded-lg border border-slate-200 p-3">
              <legend className="px-1 text-xs font-semibold text-slate-500">{loc}</legend>
              <div className="space-y-2">
                <input
                  value={trans[loc].title}
                  onChange={(e) => setTransField(loc, 'title', e.target.value)}
                  className={inputClass}
                  placeholder={`제목 (title)${loc === 'KO' ? ' *' : ''}`}
                  required={loc === 'KO'}
                />
                <input
                  value={trans[loc].description}
                  onChange={(e) => setTransField(loc, 'description', e.target.value)}
                  className={inputClass}
                  placeholder="설명 (description)"
                />
              </div>
            </fieldset>
          ))}
          {formError && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {formError}
            </p>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || uploading}
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? '저장 중…' : '구도 추가'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
