import { http } from 'msw';

import { ok, SUBSCRIPTION_ID } from '../response.ts';

const netflix = {
  subscriptionId: SUBSCRIPTION_ID,
  serviceName: '넷플릭스',
  logoUrl: 'https://.../netflix.png',
  amount: 13500,
  billingCycleValue: 1,
  billingCycleUnit: 'MONTH',
};

const draftItems = [
  {
    serviceId: '5e1c9a07-5a4d-4e7b-9c21-000000000001',
    serviceName: 'Netflix',
    category: 'VIDEO_OTT',
    amount: 17000,
    billingCycleValue: 1,
    billingCycleUnit: 'MONTH',
    nextBillingDate: '2026-12-01',
    paymentMethod: 'WEB_DIRECT',
  },
  {
    serviceId: null,
    serviceName: '동네 헬스장',
    category: 'ETC',
    amount: null,
    billingCycleValue: null,
    billingCycleUnit: null,
    nextBillingDate: null,
    paymentMethod: null,
  },
];

// /drafts·/screenshots는 /:subscriptionId보다 먼저 (MSW는 먼저 등록한 핸들러로 응답)
export const subscriptionHandlers = [
  http.get('/api/v1/subscriptions/drafts', () =>
    ok('임시저장을 조회했습니다.', {
      savedAt: '2026-11-07T16:30:00',
      lastStep: 'INPUT_INFO',
      items: draftItems,
    }),
  ),
  http.put('/api/v1/subscriptions/drafts', () =>
    ok('임시저장했습니다.', { savedAt: '2026-11-07T16:30:00' }),
  ),
  http.delete('/api/v1/subscriptions/drafts', () => ok('임시저장을 삭제했습니다.')),
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
    const ended = new URL(request.url).searchParams.get('status') === 'ENDED';
    return ok('구독 목록을 조회했습니다.', {
      count: 1,
      activeCount: 1,
      // 임의: 명세 mock은 endedCount 0, 구독 종료 탭 확인용으로 1
      endedCount: 1,
      monthlyTotal: 13500,
      subscriptions: [
        ended
          ? // 임의: 명세 mock엔 구독 종료 항목이 없음. 종료 항목의 nextBillingDate·dDay가 null인지 백엔드 확인 필요
            {
              ...netflix,
              nextBillingDate: null,
              dDay: null,
              canceledAt: '2026-11-04',
              totalPaidAmount: 202500,
            }
          : {
              ...netflix,
              nextBillingDate: '2026-12-01',
              dDay: 27,
              canceledAt: null,
              totalPaidAmount: null,
            },
      ],
    });
  }),
  http.post('/api/v1/subscriptions', () =>
    ok(
      '구독을 등록했습니다.',
      {
        createdCount: 1,
        subscriptions: [
          {
            subscriptionId: SUBSCRIPTION_ID,
            serviceName: 'Netflix',
            logoUrl: 'https://cdn.gudogging.com/logos/netflix.png',
            amount: 13500,
            billingCycleValue: 1,
            billingCycleUnit: 'MONTH',
            nextBillingDate: '2026-12-01',
            paymentMethod: 'WEB_DIRECT',
          },
        ],
      },
      201,
    ),
  ),
  http.delete('/api/v1/subscriptions', async ({ request }) => {
    const { subscriptionIds } = (await request.json()) as { subscriptionIds: string[] };
    return ok('구독을 삭제했습니다.', { deletedCount: subscriptionIds.length });
  }),

  http.get('/api/v1/subscriptions/:subscriptionId', () =>
    ok('구독 상세를 조회했습니다.', {
      subscriptionId: SUBSCRIPTION_ID,
      status: 'ACTIVE',
      serviceName: '넷플릭스',
      logoUrl: 'https://cdn.gudogging.app/logos/netflix.png',
      category: 'VIDEO_OTT',
      amount: 17000,
      billingCycleValue: 1,
      billingCycleUnit: 'MONTH',
      startedAt: '2025-03-15',
      nextBillingDate: '2026-12-15',
      paymentMethod: 'WEB_DIRECT',
      isSteady: false,
      canceledAt: null,
      yearlyAmount: 204000,
      totalPaidAmount: 255000,
      paidCount: 15,
      dDay: 41,
      latestCheckup: {
        checkupId: 'b1d7a2c4-5a4d-4e7b-9c21-000000000012',
        checkedAt: '2026-11-10',
        decision: 'KEEP',
        // 임의: 명세 mock은 KEEP_RECOMMENDED인데 구간(60~79)상 KEEP_CONSIDER, 백엔드 확인 필요
        stage: 'KEEP_CONSIDER',
        score: 72,
        usageAnswer: '주 3~4회',
        satisfactionAnswer: '만족',
        planAnswer: '적당함',
        memo: '가족과 같이 봄',
        // 임의: cancelReasons·cancelReasonText는 명세 mock에 없음
        cancelReasons: [],
        cancelReasonText: null,
      },
      pastCheckups: [
        {
          checkedAt: '2026-05-10',
          usageAnswer: '주 1~2회',
          satisfactionAnswer: '보통',
          planAnswer: '비쌈',
          decision: 'KEEP',
        },
      ],
      // 임의: pastCheckupAverage는 명세 mock에 없어 필드 표 보고 채움
      pastCheckupAverage: {
        periodFrom: '2026-08-01',
        periodTo: '2026-11-10',
        usageAnswer: '주 3~4회',
        satisfactionAnswer: '만족',
        planAnswer: '적당함',
        score: 72,
        stage: 'KEEP_CONSIDER',
      },
    }),
  ),
  http.patch('/api/v1/subscriptions/:subscriptionId', () =>
    ok('구독 정보를 수정했습니다.', {
      subscriptionId: SUBSCRIPTION_ID,
      yearlyAmount: 162000,
      nextBillingDate: '2026-12-01',
    }),
  ),
  http.get('/api/v1/subscriptions/:subscriptionId/cancel-guide', () =>
    ok('해지 안내를 조회했습니다.', {
      serviceName: '넷플릭스',
      paymentMethod: 'WEB_DIRECT',
      steps: ['넷플릭스 접속', '멤버십 관리', '멤버십 해지'],
      cancelUrl: 'https://www.netflix.com/cancelplan',
      caution: '해지해도 결제 기간 끝까지 이용 가능',
      // 임의: guideMessage는 명세 mock에 없음 (steps가 있으면 null이라는 설명대로)
      guideMessage: null,
      lastVerifiedAt: '2026-10-20',
    }),
  ),
  http.patch('/api/v1/subscriptions/:subscriptionId/cancel', () =>
    ok('구독을 해지 완료 처리했습니다.', {
      subscriptionId: SUBSCRIPTION_ID,
      status: 'ENDED',
      canceledAt: '2026-11-04',
    }),
  ),
  http.patch('/api/v1/subscriptions/:subscriptionId/reactivate', () =>
    ok('구독을 재등록했습니다.', { subscriptionId: SUBSCRIPTION_ID, status: 'ACTIVE' }),
  ),
  http.patch('/api/v1/subscriptions/:subscriptionId/steady', async ({ request }) => {
    const { isSteady } = (await request.json()) as { isSteady: boolean };
    return ok('설정을 변경했습니다.', { subscriptionId: SUBSCRIPTION_ID, isSteady });
  }),
];
