import { useState, type FormEvent } from 'react';
import {
  createAdmin,
  listAdmins,
  updateAdmin,
  type CreateAdminInput,
  type UpdateAdminInput,
} from '../lib/api/admins';
import { useList } from '../hooks/useList';
import { Pagination } from '../components/Pagination';
import { SearchBar } from '../components/SearchBar';
import { Modal } from '../components/Modal';
import { formatDateTime } from '../lib/format';
import { errorMessage } from '../lib/errors';
import { ADMIN_ROLES, type AdminProfile, type AdminRole } from '../lib/types';

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900';

function RoleSelect({
  value,
  onChange,
}: {
  value: AdminRole;
  onChange: (role: AdminRole) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as AdminRole)}
      className={inputClass}
    >
      {ADMIN_ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}

function CreateAdminModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<CreateAdminInput>({
    email: '',
    password: '',
    name: '',
    role: 'ADMIN',
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await createAdmin(form);
      onCreated();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="관리자 추가" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">이메일</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            비밀번호 (8자 이상)
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">이름</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">역할</label>
          <RoleSelect
            value={form.role ?? 'ADMIN'}
            onChange={(role) => setForm({ ...form, role })}
          />
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
            {saving ? '저장 중…' : '추가'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EditAdminModal({
  admin,
  onClose,
  onUpdated,
}: {
  admin: AdminProfile;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [name, setName] = useState(admin.name);
  const [role, setRole] = useState<AdminRole>(admin.role);
  const [isActive, setIsActive] = useState(admin.isActive);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const patch: UpdateAdminInput = {};
    if (name !== admin.name) patch.name = name;
    if (role !== admin.role) patch.role = role;
    if (isActive !== admin.isActive) patch.isActive = isActive;
    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await updateAdmin(admin.id, patch);
      onUpdated();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`관리자 수정 — ${admin.email}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">이름</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">역할</label>
          <RoleSelect value={role} onChange={setRole} />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4"
          />
          활성 계정
        </label>
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

export function AdminsPage() {
  const list = useList<AdminProfile>(listAdmins);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminProfile | null>(null);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">관리자 관리</h1>
        <div className="flex gap-2">
          <SearchBar placeholder="이메일 / 이름 검색" onSearch={list.search} />
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            관리자 추가
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">이메일</th>
              <th className="px-4 py-2 font-medium">이름</th>
              <th className="px-4 py-2 font-medium">역할</th>
              <th className="px-4 py-2 font-medium">활성</th>
              <th className="px-4 py-2 font-medium">생성일</th>
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
                  관리자가 없습니다.
                </td>
              </tr>
            ) : (
              list.items.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-900">{a.email}</td>
                  <td className="px-4 py-2 text-slate-700">{a.name}</td>
                  <td className="px-4 py-2">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                      {a.role}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {a.isActive ? (
                      <span className="text-emerald-600">●</span>
                    ) : (
                      <span className="text-slate-300">●</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-slate-500">{formatDateTime(a.createdAt)}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => setEditing(a)}
                      className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      수정
                    </button>
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
        <CreateAdminModal onClose={() => setCreating(false)} onCreated={list.reload} />
      )}
      {editing && (
        <EditAdminModal
          admin={editing}
          onClose={() => setEditing(null)}
          onUpdated={list.reload}
        />
      )}
    </section>
  );
}
