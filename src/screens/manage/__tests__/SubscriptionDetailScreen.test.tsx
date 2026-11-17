import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen, waitFor } from 'expo-router/testing-library';

import type { ActiveSubscriptionDetail } from '@/constants/manage';
import { apiError, createQueryWrapper, mockApi } from '@/lib/testing';
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

const renderDetail = async (confirmCancel = false, routes: Record<string, unknown> = {}) => {
  mockApi(routes);
  await renderRouter(
    {
      index: () => (
        <SubscriptionDetailScreen subscription={netflix} confirmCancel={confirmCancel} />
      ),
      'checkup/[id]/index': () => null,
      'checkup/[id]/cancel': () => null,
      'register/input': () => null,
    },
    { initialUrl: '/', wrapper: createQueryWrapper() },
  );
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
};

const bodyOf = (method: string) => {
  const call = jest.mocked(globalThis.fetch).mock.calls.find(([, init]) => init?.method === method);
  return call && { url: String(call[0]), body: call[1]?.body };
};

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('SubscriptionDetailScreen', () => {
  it('월 구독료를 연으로 환산해 보여 준다', async () => {
    await renderDetail();

    expect(screen.getByText('연 환산 162,000원')).toBeOnTheScreen();
  });

  it('더보기 → 편집은 이 구독의 정보 수정 화면으로 간다', async () => {
    const user = await renderDetail();

    await user.press(screen.getByRole('button', { name: '더보기' }));
    await user.press(screen.getByRole('menuitem', { name: '편집' }));
    expect(screen).toHavePathname('/register/input');
    expect(screen).toHaveSearchParams({ edit: 'netflix' });
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

  it('해지 확인 알림으로 들어오면 해지 완료 확인 모달을 띄우고, 취소하면 상세에 남는다', async () => {
    const user = await renderDetail(true);

    expect(screen.getByText(/해지했나요\?/)).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: '취소' }));
    expect(screen.queryByText(/해지했나요\?/)).not.toBeOnTheScreen();
    expect(screen).toHavePathname('/');
  });

  it('해지 완료를 누르면 이 구독을 해지 완료 처리한다', async () => {
    const user = await renderDetail(true, {
      'PATCH /api/v1/subscriptions/netflix/cancel': null,
    });

    await user.press(screen.getByRole('button', { name: '해지 완료' }));

    expect(bodyOf('PATCH')?.url).toBe('https://api.test/api/v1/subscriptions/netflix/cancel');
  });

  it('꾸준히 쓰는 구독을 켜면 바로 켜지고 서버에 저장한다', async () => {
    const user = await renderDetail(false, {
      'PATCH /api/v1/subscriptions/netflix/steady': { subscriptionId: 'netflix', isSteady: true },
    });

    await user.press(screen.getByRole('switch', { name: '꾸준히 쓰는 구독' }));

    expect(screen.getByRole('switch', { name: '꾸준히 쓰는 구독' })).toBeChecked();
    expect(JSON.parse(String(bodyOf('PATCH')?.body))).toEqual({ isSteady: true });
  });

  it('꾸준히 쓰는 구독 저장에 실패하면 토글을 되돌린다', async () => {
    const user = await renderDetail(false, {
      'PATCH /api/v1/subscriptions/netflix/steady': apiError(500),
    });

    await user.press(screen.getByRole('switch', { name: '꾸준히 쓰는 구독' }));

    await waitFor(() =>
      expect(screen.getByRole('switch', { name: '꾸준히 쓰는 구독' })).not.toBeChecked(),
    );
  });

  it('그냥 들어오면 해지 완료 확인 모달이 없다', async () => {
    await renderDetail();

    expect(screen.queryByText(/해지했나요\?/)).not.toBeOnTheScreen();
  });
});
