/** ISO 문자열을 'YYYY-MM-DD HH:mm' (KST) 로 표기. 실패 시 원문 반환. */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Seoul',
  }).format(d);
}
