import type { PaymentInfo } from '@/constants/services';
import { formatPaymentSummary, formatWon } from '@/utils/formatPayment';

const info: PaymentInfo = {
  category: '영상·OTT',
  amount: 17000,
  cycle: 1,
  unit: '개월',
  nextDate: new Date(2026, 10, 12),
  paidAt: 'web',
};

describe('formatPayment', () => {
  it('주기 1이면 매월처럼, 아니면 n단위마다로 요약한다', () => {
    expect(formatPaymentSummary(info)).toBe('11월 12일 결제 · 매월 · 웹·직접 결제');
    expect(formatPaymentSummary({ ...info, cycle: 2, unit: '주', paidAt: 'appstore' })).toBe(
      '11월 12일 결제 · 2주마다 · App Store',
    );
  });

  it('금액에 천 단위 쉼표와 원을 붙인다', () => {
    expect(formatWon(17000)).toBe('17,000원');
    expect(formatWon(1234567)).toBe('1,234,567원');
    expect(formatWon(900)).toBe('900원');
  });
});
