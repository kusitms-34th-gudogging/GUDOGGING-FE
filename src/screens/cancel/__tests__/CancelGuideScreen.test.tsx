import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import CancelGuideRoute from '@/app/cancel/[id]';
import CheckupCancelRoute from '@/app/checkup/[id]/cancel';
import SubscriptionDetailRoute from '@/app/manage/detail/[id]';
import { createQueryWrapper, mockApi } from '@/lib/testing';

beforeEach(() => {
  jest.useFakeTimers();
  mockApi({
    'GET /api/v1/subscriptions/melon': {
      subscriptionId: 'melon',
      status: 'ACTIVE',
      serviceName: '멜론',
      category: 'MUSIC',
      amount: 10900,
      billingCycleValue: 1,
      billingCycleUnit: 'MONTH',
      nextBillingDate: '2026-12-01',
      startedAt: '2026-01-01',
      paymentMethod: 'WEB_DIRECT',
      isSteady: false,
      canceledAt: null,
      totalPaidAmount: 119900,
      latestCheckup: null,
      pastCheckupAverage: null,
    },
  });
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

it('해지 완료하면 해지를 시작한 구독 상세로 돌아간다', async () => {
  await renderRouter(
    {
      'manage/detail/[id]': SubscriptionDetailRoute,
      'checkup/[id]/cancel': CheckupCancelRoute,
      'cancel/[id]': CancelGuideRoute,
    },
    { initialUrl: '/manage/detail/melon', wrapper: createQueryWrapper() },
  );
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  // 상세 → 해지 이유(건너뛰기) → 해지 안내
  await user.press(await screen.findByRole('button', { name: '해지하기' }));
  await user.press(screen.getByRole('button', { name: '건너뛰기' }));
  expect(screen).toHavePathname('/cancel/melon');
  await user.press(screen.getByRole('button', { name: '해지했어요' }));
  await user.press(screen.getByRole('button', { name: '해지 완료' }));

  expect(screen).toHavePathname('/manage/detail/melon');
});
