import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/apiClient';
import { API_BASE_URL, endpoints } from '../lib/endpoints';

type State = 'checking' | 'online' | 'offline';

const LABEL: Record<State, string> = {
  checking: '서버 확인 중…',
  online: '서버 연결됨',
  offline: '서버 연결 안 됨',
};

const DOT: Record<State, string> = {
  checking: 'bg-amber-400',
  online: 'bg-emerald-500',
  offline: 'bg-rose-500',
};

/** /health 를 호출해 백엔드 연결 상태를 배지로 보여준다. */
export function ConnectionStatus() {
  const [state, setState] = useState<State>('checking');

  useEffect(() => {
    let active = true;
    const ping = () => {
      apiFetch(endpoints.health)
        .then(() => active && setState('online'))
        .catch(() => active && setState('offline'));
    };
    ping();
    const timer = setInterval(ping, 15_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
      title={API_BASE_URL}
    >
      <span className={`h-2 w-2 rounded-full ${DOT[state]}`} />
      {LABEL[state]}
    </div>
  );
}
