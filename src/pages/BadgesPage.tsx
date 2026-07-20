import { useState, type FormEvent } from 'react';
import {
  createBadge,
  deleteBadge,
  listBadges,
  updateBadge,
} from '../lib/api/badges';
import { useList } from '../hooks/useList';
import { Pagination } from '../components/Pagination';
import { Modal } from '../components/Modal';
import { errorMessage } from '../lib/errors';
import {
  BADGE_CRITERIA_TYPES,
  LOCALES,
  type Badge,
  type BadgeCriteriaType,
  type BadgeStatus,
  type CreateBadgeInput,
  type Locale,
  type UpdateBadgeInput,
} from '../lib/types';

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900';

const criteriaLabel: Record<BadgeCriteriaType, string> = {
  LEVEL: '레벨',
  VISIT_COUNT: '방문 수',
};

type BadgeTransForm = Record<Locale, { name: string; description: string }>;

const emptyTrans: BadgeTransForm = {
  KO: { name: '', description: '' },
  EN: { name: '', description: '' },
  JA: { name: '', description: '' },
  ZH: { name: '', description: '' },
};

function CreateBadgeModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [code, setCode] = useState('');
  const [tier, setTier] = useState('1');
  const [criteriaType, setCriteriaType] = useState<BadgeCriteriaType>('LEVEL');
  const [criteriaValue, setCriteriaValue] = useState('0');
  const [iconKey, setIconKey] = useState('');
  const [status, setStatus] = useState<BadgeStatus>('ACTIVE');
  const [seq, setSeq] = useState('0');
  const [trans, setTrans] = useState<BadgeTransForm>(emptyTrans);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function setTransField(loc: Locale, field: 'name' | 'description', value: string) {
    setTrans((t) => ({ ...t, [loc]: { ...t[loc], [field]: value } }));
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
      description: trans[l].description.trim() || undefined,
    }));
    const input: CreateBadgeInput = {
      code: code.trim(),
      tier: Number(tier),
      criteriaType,
      criteriaValue: Number(criteriaValue),
      iconKey: iconKey.trim() || undefined,
      status,
      seq: Number(seq),
      translations,
    };
    setSaving(true);
    try {
      await createBadge(input);
      onCreated();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="뱃지 추가" onClose={onClose}>
      <form onSubmit={submit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              코드 (code, 고유) *
            </label>
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={inputClass}
              placeholder="예: LEVEL_5"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">등급(tier)</label>
            <input
              type="number"
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className={inputClass}
            />
          </div>
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
            <label className="mb-1 block text-sm font-medium text-slate-700">기준 유형</label>
            <select
              value={criteriaType}
              onChange={(e) => setCriteriaType(e.target.value as BadgeCriteriaType)}
              className={inputClass}
            >
              {BADGE_CRITERIA_TYPES.map((t) => (
                <option key={t} value={t}>
                  {criteriaLabel[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              기준 값 (criteriaValue)
            </label>
            <input
              type="number"
              min={0}
              value={criteriaValue}
              onChange={(e) => setCriteriaValue(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              아이콘 키 (선택)
            </label>
            <input
              value={iconKey}
              onChange={(e) => setIconKey(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">상태</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BadgeStatus)}
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
                  value={trans[loc].name}
                  onChange={(e) => setTransField(loc, 'name', e.target.value)}
                  className={inputClass}
                  placeholder={`이름 (name)${loc === 'KO' ? ' *' : ''}`}
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

function EditBadgeModal({
  badge,
  onClose,
  onUpdated,
}: {
  badge: Badge;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [tier, setTier] = useState(String(badge.tier));
  const [criteriaValue, setCriteriaValue] = useState(String(badge.criteriaValue));
  const [status, setStatus] = useState<BadgeStatus>(badge.status);
  const [seq, setSeq] = useState(String(badge.seq));
  const [iconKey, setIconKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const patch: UpdateBadgeInput = {};
    if (Number(tier) !== badge.tier) patch.tier = Number(tier);
    if (Number(criteriaValue) !== badge.criteriaValue)
      patch.criteriaValue = Number(criteriaValue);
    if (status !== badge.status) patch.status = status;
    if (Number(seq) !== badge.seq) patch.seq = Number(seq);
    if (iconKey.trim()) patch.iconKey = iconKey.trim();
    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      await updateBadge(badge.id, patch);
      onUpdated();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`뱃지 수정 — ${badge.code}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <p className="text-xs text-slate-400">
          코드/기준 유형/번역은 수정할 수 없습니다.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">등급(tier)</label>
            <input
              type="number"
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className={inputClass}
            />
          </div>
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
            <label className="mb-1 block text-sm font-medium text-slate-700">기준 값</label>
            <input
              type="number"
              min={0}
              value={criteriaValue}
              onChange={(e) => setCriteriaValue(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">상태</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BadgeStatus)}
              className={inputClass}
            >
              <option value="ACTIVE">공개</option>
              <option value="HIDDEN">숨김</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              아이콘 키 (변경 시에만 입력)
            </label>
            <input
              value={iconKey}
              onChange={(e) => setIconKey(e.target.value)}
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
            {saving ? '저장 중…' : '저장'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function BadgesPage() {
  const list = useList<Badge>(listBadges);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Badge | null>(null);

  async function remove(badge: Badge) {
    if (!window.confirm(`'${badge.code}' 뱃지를 삭제할까요?`)) return;
    try {
      await deleteBadge(badge.id);
      list.reload();
    } catch (err) {
      window.alert(errorMessage(err));
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">뱃지 관리</h1>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          뱃지 추가
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">코드</th>
              <th className="px-4 py-2 font-medium">등급</th>
              <th className="px-4 py-2 font-medium">기준</th>
              <th className="px-4 py-2 font-medium">순서</th>
              <th className="px-4 py-2 font-medium">상태</th>
              <th className="px-4 py-2 font-medium text-right">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  불러오는 중…
                </td>
              </tr>
            ) : list.error ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-rose-600">
                  {list.error}
                </td>
              </tr>
            ) : list.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  뱃지가 없습니다.
                </td>
              </tr>
            ) : (
              list.items.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-900">{b.code}</td>
                  <td className="px-4 py-2 text-slate-700">{b.tier}</td>
                  <td className="px-4 py-2 text-slate-600">
                    {criteriaLabel[b.criteriaType]} ≥ {b.criteriaValue}
                  </td>
                  <td className="px-4 py-2 text-slate-500">{b.seq}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        b.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {b.status === 'ACTIVE' ? '공개' : '숨김'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditing(b)}
                        className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(b)}
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
        <CreateBadgeModal onClose={() => setCreating(false)} onCreated={list.reload} />
      )}
      {editing && (
        <EditBadgeModal
          badge={editing}
          onClose={() => setEditing(null)}
          onUpdated={list.reload}
        />
      )}
    </section>
  );
}
