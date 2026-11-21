import { http } from 'msw';

import { billingDates, db, toDate, today, toIso } from '../db.ts';
import { ok } from '../response.ts';

const monthPayments = (year: number, month: number) => {
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0);
  // 이용 시작일 전은 빼고, 해지한 구독은 해지일 전까지만
  return db.subscriptions.flatMap((s) => {
    const start = toDate(s.startedAt);
    const end = s.canceledAt ? toDate(s.canceledAt) : to;
    return billingDates(s, from > start ? from : start, end < to ? end : to).map((date) => ({
      date: toIso(date),
      payment: {
        subscriptionId: s.subscriptionId,
        serviceName: s.serviceName,
        logoUrl: s.logoUrl,
        amount: s.amount,
        billingCycleValue: s.billingCycleValue,
        billingCycleUnit: s.billingCycleUnit,
        paymentMethod: s.paymentMethod,
      },
    }));
  });
};

const total = (list: ReturnType<typeof monthPayments>) =>
  list.reduce((sum, p) => sum + p.payment.amount, 0);

export const calendarHandlers = [
  http.get('/api/v1/calendar', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const now = today();
    const list = monthPayments(
      Number(params.get('year') ?? now.getFullYear()),
      Number(params.get('month') ?? now.getMonth() + 1),
    );
    const days = [...new Set(list.map((p) => p.date))].sort().map((date) => {
      const payments = list.filter((p) => p.date === date);
      return { date, totalAmount: total(payments), payments: payments.map((p) => p.payment) };
    });
    return ok('월별 결제 일정을 조회했습니다.', {
      currentMonthTotal: total(monthPayments(now.getFullYear(), now.getMonth() + 1)),
      days,
    });
  }),
];
