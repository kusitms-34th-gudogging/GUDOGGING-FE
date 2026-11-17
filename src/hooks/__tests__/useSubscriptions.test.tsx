import { renderHook, waitFor } from '@testing-library/react-native';

import { useSubscription } from '@/hooks/useSubscriptions';
import { createQueryWrapper, mockApi } from '@/lib/testing';

const answers = {
  usageAnswer: '1~2편',
  satisfactionAnswer: '보통이에요',
  planAnswer: '아마 없어요',
};
const detail = (over: object) => ({
  subscriptionId: 'a',
  status: 'ACTIVE',
  serviceName: '넷플릭스',
  category: 'VIDEO_OTT',
  amount: 94800,
  billingCycleValue: 1,
  billingCycleUnit: 'YEAR',
  nextBillingDate: '2026-12-01',
  startedAt: '2025-12-01',
  paymentMethod: 'GOOGLE_PLAY',
  isSteady: true,
  canceledAt: null,
  totalPaidAmount: 94800,
  latestCheckup: null,
  pastCheckupAverage: null,
  ...over,
});

const load = async (response: object) => {
  mockApi({ 'GET /api/v1/subscriptions/a': response });
  const { result } = await renderHook(() => useSubscription('a'), {
    wrapper: createQueryWrapper(),
  });
  await waitFor(() => expect(result.current.data).toBeDefined());
  return result.current.data!;
};

afterEach(() => jest.restoreAllMocks());

describe('useSubscription', () => {
  it('API 코드를 화면 값(카테고리 이름·주기 단위·결제한 곳·날짜)으로 바꾼다', async () => {
    expect(await load(detail({}))).toMatchObject({
      status: 'active',
      category: '영상·OTT',
      unit: '년',
      paidAt: 'playstore',
      steady: true,
      nextDate: new Date(2026, 11, 1),
    });
  });

  it('지난 점검 평균은 기간을 월로, 결과를 단계·활용도로 보여 준다', async () => {
    const data = await load(
      detail({
        pastCheckupAverage: {
          ...answers,
          periodFrom: '2026-08-03',
          periodTo: '2026-11-10',
          stage: 'KEEP_CONSIDER',
          score: 72,
        },
      }),
    );

    expect(data.lastCheckup).toEqual({
      period: '8월~11월 결과',
      result: '유지 고려(72%)',
      usage: '1~2편',
      satisfaction: '보통이에요',
      plan: '아마 없어요',
    });
  });

  it('점검 기간이 한 달 안이면 그 달 하나만 쓴다', async () => {
    const data = await load(
      detail({
        pastCheckupAverage: {
          ...answers,
          periodFrom: '2026-11-02',
          periodTo: '2026-11-10',
          stage: 'KEEP_RECOMMENDED',
          score: 92,
        },
      }),
    );

    expect(data.lastCheckup).toMatchObject({ period: '11월 결과', result: '유지 추천(92%)' });
  });

  it('구독 종료면 해지일·총 지출과 마지막 점검의 해지 이유를 담는다', async () => {
    const data = await load(
      detail({
        status: 'ENDED',
        canceledAt: '2026-11-04',
        totalPaidAmount: 47400,
        latestCheckup: {
          ...answers,
          checkedAt: '2026-11-01',
          stage: 'CANCEL_RECOMMENDED',
          score: 8,
          cancelReasonText: '볼 게 없어요',
        },
      }),
    );

    expect(data).toMatchObject({
      status: 'ended',
      cancelledAt: new Date(2026, 10, 4),
      totalSpent: 47400,
      lastCheckup: {
        checkedAt: new Date(2026, 10, 1),
        result: '해지 추천(8%)',
        cancelReason: '볼 게 없어요',
      },
    });
  });
});
