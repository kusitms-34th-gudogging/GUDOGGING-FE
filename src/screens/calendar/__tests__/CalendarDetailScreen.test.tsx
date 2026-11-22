import { act, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderRouter, screen, waitFor } from 'expo-router/testing-library';

import { apiError, createQueryWrapper, mockApi } from '@/lib/testing';
import { CalendarDetailScreen } from '@/screens/calendar/CalendarDetailScreen';

const detail = (over: object = {}) => ({
  subscriptionId: 'netflix',
  status: 'ACTIVE',
  serviceName: '넷플릭스',
  category: 'VIDEO_OTT',
  amount: 13500,
  billingCycleValue: 1,
  billingCycleUnit: 'MONTH',
  // 서버가 baseDate(11월 17일) 다음 결제일을 줌
  nextBillingDate: '2026-12-17',
  startedAt: '2026-07-17',
  paymentMethod: 'APP_STORE',
  isSteady: false,
  canceledAt: null,
  totalPaidAmount: 67500,
  // 앱이 계산하지 않고 서버 값을 그대로 보여 줌 (월 13,500 × 12와 일부러 다르게)
  yearlyAmount: 160000,
  latestCheckup: {
    checkedAt: '2026-10-03',
    stage: 'KEEP_RECOMMENDED',
    score: 92,
    usageAnswer: '한 달 6~10편 봤어요',
    satisfactionAnswer: '만족해요',
    planAnswer: '꼭 볼 작품이 있어요',
    memo: '시즌 3 공개돼서 이번 달은 유지할 생각임',
    cancelReasonText: null,
  },
  pastCheckupAverage: null,
  ...over,
});

// 캘린더에서 11월 17일 결제를 눌러 들어온 상세
const renderDetail = async (routes: Record<string, unknown> = {}) => {
  mockApi({ 'GET /api/v1/subscriptions/netflix': detail(), ...routes });
  await renderRouter(
    {
      index: () => null,
      'calendar/detail/[id]': () => (
        <CalendarDetailScreen id="netflix" date={new Date(2026, 10, 17)} />
      ),
      'register/input': () => null,
    },
    { initialUrl: '/', wrapper: createQueryWrapper() },
  );
  // 캘린더(/)에서 들어온 것처럼 뒤로 갈 곳을 둠
  await act(() => router.push('/calendar/detail/netflix'));
  await screen.findByText('넷플릭스');
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
};

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

it('결제 금액·연 환산과 결제 정보를 보여준다', async () => {
  await renderDetail();

  expect(screen.getByText('13,500원')).toBeOnTheScreen();
  expect(screen.getByText('연 환산 160,000원')).toBeOnTheScreen();
  expect(screen.getByText('매월')).toBeOnTheScreen();
  expect(screen.getByText('App Store')).toBeOnTheScreen();
  expect(screen.getByText('2026년 7월 17일')).toBeOnTheScreen();
});

it('고른 날짜를 기준일로 보내고, 서버가 준 다음 결제일을 보여준다', async () => {
  await renderDetail();

  expect(String(jest.mocked(globalThis.fetch).mock.calls[0][0])).toContain('baseDate=2026-11-17');
  expect(screen.getByText('2026년 12월 17일')).toBeOnTheScreen();
});

it('구독 종료라 다음 결제일이 null이면 다음 결제일 줄을 빼고 보여준다', async () => {
  await renderDetail({
    'GET /api/v1/subscriptions/netflix': detail({
      status: 'ENDED',
      nextBillingDate: null,
      canceledAt: '2026-11-20',
    }),
  });

  expect(screen.queryByText('다음 결제일')).not.toBeOnTheScreen();
  expect(screen.getByText('결제 주기')).toBeOnTheScreen();
});

it('최근 점검이 있으면 점검 결과와 메모를 보여준다', async () => {
  await renderDetail();

  expect(screen.getByText('10월 3일 점검')).toBeOnTheScreen();
  expect(screen.getByText('유지 추천(92%)')).toBeOnTheScreen();
  expect(screen.getByDisplayValue('시즌 3 공개돼서 이번 달은 유지할 생각임')).toBeOnTheScreen();
});

