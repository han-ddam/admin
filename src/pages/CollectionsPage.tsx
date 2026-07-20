import { useState, type FormEvent } from 'react';
import {
  addCollectionPlace,
  createCollection,
  deleteCollection,
  listCollections,
  removeCollectionPlace,
  updateCollection,
} from '../lib/api/collections';
import { useList } from '../hooks/useList';
import { Pagination } from '../components/Pagination';
import { Modal } from '../components/Modal';
import { errorMessage } from '../lib/errors';
import {
  LOCALES,
  type Collection,
  type CollectionStatus,
  type CreateCollectionInput,
  type Locale,
  type UpdateCollectionInput,
} from '../lib/types';

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900';

type CollTransForm = Record<Locale, { title: string; description: string }>;

const emptyTrans: CollTransForm = {
  KO: { title: '', description: '' },
  EN: { title: '', description: '' },
  JA: { title: '', description: '' },
  ZH: { title: '', description: '' },
};

function CreateCollectionModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [seq, setSeq] = useState('0');
  const [status, setStatus] = useState<CollectionStatus>('ACTIVE');
  const [trans, setTrans] = useState<CollTransForm>(emptyTrans);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function setTransField(loc: Locale, field: 'title' | 'description', value: string) {
    setTrans((t) => ({ ...t, [loc]: { ...t[loc], [field]: value } }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!trans.KO.title.trim()) {
      setError('KO(한국어) 제목은 필수입니다.');
      return;
    }
    const translations = LOCALES.filter((l) => trans[l].title.trim()).map((l) => ({
      locale: l,
      title: trans[l].title.trim(),
      description: trans[l].description.trim() || undefined,
    }));
    const input: CreateCollectionInput = {
      seq: Number(seq),
      status,
      translations,
    };
    setSaving(true);
    try {
      await createCollection(input);
      onCreated();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="컬렉션 추가" onClose={onClose}>
      <form onSubmit={submit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
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
            <label className="mb-1 block text-sm font-medium text-slate-700">상태</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CollectionStatus)}
              className={inputClass}
            >
              <option value="ACTIVE">공개</option>
              <option value="HIDDEN">숨김</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-800">번역 (KO 필수)</p>
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
        </div>

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? '저장 중…' : '추가'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EditCollectionModal({
  collection,
  onClose,
  onUpdated,
}: {
  collection: Collection;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [seq, setSeq] = useState(String(collection.seq));
  const [status, setStatus] = useState<CollectionStatus>(collection.status);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const patch: UpdateCollectionInput = {};
    if (Number(seq) !== collection.seq) patch.seq = Number(seq);
    if (status !== collection.status) patch.status = status;
    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      await updateCollection(collection.id, patch);
      onUpdated();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`컬렉션 수정 — ${collection.title}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <p className="text-xs text-slate-400">번역(제목/설명)은 수정할 수 없습니다.</p>
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
            <label className="mb-1 block text-sm font-medium text-slate-700">상태</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CollectionStatus)}
              className={inputClass}
            >
              <option value="ACTIVE">공개</option>
              <option value="HIDDEN">숨김</option>
            </select>
          </div>
        </div>
        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? '저장 중…' : '저장'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ManagePlacesModal({
  collection,
  onClose,
  onChanged,
}: {
  collection: Collection;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [placeId, setPlaceId] = useState('');
  const [seq, setSeq] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function add(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await addCollectionPlace(collection.id, placeId.trim(), Number(seq));
      setPlaceId('');
      onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!placeId.trim()) {
      setError('제거할 여행지 ID를 입력하세요.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await removeCollectionPlace(collection.id, placeId.trim());
      setPlaceId('');
      onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={`여행지 편성 — ${collection.title}`} onClose={onClose}>
      <form onSubmit={add} className="space-y-3">
        <p className="text-xs text-slate-400">
          현재 포함 {collection.total}개. 여행지 ID(UUID)로 추가·제거합니다. (목록 조회
          API는 아직 없어 ID 직접 입력)
        </p>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">여행지 ID</label>
          <input
            value={placeId}
            onChange={(e) => setPlaceId(e.target.value)}
            className={inputClass}
            placeholder="place UUID"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            순서(seq, 추가 시)
          </label>
          <input
            type="number"
            min={0}
            value={seq}
            onChange={(e) => setSeq(e.target.value)}
            className={inputClass}
          />
        </div>
        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => void remove()}
            disabled={busy}
            className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
          >
            제거
          </button>
          <button
            type="submit"
            disabled={busy || !placeId.trim()}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            추가
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function CollectionsPage() {
  const list = useList<Collection>(listCollections);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [managing, setManaging] = useState<Collection | null>(null);

  async function remove(c: Collection) {
    if (!window.confirm(`'${c.title}' 컬렉션을 삭제할까요?`)) return;
    try {
      await deleteCollection(c.id);
      list.reload();
    } catch (err) {
      window.alert(errorMessage(err));
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">컬렉션 관리</h1>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          컬렉션 추가
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">제목(KO)</th>
              <th className="px-4 py-2 font-medium">순서</th>
              <th className="px-4 py-2 font-medium">여행지 수</th>
              <th className="px-4 py-2 font-medium">상태</th>
              <th className="px-4 py-2 font-medium text-right">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                  불러오는 중…
                </td>
              </tr>
            ) : list.error ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-rose-600">
                  {list.error}
                </td>
              </tr>
            ) : list.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                  컬렉션이 없습니다.
                </td>
              </tr>
            ) : (
              list.items.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-900">{c.title}</td>
                  <td className="px-4 py-2 text-slate-500">{c.seq}</td>
                  <td className="px-4 py-2 text-slate-700">{c.total}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {c.status === 'ACTIVE' ? '공개' : '숨김'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setManaging(c)}
                        className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        여행지
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(c)}
                        className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(c)}
                        className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={list.page}
        limit={list.limit}
        total={list.total}
        onPage={list.setPage}
      />

      {creating && (
        <CreateCollectionModal
          onClose={() => setCreating(false)}
          onCreated={list.reload}
        />
      )}
      {editing && (
        <EditCollectionModal
          collection={editing}
          onClose={() => setEditing(null)}
          onUpdated={list.reload}
        />
      )}
      {managing && (
        <ManagePlacesModal
          collection={managing}
          onClose={() => setManaging(null)}
          onChanged={list.reload}
        />
      )}
    </section>
  );
}
