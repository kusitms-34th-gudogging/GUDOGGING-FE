import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import type { EndedSubscriptionDetail } from '@/constants/manage';
import { EndedSubscriptionDetailScreen } from '@/screens/manage/EndedSubscriptionDetailScreen';

const watcha: EndedSubscriptionDetail = {
  status: 'ended',
  id: 'watcha',
  name: '왓챠',
  amount: 7900,
  cycle: 1,
  unit: '개월',
  category: '영상·OTT',
  paidAt: 'web',
  startedAt: new Date(2026, 3, 16),
  cancelledAt: new Date(2026, 9, 16),
  totalSpent: 47600,
  lastCheckup: {
    checkedAt: new Date(2026, 9, 3),
    result: '해지 추천(8%)',
    usage: '한 달 동안 안 봤어요',
    satisfaction: '볼 게 별로 없어요',
    plan: '다음 달엔 안 봐요',
  },
};

const renderDetail = async () => {
  await renderRouter(
    {
      index: () => <EndedSubscriptionDetailScreen subscription={watcha} />,
      'register/input': () => null,
    },
    { initialUrl: '/' },
  );
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
};

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('EndedSubscriptionDetailScreen', () => {
  it('구독 기간을 0을 채운 날짜로, 마지막 점검일을 배지로 보여 준다', async () => {
    await renderDetail();

    expect(screen.getByText('2026.04.16 ~ 2026.10.16')).toBeOnTheScreen();
    expect(screen.getByText('10월 3일 점검 · 해지')).toBeOnTheScreen();
  });

  it('재등록하기는 이 구독 정보로 채운 구독 정보 입력으로 간다', async () => {
    const user = await renderDetail();

    await user.press(screen.getByRole('button', { name: '재등록하기' }));

    expect(screen).toHavePathname('/register/input');
    expect(screen).toHaveSearchParams({ reregister: 'watcha' });
  });
});
