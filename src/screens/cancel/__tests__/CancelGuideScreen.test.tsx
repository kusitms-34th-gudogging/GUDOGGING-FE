import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import CancelGuideRoute from '@/app/cancel/[id]';
import CheckupCancelRoute from '@/app/checkup/[id]/cancel';
import SubscriptionDetailRoute from '@/app/manage/detail/[id]';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

it('해지 완료하면 구독 상세로 돌아가 구독 종료로 보인다', async () => {
  await renderRouter(
    {
      'manage/detail/[id]': SubscriptionDetailRoute,
      'checkup/[id]/cancel': CheckupCancelRoute,
      'cancel/[id]': CancelGuideRoute,
    },
    { initialUrl: '/manage/detail/melon' },
  );
  expect(screen.getByText('구독 중')).toBeOnTheScreen();
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  // 상세 → 해지 이유(건너뛰기) → 해지 안내
  await user.press(screen.getByRole('button', { name: '해지하기' }));
  await user.press(screen.getByRole('button', { name: '건너뛰기' }));
  expect(screen).toHavePathname('/cancel/melon');
  await user.press(screen.getByRole('button', { name: '해지했어요' }));
  await user.press(screen.getByRole('button', { name: '해지 완료' }));

  expect(screen).toHavePathname('/manage/detail/melon');
  expect(screen.getByText('구독 종료')).toBeOnTheScreen();
});
