import { useState, type FormEvent } from 'react';
import {
  createWeightConfig,
  deleteWeightConfig,
  listWeightConfigs,
  updateWeightConfig,
} from '../lib/api/weightConfigs';
import { useList } from '../hooks/useList';
import { Pagination } from '../components/Pagination';
import { Modal } from '../components/Modal';
import { formatDateTime } from '../lib/format';
import { errorMessage } from '../lib/errors';
import type { WeightConfig, WeightConfigInput } from '../lib/types';

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900';

function num(v: string | number): string {
  return Number(v).toFixed(2);
}

function WeightConfigModal({
  config,
  onClose,
  onSaved,
}: {
  /** 있으면 수정, 없으면 생성. */
  config: WeightConfig | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(config?.name ?? '');
  const [visitWeight, setVisitWeight] = useState(
    config ? String(Number(config.visitWeight)) : '1',
  );
  const [photoWeight, setPhotoWeight] = useState(
    config ? String(Number(config.photoWeight)) : '1',
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const payload: WeightConfigInput = {
      name: name.trim(),
      visitWeight: Number(visitWeight),
      photoWeight: Number(photoWeight),
    };
    setSaving(true);
    try {
      if (config) await updateWeightConfig(config.id, payload);
      else await createWeightConfig(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={config ? '가중치 수정' : '가중치 추가'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            이름 (name)
          </label>
          <input
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="예: 기본, 야경 스팟"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              방문 가중치 (0~99.99)
            </label>
            <input
              type="number"
              required
              min={0}
              max={99.99}
              step="0.01"
              value={visitWeight}
              onChange={(e) => setVisitWeight(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              사진 가중치 (0~99.99)
            </label>
            <input
              type="number"
              required
              min={0}
              max={99.99}
              step="0.01"
              value={photoWeight}
              onChange={(e) => setPhotoWeight(e.target.value)}
              className={inputClass}
            />
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
            {saving ? '저장 중…' : config ? '저장' : '추가'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function WeightConfigsPage() {
  const list = useList<WeightConfig>(listWeightConfigs);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<WeightConfig | null>(null);

  async function remove(config: WeightConfig) {
    if (!window.confirm(`'${config.name}' 가중치를 삭제할까요?`)) return;
    try {
      await deleteWeightConfig(config.id);
      list.reload();
    } catch (err) {
      window.alert(errorMessage(err));
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">점수 가중치</h1>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          가중치 추가
        </button>
      </div>

      <p className="text-xs text-slate-400">
        여행지에 배정하는 방문/사진 점수 가중치 프리셋입니다.
      </p>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">이름</th>
              <th className="px-4 py-2 font-medium">방문 가중치</th>
              <th className="px-4 py-2 font-medium">사진 가중치</th>
              <th className="px-4 py-2 font-medium">생성일</th>
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
                  가중치 프리셋이 없습니다.
                </td>
              </tr>
            ) : (
              list.items.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-900">{c.name}</td>
                  <td className="px-4 py-2 text-slate-700">{num(c.visitWeight)}</td>
                  <td className="px-4 py-2 text-slate-700">{num(c.photoWeight)}</td>
                  <td className="px-4 py-2 text-slate-500">{formatDateTime(c.createdAt)}</td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-1.5">
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
        <WeightConfigModal
          config={null}
          onClose={() => setCreating(false)}
          onSaved={list.reload}
        />
      )}
      {editing && (
        <WeightConfigModal
          config={editing}
          onClose={() => setEditing(null)}
          onSaved={list.reload}
        />
      )}
    </section>
  );
}
