import { PAID_AT, type PaymentInfo } from '@/constants/services';

const EVERY: Record<string, string> = { 일: '매일', 주: '매주', 개월: '매월', 년: '매년' };

export const formatWon = (amount: number) =>
  `${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원`;

// 예: 11월 12일 결제 · 매월 · 웹·직접 결제
export const formatPaymentSummary = ({ nextDate, cycle, unit, paidAt }: PaymentInfo) => {
  const when = `${nextDate.getMonth() + 1}월 ${nextDate.getDate()}일 결제`;
  const every = cycle === 1 ? EVERY[unit] : `${cycle}${unit}마다`;
  const where = PAID_AT.find((p) => p.value === paidAt)?.label;
  return `${when} · ${every} · ${where}`;
};
