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
    monthlyAmount: monthlyAmount(s),
    billingCycleValue: s.billingCycleValue,
    billingCycleUnit: s.billingCycleUnit,
    // 구독 종료면 다음 결제일·dDay null (명세)
    nextBillingDate: next ? toIso(next) : null,
    dDay: next ? daysBetween(today(), next) : null,
    canceledAt: s.canceledAt,
    totalPaidAmount: s.status === 'ENDED' ? s.amount * paidCount(s) : null,
  };
};

const SORTS: Record<string, (a: Subscription, b: Subscription) => number> = {
  NEXT_BILLING_DATE: (a, b) => nextBilling(a).getTime() - nextBilling(b).getTime(),
  CANCELED_AT: (a, b) => (b.canceledAt ?? '').localeCompare(a.canceledAt ?? ''),
  // 금액 높은 순은 탭 우측 금액 기준: 구독 중 amount, 구독 종료 monthlyAmount (명세)
  AMOUNT_DESC: (a, b) =>
    a.status === 'ENDED' ? monthlyAmount(b) - monthlyAmount(a) : b.amount - a.amount,
};
// 탭과 맞지 않는 정렬은 400 (명세)
const SORT_OF_TAB: Record<string, string[]> = {
  ACTIVE: ['NEXT_BILLING_DATE', 'AMOUNT_DESC'],
  ENDED: ['CANCELED_AT', 'AMOUNT_DESC'],
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
    const { items, lastStep, editingItemIndex } = (await request.json()) as {
      items: unknown[];
      lastStep: string;
      editingItemIndex?: number | null;
    };
    db.draft = { savedAt: nowIso(), lastStep, editingItemIndex: editingItemIndex ?? null, items };
    return ok('임시저장했습니다.', { savedAt: db.draft.savedAt });
  }),
  http.delete('/api/v1/subscriptions/drafts', () => {
    db.draft = null;
    return ok('임시저장을 삭제했습니다.');
  }),
  http.post('/api/v1/subscriptions/screenshots/analyses', async ({ request }) => {
    // 업로드 본문을 다 읽고 응답 (안 읽으면 큰 이미지 전송 중에 연결이 끊겨 앱에 "network connection was lost")
    await request.formData();
    // 노션 명세 mock data. serviceId·주기·결제 수단은 항상 있고, 못 읽은 금액·다음 결제일만 null
    return ok('스크린샷을 분석했습니다.', {
      candidates: [
        {
          serviceId: '5e1c9a07-5a4d-4e7b-9c21-000000000002',
          serviceName: 'YouTube Premium',
          logoUrl: 'https://cdn.gudogging.com/logos/youtube-premium.png',
          category: 'VIDEO_OTT',
          amount: 14900,
          billingCycleValue: 1,
          billingCycleUnit: 'MONTH',
          nextBillingDate: '2026-12-18',
          paymentMethod: 'APP_STORE',
          needsReview: false,
          reviewFields: [],
        },
        {
          serviceId: '5e1c9a07-5a4d-4e7b-9c21-000000000003',
          serviceName: 'ChatGPT Plus',
          logoUrl: 'https://cdn.gudogging.com/logos/chatgpt.png',
          category: 'PRODUCTIVITY_AI',
          amount: null,
          billingCycleValue: 1,
          billingCycleUnit: 'MONTH',
          nextBillingDate: '2026-12-12',
          paymentMethod: 'APP_STORE',
          needsReview: true,
          reviewFields: ['AMOUNT'],
        },
      ],
    });
  }),

  http.get('/api/v1/subscriptions', ({ request }) => {
    const params = new URL(request.url).searchParams;
    const status = params.get('status') ?? 'ACTIVE';
    const sort = params.get('sort') ?? (status === 'ENDED' ? 'CANCELED_AT' : 'NEXT_BILLING_DATE');
    if (!SORT_OF_TAB[status]?.includes(sort)) {
      return fail(400, 40403, '구독 상태에 맞지 않는 정렬 기준입니다.');
    }
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
    // 이미 구독 중인 서비스 중복 등록은 서버가 거부하지만(명세) 오류 코드가 명세에 없어 목서버는 받음
    const body = (await request.json()) as { subscriptions: NewSubscription[] };
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
    const body = (await request.json()) as { subscriptionIds: string[] };
    // 명세: 중복 ID는 한 번으로, 하나라도 없으면 전체 실패 (부분 삭제 없음)
    const subscriptionIds = [...new Set(body.subscriptionIds)];
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
    // 지난 점검은 오늘 기준 최근 90일 (baseDate와 무관, 명세)
    const t = today();
    const from = new Date(t.getFullYear(), t.getMonth(), t.getDate() - 90);
    const recent = checkups.filter((c) => toDate(c.checkedAt) >= from);
    const ended = s.status === 'ENDED';
    return ok('구독 상세를 조회했습니다.', {
      subscriptionId: s.subscriptionId,
      status: s.status,
      serviceName: s.serviceName,
      logoUrl: s.logoUrl,
      category: s.category,
      amount: s.amount,
      billingCycleValue: s.billingCycleValue,
      billingCycleUnit: s.billingCycleUnit,
      // 구독 종료면 다음 결제일·dDay null (명세)
      nextBillingDate: ended ? null : toIso(next),
      startedAt: s.startedAt,
      paymentMethod: s.paymentMethod,
      isSteady: s.isSteady,
      canceledAt: s.canceledAt,
      yearlyAmount: monthlyAmount(s) * 12,
      totalPaidAmount: s.amount * paidCount(s),
      paidCount: paidCount(s),
      dDay: ended ? null : daysBetween(today(), next),
      latestCheckup: latest && {
        checkupId: latest.checkupId,
        checkedAt: latest.checkedAt,
        decision: latest.decision,
        stage: latest.stage,
        score: latest.score,
        ...answersOf(latest),
        memo: latest.memo,
        cancelReasonText: latest.cancelReasonText,
      },
      pastCheckups: recent.toReversed().map((c) => ({
        checkedAt: c.checkedAt,
        ...answersOf(c),
        decision: c.decision,
      })),
      // ponytail: 90일 평균 대신 그 안의 최근 점검 1건 그대로, 평균 화면 확인이 필요해지면 계산
      pastCheckupAverage: recent.length
        ? {
            periodFrom: toIso(from),
            periodTo: toIso(today()),
            ...answersOf(recent.at(-1)!),
            score: recent.at(-1)!.score,
            stage: recent.at(-1)!.stage,
          }
        : null,
    });
  }),
  http.patch('/api/v1/subscriptions/:subscriptionId', async ({ params, request }) => {
    const s = findSubscription(params.subscriptionId as string);
    if (!s) return notFound();
    if (s.status === 'ENDED') return fail(409, 40405, '구독 중인 구독만 수정할 수 있습니다.');
    // serviceName만 선택, 사전 등록 서비스면 무시 (명세)
    const { serviceName, ...rest } = (await request.json()) as Partial<NewSubscription>;
    Object.assign(s, rest, serviceName && !s.serviceId && { serviceName });
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
    // 입력한 정보로 덮어쓰고 시작일은 재등록일 (명세). 사전 등록 서비스면 serviceName 무시
    const { serviceName, ...rest } = (await request.json()) as Partial<Subscription>;
    Object.assign(s, rest, serviceName && !s.serviceId && { serviceName }, {
      status: 'ACTIVE',
      canceledAt: null,
      startedAt: toIso(today()),
    });
    return ok('구독을 재등록했습니다.', { subscriptionId: s.subscriptionId, status: s.status });
  }),
  http.patch('/api/v1/subscriptions/:subscriptionId/steady', async ({ params, request }) => {
    const s = findSubscription(params.subscriptionId as string);
    if (!s) return notFound();
    s.isSteady = ((await request.json()) as { isSteady: boolean }).isSteady;
    return ok('설정을 변경했습니다.', { subscriptionId: s.subscriptionId, isSteady: s.isSteady });
  }),
];
