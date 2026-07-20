import { useEffect, useState } from 'react';
import {
  deletePlaceImage,
  setPlaceStatus,
  setPlaceWeightConfig,
  uploadPlaceImage,
} from '../lib/api/places';
import { listWeightConfigs } from '../lib/api/weightConfigs';
import { assetUrl } from '../lib/apiClient';
import { Modal } from './Modal';
import { errorMessage } from '../lib/errors';
import type { AdminPlace, PlaceToggleStatus, WeightConfig } from '../lib/types';

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900';

export function PlaceManageModal({
  place,
  onClose,
  onChanged,
}: {
  place: AdminPlace;
  onClose: () => void;
  /** 변경 후 목록 갱신 */
  onChanged: () => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(place.imageUrl);
  const [status, setStatus] = useState(place.status);
  const [configId, setConfigId] = useState<string>(place.weightConfigId ?? '');
  const [configs, setConfigs] = useState<WeightConfig[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listWeightConfigs({ page: 1, limit: 100 })
      .then((res) => setConfigs(res.items))
      .catch(() => undefined);
  }, []);

  async function run(fn: () => Promise<void>) {
    setError(null);
    setBusy(true);
    try {
      await fn();
      onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function onImageFile(file: File | undefined) {
    if (!file) return;
    void run(async () => {
      const res = await uploadPlaceImage(place.id, file);
      setImageUrl(res.imageUrl);
    });
  }

  function removeImage() {
    void run(async () => {
      await deletePlaceImage(place.id);
      setImageUrl(null);
    });
  }

  function toggleStatus(next: PlaceToggleStatus) {
    void run(async () => {
      const res = await setPlaceStatus(place.id, next);
      setStatus(res.status);
    });
  }

  function applyConfig() {
    void run(async () => {
      await setPlaceWeightConfig(place.id, configId || null);
    });
  }

  const img = assetUrl(imageUrl);

  return (
    <Modal title={`여행지 관리 — ${place.regionCode}`} onClose={onClose}>
      <div className="space-y-5">
        {/* 상태 */}
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-800">
            상태{' '}
            <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-normal text-slate-500">
              {status}
            </span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy || status === 'ACTIVE'}
              onClick={() => toggleStatus('ACTIVE')}
              className="rounded-lg border border-emerald-200 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
            >
              공개
            </button>
            <button
              type="button"
              disabled={busy || status === 'HIDDEN'}
              onClick={() => toggleStatus('HIDDEN')}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40"
            >
              숨김
            </button>
          </div>
        </div>

        {/* 대표 이미지 */}
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-800">대표 이미지</p>
          <div className="flex items-center gap-3">
            {img ? (
              <img src={img} alt="" className="h-20 w-20 rounded-lg object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                없음
              </div>
            )}
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                disabled={busy}
                onChange={(e) => onImageFile(e.target.files?.[0])}
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
              />
              {img && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={removeImage}
                  className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                >
                  이미지 삭제
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 가중치 배정 */}
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-800">점수 가중치</p>
          <div className="flex gap-2">
            <select
              value={configId}
              onChange={(e) => setConfigId(e.target.value)}
              className={inputClass}
            >
              <option value="">(배정 안 함)</option>
              {configs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={busy}
              onClick={applyConfig}
              className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              적용
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        )}
      </div>
    </Modal>
  );
}
