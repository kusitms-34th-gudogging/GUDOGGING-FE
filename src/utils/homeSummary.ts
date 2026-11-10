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

// 결제일에서 주기 k번 뒤(음수면 앞). 월·년은 말일을 넘기면 그 달 말일로
// 항상 원래 결제일에서 한 번에 옮김 (한 칸씩 옮기면 3/31 → 2/28 → 1/28처럼 말일 보정이 쌓임)
const shift = (date: Date, { cycle, unit }: HomeSubscription, k: number) => {
  const n = cycle * k;
  if (unit === '일') return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
  if (unit === '주') return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n * 7);
  const months = unit === '개월' ? n : n * 12;
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay));
};

// from~to(포함) 사이 결제 횟수. 다음 결제일 전에도 같은 주기로 결제됐다고 봄
const paymentsBetween = (s: HomeSubscription, from: Date, to: Date) => {
  if (!s.nextDate) return 0;
  const anchor = startOfDay(s.nextDate);
  let k = 0;
  while (shift(anchor, s, k) >= from) k--;
  let count = 0;
  for (k++; shift(anchor, s, k) <= to; k++) count++;
  return count;
};

const sumBetween = (subs: HomeSubscription[], from: Date, to: Date) =>
  subs.reduce((sum, s) => sum + s.amount * paymentsBetween(s, from, to), 0);

// 결제 예정: 오늘~이번 달 말일
export const monthDue = (subs: HomeSubscription[], today: Date) =>
  sumBetween(subs, startOfDay(today), new Date(today.getFullYear(), today.getMonth() + 1, 0));

// 연 금액: 올해 1월~12월
export const yearTotal = (subs: HomeSubscription[], today: Date) =>
  sumBetween(subs, new Date(today.getFullYear(), 0, 1), new Date(today.getFullYear(), 11, 31));

// 곧 다가오는 결제: 7일 안, 남은 날 적은 순(같으면 금액 큰 순) 최대 3개. 없으면 가장 가까운 1건(within7 false)
export const upcomingPayments = (subs: HomeSubscription[], today: Date) => {
  const dated = subs
    .filter((s) => s.nextDate && daysUntil(s.nextDate, today) >= 0)
    .sort(
      (a, b) =>
        daysUntil(a.nextDate!, today) - daysUntil(b.nextDate!, today) || b.amount - a.amount,
    );
  const within7 = dated.filter((s) => daysUntil(s.nextDate!, today) <= 7);
  return within7.length > 0
    ? { within7: true, items: within7.slice(0, 3) }
    : { within7: false, items: dated.slice(0, 1) };
};

// 월로 환산한 금액 (원 단위 반올림)
const monthly = ({ amount, cycle, unit }: HomeSubscription) => {
  const perMonth = { 일: 365 / 12, 주: 52 / 12, 개월: 1, 년: 1 / 12 }[unit];
  return Math.round((amount * perMonth) / cycle);
};

// 사용 현황: 최근 점검 활용도 60% 미만, 결제일 가까운 순 최대 2개 + 그 구독들의 월 합계
// shortcut: '유지하기'를 고른 구독 제외 없음, 점검 결과 저장이 생기면 제외
export const lowUsage = (subs: HomeSubscription[]) => {
  const low = subs
    .filter((s) => s.usage !== undefined && s.usage < 60)
    .sort((a, b) => (a.nextDate?.getTime() ?? Infinity) - (b.nextDate?.getTime() ?? Infinity));
  return { items: low.slice(0, 2), monthTotal: low.reduce((sum, s) => sum + monthly(s), 0) };
};

// 점검하러 가기: 결제일이 가장 가까운 구독
// shortcut: '꾸준히 쓰는 구독' 제외 기준 없음, 점검 결과 저장이 생기면 제외
export const nextCheckupTarget = (subs: HomeSubscription[], today: Date) =>
  upcomingPayments(subs, today).items[0] ?? subs[0];
