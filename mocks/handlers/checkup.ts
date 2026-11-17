import { http } from 'msw';

import { CHECKUP_ID, ok, SUBSCRIPTION_ID } from '../response.ts';

const options = (texts: string[]) => texts.map((text, i) => ({ score: i + 1, text }));

export const checkupHandlers = [
  http.get('/api/v1/subscriptions/:subscriptionId/checkups/form', () =>
    ok('점검 문항을 조회했습니다.', {
      category: 'VIDEO_OTT',
      questions: [
        {
          type: 'USAGE',
          label: '최근 한 달 동안 얼마나 봤나요?',
          hint: '에피소드, 영화 모두 1편으로 세어 주세요',
          // 임의: 명세 mock은 선택지 2개('안 봤어요', '1~2편')뿐, 나머지 3개 문구
          options: options(['안 봤어요', '1~2편', '3~5편', '6~10편', '10편 넘게']),
        },
        // 임의: 명세 mock은 USAGE 문항만 있음, SATISFACTION·PLAN 문항 문구·선택지 (화면설계서 K-11~K-66 기준으로 교체)
        {
          type: 'SATISFACTION',
          label: '볼 만한 콘텐츠가 충분했나요?',
          hint: null,
          options: options([
            '전혀 아니에요',
            '별로예요',
            '보통이에요',
            '만족해요',
            '아주 만족해요',
          ]),
        },
        {
          type: 'PLAN',
          label: '다음 달에도 볼 계획이 있나요?',
          hint: null,
          options: options(['없어요', '아마 없어요', '모르겠어요', '아마 있어요', '확실히 있어요']),
        },
      ],
      lastMemo: null,
      // 임의: 아래 필드는 명세 mock에 없어 필드 표 보고 채움
      serviceName: '넷플릭스',
      amount: 13500,
      yearlyAmount: 162000,
      nextBillingDate: '2026-12-01',
      memoPlaceholder: '예) 보고 싶은 시리즈가 끝나면 해지',
      memoChips: ['볼 작품 있음', '가족과 같이 봄', '요즘 잘 안 봄'],
    }),
  ),
  http.post('/api/v1/subscriptions/:subscriptionId/checkups', () =>
    ok(
      '구독 점검을 제출했습니다.',
      { checkupId: CHECKUP_ID, score: 92, stage: 'KEEP_RECOMMENDED', yearlyCost: 162000 },
      201,
    ),
  ),
  http.get('/api/v1/checkups/:checkupId', () =>
    ok('점검 결과를 조회했습니다.', {
      checkupId: CHECKUP_ID,
      subscriptionId: SUBSCRIPTION_ID,
      serviceName: '넷플릭스',
      nextBillingDate: '2026-12-15',
      yearlyCost: 204000,
      score: 72,
      // 임의: 명세 mock은 KEEP_RECOMMENDED인데 구간(60~79)상 KEEP_CONSIDER, 백엔드 확인 필요
      stage: 'KEEP_CONSIDER',
      usageAnswer: '주 3~4회',
      satisfactionAnswer: '만족',
      planAnswer: '적당함',
      memo: '가족과 같이 봄',
      bundles: [
        {
          name: '통신사 OTT 번들',
          includes: ['넷플릭스', '티빙'],
          tags: ['OTT', '통신사'],
          monthlyPrice: 19900,
          monthlySaving: 5100,
          condition: '통신사 요금제 가입 필요',
          // 임의: providerType·priceType은 명세 mock에 없음
          providerType: '통신사',
          priceType: 'FIXED',
        },
      ],
      maxMonthlySaving: 5100,
      // 임의: mainFactor·categorySpending은 명세 mock에 없어 필드 표 보고 채움
      mainFactor: 'USAGE',
      categorySpending: {
        category: 'VIDEO_OTT',
        monthlyTotal: 13500,
        subscriptionCount: 1,
        items: [
          { serviceName: '넷플릭스', logoUrl: 'https://.../netflix.png', monthlyAmount: 13500 },
        ],
        otherCount: 0,
      },
    }),
  ),
  http.patch('/api/v1/checkups/:checkupId/decision', async ({ request }) => {
    const { decision } = (await request.json()) as { decision: string };
    return ok('점검 결정을 저장했습니다.', { checkupId: CHECKUP_ID, decision });
  }),
];
