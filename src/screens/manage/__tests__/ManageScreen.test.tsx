import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { type EndedSubscription, ManageScreen } from '@/screens/manage/ManageScreen';
import type { HomeSubscription } from '@/utils/homeSummary';

// 오늘: 10월 16일
const day = (d: number) => new Date(2026, 9, d);
const active: HomeSubscription[] = [
  { id: 'b', name: '늦은 결제', amount: 10000, cycle: 1, unit: '개월', nextDate: day(20) },
  { id: 'a', name: '빠른 결제', amount: 29000, cycle: 1, unit: '개월', nextDate: day(17) },
];
const ended: EndedSubscription[] = [
  {
    id: 'c',
    name: '왓챠',
    amount: 7900,
    cycle: 1,
    unit: '개월',
    cancelledAt: day(10),
    totalSpent: 47400,
  },
];

const renderManage = async (props: Parameters<typeof ManageScreen>[0]) => {
  await renderRouter(
    { index: () => <ManageScreen {...props} />, 'register/index': () => null },
    { initialUrl: '/' },
  );
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2026, 9, 16, 10));
});
afterEach(() => jest.useRealTimers());

describe('ManageScreen', () => {
  it('구독이 없으면 빈 상태를 보여 주고, 구독 등록하기로 구독 추가에 간다', async () => {
    const user = await renderManage({ active: [], ended: [] });

    await user.press(screen.getByRole('button', { name: '구독 등록하기' }));

    expect(screen).toHavePathname('/register');
  });

  it('구독 중 탭은 결제일 순·월 합계, 구독 종료 탭은 해지 정보를 보여 준다', async () => {
    const user = await renderManage({ active, ended });

    expect(screen.getByText('월 39,000원')).toBeOnTheScreen();
    const titles = screen.getAllByText(/결제$/).map((t) => t.props.children);
    expect(titles).toEqual(['빠른 결제', '늦은 결제']);
    expect(screen.getByText('매월 17일 · D-1')).toBeOnTheScreen();

    await user.press(screen.getByRole('tab', { name: '구독 종료 1' }));

    expect(screen.getByText('월 7,900원 절약')).toBeOnTheScreen();
    expect(screen.getByText('10월 10일 해지 · 총 지출 47,400원')).toBeOnTheScreen();
  });
});
