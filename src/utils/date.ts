// API 날짜(yyyy-MM-dd) ↔ 로컬 자정 Date
// new Date('2026-11-20')는 UTC 자정이라 시간대에 따라 하루 밀릴 수 있어 직접 나눔
export const parseDate = (value: string) => {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const formatDate = (date: Date) =>
  [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((n) => String(n).padStart(2, '0'))
    .join('-');