it('최근 점검이 없으면 점검 영역이 없다', async () => {
  await renderDetail({ 'GET /api/v1/subscriptions/netflix': detail({ latestCheckup: null }) });

  expect(screen.queryByText('최근 점검')).not.toBeOnTheScreen();
});

it('불러오지 못하면 다시 시도로 다시 요청한다', async () => {
  mockApi({ 'GET /api/v1/subscriptions/netflix': apiError(500) });
  await renderRouter(
    { index: () => <CalendarDetailScreen id="netflix" date={new Date(2026, 10, 17)} /> },
    { initialUrl: '/', wrapper: createQueryWrapper() },
  );
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  await user.press(await screen.findByRole('button', { name: '다시 시도' }));

  expect(globalThis.fetch).toHaveBeenCalledTimes(2);
});

it('더보기를 누르면 편집·삭제 메뉴가 보인다', async () => {
  const user = await renderDetail();

  await user.press(screen.getByRole('button', { name: '더보기' }));

  expect(screen.getByText('편집')).toBeOnTheScreen();
  expect(screen.getByText('삭제')).toBeOnTheScreen();
});

it('구독 중이면 편집으로 구독 관리 상세와 같은 정보 편집 화면에 간다', async () => {
  const user = await renderDetail();

  await user.press(screen.getByRole('button', { name: '더보기' }));
  await user.press(screen.getByRole('menuitem', { name: '편집' }));

  expect(screen).toHavePathname('/register/input');
  expect(screen).toHaveSearchParams({ edit: 'netflix' });
});

it('구독 종료(다음 결제일 null)면 더보기에 삭제만 있다', async () => {
  const user = await renderDetail({
    'GET /api/v1/subscriptions/netflix': detail({
      status: 'ENDED',
      nextBillingDate: null,
      canceledAt: '2026-11-10',
    }),
  });

  await user.press(screen.getByRole('button', { name: '더보기' }));

  expect(screen.queryByRole('menuitem', { name: '편집' })).not.toBeOnTheScreen();
  expect(screen.getByRole('menuitem', { name: '삭제' })).toBeOnTheScreen();
  expect(screen.getByText('구독 종료')).toBeOnTheScreen();

  // 캘린더 상세는 구독 중·종료 모두 하단 버튼(재등록하기 등)이 없음
  expect(screen.queryByRole('button', { name: '재등록하기' })).not.toBeOnTheScreen();
});

it('삭제를 누르면 확인 모달이 뜨고, 취소하면 삭제하지 않는다', async () => {
  const user = await renderDetail();

  await user.press(screen.getByRole('button', { name: '더보기' }));
  await user.press(screen.getByText('삭제'));
  // 받침 없는 이름은 '를'
  expect(screen.getByText('넷플릭스를 삭제할까요?')).toBeOnTheScreen();

  await user.press(screen.getByRole('button', { name: '취소' }));
  expect(screen.queryByText('넷플릭스를 삭제할까요?')).not.toBeOnTheScreen();
  expect(jest.mocked(globalThis.fetch).mock.calls.some(([, i]) => i?.method === 'DELETE')).toBe(
    false,
  );
});

it('삭제하기를 누르면 이 구독을 삭제하고 캘린더로 돌아간다', async () => {
  const user = await renderDetail({ 'DELETE /api/v1/subscriptions': { deletedCount: 1 } });

  await user.press(screen.getByRole('button', { name: '더보기' }));
  await user.press(screen.getByText('삭제'));
  await user.press(screen.getByRole('button', { name: '삭제하기' }));

  await waitFor(() => expect(screen).toHavePathname('/'));
  const del = jest.mocked(globalThis.fetch).mock.calls.find(([, i]) => i?.method === 'DELETE');
  expect(JSON.parse(String(del?.[1]?.body))).toEqual({ subscriptionIds: ['netflix'] });
});
