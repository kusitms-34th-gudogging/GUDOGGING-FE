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

// 결제 당일은 D-0 대신 D-day
export const dDayLabel = (dDay: number) => (dDay === 0 ? 'D-day' : `D-${dDay}`);

export const startOfToday = () => new Date(new Date().setHours(0, 0, 0, 0));

export const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

// 캘린더 달을 이어진 번호(page)로 다뤄서 스와이프 위치를 page × 화면 폭으로 계산
export const pageOf = (d: Date) => d.getFullYear() * 12 + d.getMonth();
export const monthOf = (page: number) => new Date(Math.floor(page / 12), page % 12, 1);

// 이번 달 1일이 든 주의 일요일부터 이번 달이 끝나는 주까지
export const monthCells = (month: Date) => {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return Array.from(
    { length: Math.ceil((first.getDay() + days) / 7) * 7 },
    (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1 - first.getDay()),
  );
};
