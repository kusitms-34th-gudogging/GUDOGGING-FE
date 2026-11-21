import { userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { act, renderRouter, screen, waitFor } from 'expo-router/testing-library';

import type { EndedSubscriptionDetail } from '@/constants/manage';
import { createQueryWrapper, mockApi } from '@/lib/testing';
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
  mockApi({ 'DELETE /api/v1/subscriptions': { deletedCount: 1 } });
  await renderRouter(
    {
      index: () => null,
      'manage/detail/[id]': () => <EndedSubscriptionDetailScreen subscription={watcha} />,
      'register/input': () => null,
    },
    { initialUrl: '/', wrapper: createQueryWrapper() },
  );
  // 구독 관리 목록(/)에서 들어온 것처럼 돌아갈 곳을 둠
  await act(() => router.push('/manage/detail/watcha'));
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
};

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('EndedSubscriptionDetailScreen', () => {
  it('구독 기간을 0을 채운 날짜로, 마지막 점검일을 배지로 보여 준다', async () => {
    await renderDetail();

    expect(screen.getByText('2026.04.16 ~ 2026.10.16')).toBeOnTheScreen();
    expect(screen.getByText('10월 3일 점검 · 해지')).toBeOnTheScreen();
  });

  it('더보기에는 편집 없이 삭제만 있고, 삭제하면 이 구독을 지우고 목록으로 돌아간다', async () => {
    const user = await renderDetail();

    await user.press(screen.getByRole('button', { name: '더보기' }));
    expect(screen.queryByRole('menuitem', { name: '편집' })).not.toBeOnTheScreen();
    await user.press(screen.getByRole('menuitem', { name: '삭제' }));
    await user.press(screen.getByRole('button', { name: '삭제하기' }));

    await waitFor(() => expect(screen).toHavePathname('/'));
    const del = jest.mocked(globalThis.fetch).mock.calls.find(([, i]) => i?.method === 'DELETE');
    expect(JSON.parse(String(del?.[1]?.body))).toEqual({ subscriptionIds: ['watcha'] });
  });

  it('재등록하기는 이 구독 정보로 채운 구독 정보 입력으로 간다', async () => {
    const user = await renderDetail();

    await user.press(screen.getByRole('button', { name: '재등록하기' }));

    expect(screen).toHavePathname('/register/input');
    expect(screen).toHaveSearchParams({ reregister: 'watcha' });
  });
});
