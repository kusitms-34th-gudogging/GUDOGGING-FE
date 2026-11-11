import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import type { ActiveSubscriptionDetail } from '@/constants/manage';
import { SubscriptionDetailScreen } from '@/screens/manage/SubscriptionDetailScreen';

const netflix: ActiveSubscriptionDetail = {
  status: 'active',
  id: 'netflix',
  name: 'Netflix',
  amount: 13500,
  cycle: 1,
  unit: '개월',
  nextDate: new Date(2026, 9, 17),
  category: '영상·OTT',
  paidAt: 'appstore',
  startedAt: new Date(2026, 6, 17),
  steady: false,
};

const renderDetail = async () => {
  await renderRouter(
    {
      index: () => <SubscriptionDetailScreen subscription={netflix} />,
      'checkup/[id]/index': () => null,
      'checkup/[id]/cancel': () => null,
    },
    { initialUrl: '/' },
  );
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
};

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('SubscriptionDetailScreen', () => {
  it('월 구독료를 연으로 환산해 보여 준다', async () => {
    await renderDetail();

    expect(screen.getByText('연 환산 162,000원')).toBeOnTheScreen();
  });

  it('구독 점검은 점검 화면으로 간다', async () => {
    const user = await renderDetail();

    await user.press(screen.getByRole('button', { name: '구독 점검' }));
    expect(screen).toHavePathname('/checkup/netflix');
  });

  it('해지하기는 해지 이유 화면으로 간다', async () => {
    const user = await renderDetail();

    await user.press(screen.getByRole('button', { name: '해지하기' }));
    expect(screen).toHavePathname('/checkup/netflix/cancel');
  });
});
