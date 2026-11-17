import { http } from 'msw';

import {
  billingDates,
  daysBetween,
  db,
  latestCheckup,
  monthlyAmount,
  nextBilling,
  type Subscription,
  today,
  toIso,
} from '../db.ts';
import { ok } from '../response.ts';
import { notifications } from './notification.ts';

const sumBetween = (subs: Subscription[], from: Date, to: Date) =>
  subs.reduce((sum, s) => sum + s.amount * billingDates(s, from, to).length, 0);

const payment = (s: Subscription) => ({
  subscriptionId: s.subscriptionId,
  serviceName: s.serviceName,
  logoUrl: s.logoUrl,
  amount: s.amount,
  nextBillingDate: toIso(nextBilling(s)),
  dDay: daysBetween(today(), nextBilling(s)),
});

export const homeHandlers = [
  http.get('/api/v1/home', () => {
    const now = today();
    const active = db.subscriptions
      .filter((s) => s.status === 'ACTIVE')
      .toSorted(
        (a, b) => nextBilling(a).getTime() - nextBilling(b).getTime() || b.amount - a.amount,
      );
    const within7 = active.filter((s) => daysBetween(now, nextBilling(s)) <= 7);
    // 활용도 60% 미만이고 '유지하기'를 고르지 않은 구독, 꾸준히 쓰는 구독 제외
    const unused = active.filter((s) => {
      const c = latestCheckup(s.subscriptionId);
      return !s.isSteady && c && c.score < 60 && c.decision !== 'KEEP';
    });
    const unusedMonthly = unused.reduce((sum, s) => sum + monthlyAmount(s), 0);
    return ok('홈 정보를 조회했습니다.', {
      summary: {
        expectedAmount: sumBetween(active, now, new Date(now.getFullYear(), now.getMonth() + 1, 0)),
        yearlyAmount: sumBetween(
          active,
          new Date(now.getFullYear(), 0, 1),
          new Date(now.getFullYear(), 11, 31),
        ),
        subscriptionCount: active.length,
        logos: active.flatMap((s) => (s.logoUrl ? [s.logoUrl] : [])).slice(0, 10),
      },
      upcomingPayments: within7.slice(0, 3).map((s) => ({
        ...payment(s),
        // ponytail: 최근 한 주기 안에 점검 기록이 있으면 완료로 봄, 정확한 결제 주기 판정은 서버
        needsCheckup: !db.checkups.some(
          (c) =>
            c.subscriptionId === s.subscriptionId &&
            billingDates(s, new Date(c.checkedAt), nextBilling(s)).length <= 1,
        ),
      })),
      nearestPayment: within7.length === 0 && active[0] ? payment(active[0]) : null,
      usage: {
        hasCheckup: db.checkups.length > 0,
        nudgeSubscriptionId: active.find((s) => !s.isSteady)?.subscriptionId ?? null,
        unusedCount: unused.length,
        monthlyAmount: unusedMonthly,
        yearlyAmount: unusedMonthly * 12,
        items: unused.slice(0, 2).map((s) => ({
          subscriptionId: s.subscriptionId,
          serviceName: s.serviceName,
          logoUrl: s.logoUrl,
          amount: s.amount,
          nextBillingDate: toIso(nextBilling(s)),
        })),
      },
      hasUnreadNotification: notifications.some(
        (n) => !db.readNotificationIds.has(n.notificationId),
      ),
    });
  }),
];
