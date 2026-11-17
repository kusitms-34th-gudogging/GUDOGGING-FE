import { http } from 'msw';

import { cancelGuide, DEFAULT_GUIDE } from '../cancelGuides.ts';
import {
  billingDates,
  type Checkup,
  type CycleUnit,
  daysBetween,
  db,
  findSubscription,
  monthlyAmount,
  nextBilling,
  nowIso,
  type Subscription,
  toDate,
  today,
  toIso,
  uuid,
} from '../db.ts';
import { fail, notFound, ok } from '../response.ts';
import { services } from './service.ts';

interface NewSubscription {
  serviceId: string | null;
  serviceName: string;
  category: string;
  amount: number;
  billingCycleValue: number;
  billingCycleUnit: CycleUnit;
  nextBillingDate: string;
  paymentMethod: string;
}

// 해지 전까지(구독 중이면 오늘까지) 시작일 이후 결제 횟수
const paidCount = (s: Subscription) =>
  billingDates(s, toDate(s.startedAt), s.canceledAt ? toDate(s.canceledAt) : today()).length;

const listItem = (s: Subscription) => {
  const next = s.status === 'ACTIVE' ? nextBilling(s) : null;
  return {
    subscriptionId: s.subscriptionId,
    serviceName: s.serviceName,
    logoUrl: s.logoUrl,
    amount: s.amount,
    billingCycleValue: s.billingCycleValue,
    billingCycleUnit: s.billingCycleUnit,
    // 임의: 명세에 구독 종료 항목의 다음 결제일 값이 없어 null (백엔드 확인 필요)
    nextBillingDate: next ? toIso(next) : null,
    dDay: next ? daysBetween(today(), next) : null,
    canceledAt: s.canceledAt,
    totalPaidAmount: s.status === 'ENDED' ? s.amount * paidCount(s) : null,
  };
};

const SORTS: Record<string, (a: Subscription, b: Subscription) => number> = {
  NEXT_BILLING_DATE: (a, b) => nextBilling(a).getTime() - nextBilling(b).getTime(),
  CANCELED_AT: (a, b) => (b.canceledAt ?? '').localeCompare(a.canceledAt ?? ''),
  AMOUNT_DESC: (a, b) => b.amount - a.amount,
};

const answersOf = (c: Checkup) => ({
  usageAnswer: c.answerTexts.USAGE,
  satisfactionAnswer: c.answerTexts.SATISFACTION,
  planAnswer: c.answerTexts.PLAN,
});

