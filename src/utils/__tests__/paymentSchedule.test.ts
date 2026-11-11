import { nextPaymentAfter, paysOn } from '@/utils/paymentSchedule';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

describe('paysOn', () => {
  it('매월 결제는 시작일부터 같은 날짜마다 있고, 시작 전에는 없다', () => {
    const s = { startedAt: d(2026, 7, 17), cycle: 1, unit: '개월' as const };
    expect(paysOn(s, d(2026, 7, 17))).toBe(true);
    expect(paysOn(s, d(2026, 11, 17))).toBe(true);
    expect(paysOn(s, d(2026, 11, 18))).toBe(false);
    expect(paysOn(s, d(2026, 6, 17))).toBe(false);
  });

  it('3개월마다 결제는 3개월 간격 달에만 있다', () => {
    const s = { startedAt: d(2026, 8, 28), cycle: 3, unit: '개월' as const };
    expect(paysOn(s, d(2026, 11, 28))).toBe(true);
    expect(paysOn(s, d(2026, 10, 28))).toBe(false);
    expect(paysOn(s, d(2027, 2, 28))).toBe(true);
  });

  it('31일 시작은 짧은 달엔 마지막 날에 결제한다', () => {
    const s = { startedAt: d(2026, 1, 31), cycle: 1, unit: '개월' as const };
    expect(paysOn(s, d(2026, 2, 28))).toBe(true);
    expect(paysOn(s, d(2026, 4, 30))).toBe(true);
    expect(paysOn(s, d(2026, 3, 31))).toBe(true);
  });

  it('주·년 주기도 계산한다', () => {
    const weekly = { startedAt: d(2026, 11, 2), cycle: 2, unit: '주' as const };
    expect(paysOn(weekly, d(2026, 11, 16))).toBe(true);
    expect(paysOn(weekly, d(2026, 11, 9))).toBe(false);
    const yearly = { startedAt: d(2025, 3, 1), cycle: 1, unit: '년' as const };
    expect(paysOn(yearly, d(2026, 3, 1))).toBe(true);
    expect(paysOn(yearly, d(2026, 4, 1))).toBe(false);
  });
});

describe('nextPaymentAfter', () => {
  const s = { startedAt: d(2026, 7, 17), cycle: 1, unit: '개월' as const };

  it('결제일을 고르면 그 다음 결제일 (그날은 빼고)', () => {
    expect(nextPaymentAfter(s, d(2026, 4, 17))).toEqual(d(2026, 7, 17));
    expect(nextPaymentAfter(s, d(2026, 10, 17))).toEqual(d(2026, 11, 17));
  });

  it('결제일 사이 날짜면 다가오는 결제일', () => {
    expect(nextPaymentAfter(s, d(2026, 11, 12))).toEqual(d(2026, 11, 17));
  });
});
