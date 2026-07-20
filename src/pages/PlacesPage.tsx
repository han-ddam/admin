import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { createPlace, listPlaces, type PlaceListQuery } from '../lib/api/places';
import { useList } from '../hooks/useList';
import { Pagination } from '../components/Pagination';
import { SearchBar } from '../components/SearchBar';
import { Modal } from '../components/Modal';
import { PlaceManageModal } from '../components/PlaceManageModal';
import { CompositionsModal } from '../components/CompositionsModal';
import { CompositionImportModal } from '../components/CompositionImportModal';
import { assetUrl } from '../lib/apiClient';
import { formatDateTime } from '../lib/format';
import { errorMessage } from '../lib/errors';
import {
  LOCALES,
  type AdminPlace,
  type CreatePlaceInput,
  type Locale,
  type PageQuery,
  type Paginated,
  type PlaceStatus,
} from '../lib/types';

const statusMeta: Record<PlaceStatus, { label: string; cls: string }> = {
  ACTIVE: { label: '공개', cls: 'bg-emerald-50 text-emerald-700' },
  HIDDEN: { label: '숨김', cls: 'bg-slate-100 text-slate-500' },
  PENDING_REVIEW: { label: '검수대기', cls: 'bg-amber-50 text-amber-700' },
};

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900';

type TransForm = Record<Locale, { name: string; address: string; description: string; mission: string }>;

const emptyTrans: TransForm = {
  KO: { name: '', address: '', description: '', mission: '' },
  EN: { name: '', address: '', description: '', mission: '' },
  JA: { name: '', address: '', description: '', mission: '' },
  ZH: { name: '', address: '', description: '', mission: '' },
};

function CreatePlaceModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [regionCode, setRegionCode] = useState('');
  const [tourapiContentId, setTourapiContentId] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [basePoints, setBasePoints] = useState('0');
  const [rarityWeight, setRarityWeight] = useState('1');
  const [tags, setTags] = useState('');
  const [trans, setTrans] = useState<TransForm>(emptyTrans);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function setTransField(
    locale: Locale,
    field: keyof TransForm[Locale],
    value: string,
  ) {
    setTrans((t) => ({ ...t, [locale]: { ...t[locale], [field]: value } }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!trans.KO.name.trim()) {
      setError('KO(한국어) 이름은 필수입니다.');
      return;
    }
    const translations = LOCALES.filter((l) => trans[l].name.trim()).map((l) => ({
      locale: l,
      name: trans[l].name.trim(),
      address: trans[l].address.trim() || undefined,
      description: trans[l].description.trim() || undefined,
      mission: trans[l].mission.trim() || undefined,
    }));

    const input: CreatePlaceInput = {
      regionCode: regionCode.trim(),
      tourapiContentId: tourapiContentId.trim() || undefined,
      lat: lat.trim() ? Number(lat) : undefined,
      lng: lng.trim() ? Number(lng) : undefined,
      basePoints: Number(basePoints) || 0,
      rarityWeight: Number(rarityWeight),
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      translations,
    };

    setSaving(true);
    try {
      await createPlace(input);
      onCreated();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="여행지 추가" onClose={onClose}>
      <form onSubmit={submit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              지역코드 (regionCode, DISTRICT) *
            </label>
            <input
              required
              value={regionCode}
              onChange={(e) => setRegionCode(e.target.value)}
              className={inputClass}
              placeholder="예: 11110"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">위도(lat)</label>
            <input
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">경도(lng)</label>
            <input
              type="number"
              step="any"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              기본 점수(basePoints)
            </label>
            <input
              type="number"
              min={0}
              value={basePoints}
              onChange={(e) => setBasePoints(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              희귀도(rarityWeight, 0~99)
            </label>
            <input
              type="number"
              min={0}
              max={99}
              step="0.01"
              value={rarityWeight}
              onChange={(e) => setRarityWeight(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              태그 (쉼표로 구분)
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className={inputClass}
              placeholder="자연, 야경, 포토스팟"
            />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              TourAPI contentId (선택)
            </label>
            <input
              value={tourapiContentId}
              onChange={(e) => setTourapiContentId(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-800">번역 (KO 필수)</p>
          {LOCALES.map((loc) => (
            <fieldset key={loc} className="rounded-lg border border-slate-200 p-3">
              <legend className="px-1 text-xs font-semibold text-slate-500">{loc}</legend>
              <div className="space-y-2">
                <input
                  value={trans[loc].name}
                  onChange={(e) => setTransField(loc, 'name', e.target.value)}
                  className={inputClass}
                  placeholder={`이름 (name)${loc === 'KO' ? ' *' : ''}`}
                  required={loc === 'KO'}
                />
                <input
                  value={trans[loc].address}
                  onChange={(e) => setTransField(loc, 'address', e.target.value)}
                  className={inputClass}
                  placeholder="주소 (address)"
                />
                <input
                  value={trans[loc].description}
                  onChange={(e) => setTransField(loc, 'description', e.target.value)}
                  className={inputClass}
                  placeholder="설명 (description)"
                />
                <input
                  value={trans[loc].mission}
                  onChange={(e) => setTransField(loc, 'mission', e.target.value)}
                  className={inputClass}
                  placeholder="촬영 미션 (mission)"
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

export function PlacesPage() {
  const [status, setStatus] = useState<PlaceStatus | ''>('');
  // useList 의 q 를 province 필터로, status 를 별도 상태로 매핑
  const fetcher = useCallback(
    (p: PageQuery): Promise<Paginated<AdminPlace>> => {
      const query: PlaceListQuery = {
        province: p.q,
        status: status || undefined,
        page: p.page,
        limit: p.limit,
      };
      return listPlaces(query);
    },
    [status],
  );
  const list = useList<AdminPlace>(fetcher);
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [managing, setManaging] = useState<AdminPlace | null>(null);
  const [composing, setComposing] = useState<AdminPlace | null>(null);

  const statusOptions = useMemo(
    () =>
      (Object.keys(statusMeta) as PlaceStatus[]).map((s) => ({
        value: s,
        label: statusMeta[s].label,
      })),
    [],
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-slate-900">여행지 관리</h1>
        <div className="flex flex-wrap gap-2">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as PlaceStatus | '');
              list.setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-900"
          >
            <option value="">전체 상태</option>
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <SearchBar placeholder="지역코드(province) 접두 필터" onSearch={list.search} />
          <button
            type="button"
            onClick={() => setImporting(true)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            구도 CSV
          </button>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            여행지 추가
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        ※ 목록 API는 이름(번역)을 반환하지 않아 지역코드로 식별합니다.
      </p>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">이미지</th>
              <th className="px-4 py-2 font-medium">지역코드</th>
              <th className="px-4 py-2 font-medium">좌표</th>
              <th className="px-4 py-2 font-medium">점수</th>
              <th className="px-4 py-2 font-medium">희귀도</th>
              <th className="px-4 py-2 font-medium">가중치</th>
              <th className="px-4 py-2 font-medium">상태</th>
              <th className="px-4 py-2 font-medium text-right">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                  불러오는 중…
                </td>
              </tr>
            ) : list.error ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-rose-600">
                  {list.error}
                </td>
              </tr>
            ) : list.items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                  여행지가 없습니다.
                </td>
              </tr>
            ) : (
              list.items.map((p) => {
                const img = assetUrl(p.imageUrl);
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2">
                      {img ? (
                        <img src={img} alt="" className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-100 text-[10px] text-slate-400">
                          없음
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 text-slate-900" title={formatDateTime(p.createdAt)}>
                      {p.regionCode}
                    </td>
                    <td className="px-4 py-2 text-slate-500">
                      {p.lat != null && p.lng != null ? `${p.lat}, ${p.lng}` : '—'}
                    </td>
                    <td className="px-4 py-2 text-slate-700">{p.basePoints}</td>
                    <td className="px-4 py-2 text-slate-700">
                      {Number(p.rarityWeight).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-slate-500">
                      {p.weightConfigId ? '배정됨' : '—'}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusMeta[p.status].cls}`}
                      >
                        {statusMeta[p.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setComposing(p)}
                          className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          구도
                        </button>
                        <button
                          type="button"
                          onClick={() => setManaging(p)}
                          className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          관리
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
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
        <CreatePlaceModal onClose={() => setCreating(false)} onCreated={list.reload} />
      )}
      {importing && <CompositionImportModal onClose={() => setImporting(false)} />}
      {managing && (
        <PlaceManageModal
          place={managing}
          onClose={() => setManaging(null)}
          onChanged={list.reload}
        />
      )}
      {composing && (
        <CompositionsModal place={composing} onClose={() => setComposing(null)} />
      )}
    </section>
  );
}