// /drafts·/screenshots는 /:subscriptionId보다 먼저 (MSW는 먼저 등록한 핸들러로 응답)
export const subscriptionHandlers = [
  http.get('/api/v1/subscriptions/drafts', () => ok('임시저장을 조회했습니다.', db.draft)),
  http.put('/api/v1/subscriptions/drafts', async ({ request }) => {
    const { items, lastStep } = (await request.json()) as { items: unknown[]; lastStep: string };
    db.draft = { savedAt: nowIso(), lastStep, items };
    return ok('임시저장했습니다.', { savedAt: db.draft.savedAt });
  }),
  http.delete('/api/v1/subscriptions/drafts', () => {
    db.draft = null;
    return ok('임시저장을 삭제했습니다.');
  }),
  http.post('/api/v1/subscriptions/screenshots/analyses', () =>
    ok('스크린샷을 분석했습니다.', {
      candidates: [
        {
          serviceId: '5e1c9a07-5a4d-4e7b-9c21-000000000002',
          serviceName: 'YouTube Premium',
          logoUrl: 'https://cdn.gudogging.com/logos/youtube-premium.png',
          category: 'VIDEO_OTT',
          amount: 14900,
          billingCycleValue: 1,
          billingCycleUnit: 'MONTH',
          nextBillingDate: '2026-11-18',
          paymentMethod: 'APP_STORE',
          needsReview: false,
        },
        {
          serviceId: '5e1c9a07-5a4d-4e7b-9c21-000000000003',
          serviceName: 'ChatGPT Plus',
          logoUrl: 'https://cdn.gudogging.com/logos/chatgpt.png',
          category: 'PRODUCTIVITY_AI',
          amount: null,
          billingCycleValue: 1,
          billingCycleUnit: 'MONTH',
          nextBillingDate: '2026-11-12',
          paymentMethod: 'APP_STORE',
          needsReview: true,
        },
        {
          serviceId: null,
          serviceName: '기타 구독 후보',
          logoUrl: null,
          category: 'ETC',
          amount: null,
          billingCycleValue: null,
          billingCycleUnit: null,
          nextBillingDate: null,
          paymentMethod: null,
          needsReview: true,
        },
      ],
    }),
  ),

  http.get('/api/v1/subscriptions', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const status = params.get('status') ?? 'ACTIVE';
    const sort = params.get('sort') ?? (status === 'ENDED' ? 'CANCELED_AT' : 'NEXT_BILLING_DATE');
    const active = db.subscriptions.filter((s) => s.status === 'ACTIVE');
    const ended = db.subscriptions.filter((s) => s.status === 'ENDED');
    const tab = (status === 'ENDED' ? ended : active).toSorted(SORTS[sort]);
    return ok('구독 목록을 조회했습니다.', {
      count: tab.length,
      activeCount: active.length,
      endedCount: ended.length,
      monthlyTotal: tab.reduce((sum, s) => sum + monthlyAmount(s), 0),
      subscriptions: tab.map(listItem),
    });
  }),
  http.post('/api/v1/subscriptions', async ({ request }) => {
    const body = (await request.json()) as { subscriptions: NewSubscription[] };
    const taken = new Set(
      db.subscriptions.filter((s) => s.status === 'ACTIVE').map((s) => s.serviceName),
    );
    // 임의: 중복 등록 에러 코드·문구는 명세에 없음
    if (body.subscriptions.some((s) => taken.has(s.serviceName))) {
      return fail(409, '이미 등록한 서비스예요.');
    }
    const created = body.subscriptions.map((s): Subscription => ({
      ...s,
      subscriptionId: uuid(),
      logoUrl: services.find((v) => v.serviceId === s.serviceId)?.logoUrl ?? null,
      // 임의: 명세에 이용 시작일을 받는 필드가 없어 등록일로
      startedAt: toIso(today()),
      status: 'ACTIVE',
      canceledAt: null,
      isSteady: false,
    }));
    db.subscriptions.push(...created);
    db.draft = null;
    return ok(
      '구독을 등록했습니다.',
      {
        createdCount: created.length,
        subscriptions: created.map((s) => ({
          subscriptionId: s.subscriptionId,
          serviceName: s.serviceName,
          logoUrl: s.logoUrl,
          amount: s.amount,
          billingCycleValue: s.billingCycleValue,
          billingCycleUnit: s.billingCycleUnit,
          nextBillingDate: s.nextBillingDate,
          paymentMethod: s.paymentMethod,
        })),
      },
      201,
    );
  }),
  http.delete('/api/v1/subscriptions', async ({ request }) => {
    const { subscriptionIds } = (await request.json()) as { subscriptionIds: string[] };
    // 명세: 하나라도 없으면 전체 실패 (부분 삭제 없음)
    if (!subscriptionIds.every(findSubscription)) return notFound();
    db.subscriptions = db.subscriptions.filter((s) => !subscriptionIds.includes(s.subscriptionId));
    db.checkups = db.checkups.filter((c) => !subscriptionIds.includes(c.subscriptionId));
    return ok('구독을 삭제했습니다.', { deletedCount: subscriptionIds.length });
  }),

  // baseDate(캘린더 C-03에서 고른 날짜)가 있으면 그날 다음(그날 제외) 결제일, 없으면 오늘 이후
  http.get('/api/v1/subscriptions/:subscriptionId', ({ params, request }) => {
    const s = findSubscription(params.subscriptionId as string);
    if (!s) return notFound();
    const baseDate = new URL(request.url).searchParams.get('baseDate');
    const base = baseDate && toDate(baseDate);
    const next = base
      ? nextBilling(s, new Date(base.getFullYear(), base.getMonth(), base.getDate() + 1))
      : nextBilling(s);
    const checkups = db.checkups.filter((c) => c.subscriptionId === s.subscriptionId);
    const latest = checkups.at(-1);
    return ok('구독 상세를 조회했습니다.', {
      subscriptionId: s.subscriptionId,
      status: s.status,
      serviceName: s.serviceName,
      logoUrl: s.logoUrl,
      category: s.category,
      amount: s.amount,
      billingCycleValue: s.billingCycleValue,
      billingCycleUnit: s.billingCycleUnit,
      nextBillingDate: toIso(next),
      startedAt: s.startedAt,
      paymentMethod: s.paymentMethod,
      isSteady: s.isSteady,
      canceledAt: s.canceledAt,
      yearlyAmount: monthlyAmount(s) * 12,
      totalPaidAmount: s.amount * paidCount(s),
      paidCount: paidCount(s),
      dDay: daysBetween(today(), next),
      latestCheckup: latest && {
        checkupId: latest.checkupId,
        checkedAt: latest.checkedAt,
        decision: latest.decision,
        stage: latest.stage,
        score: latest.score,
        ...answersOf(latest),
        memo: latest.memo,
        cancelReasons: latest.cancelReasons,
        cancelReasonText: latest.cancelReasonText,
      },
      pastCheckups: checkups.toReversed().map((c) => ({
        checkedAt: c.checkedAt,
        ...answersOf(c),
        decision: c.decision,
      })),
      // ponytail: 3개월 평균 대신 최근 점검 1건 그대로, 평균 화면 확인이 필요해지면 계산
      pastCheckupAverage: latest && {
        periodFrom: latest.checkedAt,
        periodTo: latest.checkedAt,
        ...answersOf(latest),
        score: latest.score,
        stage: latest.stage,
      },
    });
  }),
  http.patch('/api/v1/subscriptions/:subscriptionId', async ({ params, request }) => {
    const s = findSubscription(params.subscriptionId as string);
    if (!s) return notFound();
    Object.assign(s, (await request.json()) as Partial<NewSubscription>);
    return ok('구독 정보를 수정했습니다.', {
      subscriptionId: s.subscriptionId,
      yearlyAmount: monthlyAmount(s) * 12,
      nextBillingDate: toIso(nextBilling(s)),
    });
  }),
  http.get('/api/v1/subscriptions/:subscriptionId/cancel-guide', ({ params }) => {
    const s = findSubscription(params.subscriptionId as string);
    if (!s) return notFound();
    const guide = cancelGuide(s.paymentMethod, s.serviceId);
    return ok('해지 안내를 조회했습니다.', {
      serviceName: s.serviceName,
      paymentMethod: s.paymentMethod,
      steps: guide?.steps ?? [],
      cancelUrl: guide?.cancelUrl ?? null,
      caution: guide?.caution ?? null,
      // 해지 경로가 없을 때만 기본 안내 (명세)
      guideMessage: guide ? null : DEFAULT_GUIDE,
      lastVerifiedAt: '2026-10-20',
    });
  }),
  http.patch('/api/v1/subscriptions/:subscriptionId/cancel', ({ params }) => {
    const s = findSubscription(params.subscriptionId as string);
    if (!s) return notFound();
    s.status = 'ENDED';
    s.canceledAt = toIso(today());
    return ok('구독을 해지 완료 처리했습니다.', {
      subscriptionId: s.subscriptionId,
      status: s.status,
      canceledAt: s.canceledAt,
    });
  }),
  http.patch('/api/v1/subscriptions/:subscriptionId/reactivate', async ({ params, request }) => {
    const s = findSubscription(params.subscriptionId as string);
    if (!s) return notFound();
    const { nextBillingDate } = (await request.json()) as { nextBillingDate: string };
    Object.assign(s, { status: 'ACTIVE', canceledAt: null, nextBillingDate });
    return ok('구독을 재등록했습니다.', { subscriptionId: s.subscriptionId, status: s.status });
  }),
  http.patch('/api/v1/subscriptions/:subscriptionId/steady', async ({ params, request }) => {
    const s = findSubscription(params.subscriptionId as string);
    if (!s) return notFound();
    s.isSteady = ((await request.json()) as { isSteady: boolean }).isSteady;
    return ok('설정을 변경했습니다.', { subscriptionId: s.subscriptionId, isSteady: s.isSteady });
  }),
];
