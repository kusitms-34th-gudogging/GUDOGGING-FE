export interface HomeSubscription {
  id: string;
  name: string;
  amount: number;
  cycle: number;
  unit: '일' | '주' | '개월' | '년';
  nextDate?: Date;
  usage?: number;
  checked?: boolean;
}

const DAY = 24 * 60 * 60 * 1000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const daysUntil = (date: Date, today: Date) =>
  Math.round((startOfDay(date).getTime() - startOfDay(today).getTime()) / DAY);

// 월로 환산한 금액 (원 단위 반올림)
export const monthly = ({ amount, cycle, unit }: HomeSubscription) => {
  const perMonth = { 일: 365 / 12, 주: 52 / 12, 개월: 1, 년: 1 / 12 }[unit];
  return Math.round((amount * perMonth) / cycle);
};
