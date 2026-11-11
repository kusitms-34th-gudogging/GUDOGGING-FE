import type { HomeSubscription } from '@/utils/homeSummary';

// 구독 시작일부터 결제 주기마다 결제한다고 보고 결제일을 계산 (CAL-001 미래 달 결제 예정일)
type Schedule = Pick<HomeSubscription, 'cycle' | 'unit'> & { startedAt: Date };

const DAY = 24 * 60 * 60 * 1000;
const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const daysBetween = (from: Date, to: Date) =>
  Math.round((dayStart(to).getTime() - dayStart(from).getTime()) / DAY);

// n번째 결제일. 월·년 주기에서 그 달에 없는 날(31일 등)은 그 달 마지막 날
const nthPayment = ({ startedAt: s, cycle, unit }: Schedule, n: number) => {
  if (unit === '일' || unit === '주') {
    const days = (unit === '주' ? 7 : 1) * cycle * n;
    return new Date(s.getFullYear(), s.getMonth(), s.getDate() + days);
  }
  const month = s.getMonth() + (unit === '년' ? 12 : 1) * cycle * n;
  const last = new Date(s.getFullYear(), month + 1, 0).getDate();
  return new Date(s.getFullYear(), month, Math.min(s.getDate(), last));
};

// 대략 몇 번째 결제인지 (아래로 맞춘 값). 정확한 날짜 비교는 nthPayment로
const roughIndex = ({ startedAt: s, cycle, unit }: Schedule, date: Date) => {
  if (unit === '일' || unit === '주') {
    return Math.floor(daysBetween(s, date) / ((unit === '주' ? 7 : 1) * cycle));
  }
  const months = (date.getFullYear() - s.getFullYear()) * 12 + date.getMonth() - s.getMonth();
  return Math.floor(months / ((unit === '년' ? 12 : 1) * cycle));
};

// 그 날짜에 결제가 있는지 (시작일 이전은 없음)
export const paysOn = (schedule: Schedule, date: Date) => {
  const n = roughIndex(schedule, date);
  return n >= 0 && daysBetween(nthPayment(schedule, n), date) === 0;
};

// 그 날짜 다음(그날 제외) 첫 결제일 (CAL-003: 4월 17일 결제를 눌렀다면 5월 17일)
export const nextPaymentAfter = (schedule: Schedule, date: Date) => {
  let n = Math.max(roughIndex(schedule, date), 0);
  while (daysBetween(date, nthPayment(schedule, n)) <= 0) n += 1;
  return nthPayment(schedule, n);
};
