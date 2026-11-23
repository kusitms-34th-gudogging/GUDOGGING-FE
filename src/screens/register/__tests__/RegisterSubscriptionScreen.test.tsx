import AsyncStorage from '@react-native-async-storage/async-storage';
import { userEvent } from '@testing-library/react-native';
import { router, Stack } from 'expo-router';
import { act, renderRouter, screen, waitFor } from 'expo-router/testing-library';

import { useRegisterDraft } from '@/hooks/useRegisterDraft';
import { createQueryWrapper, mockApi } from '@/lib/testing';
import { RegisterSubscriptionScreen } from '@/screens/register/RegisterSubscriptionScreen';

const DRAFTS = '/api/v1/subscriptions/drafts';
// 다른 기기에서 직접 등록하던 서버 임시저장: Netflix는 결제 정보까지, 헬스장은 직접 입력
const SERVER_DRAFT = {
  savedAt: '2026-11-07T16:30:00',
  lastStep: 'CONFIRM_SUBSCRIPTIONS',
  editingItemIndex: null,
  items: [
    {
      serviceId: 'netflix',
      serviceName: 'Netflix',
      category: 'VIDEO_OTT',
      amount: 13500,
      billingCycleValue: 1,
      billingCycleUnit: 'MONTH',
      nextBillingDate: '2026-12-01',
      paymentMethod: 'WEB_DIRECT',
    },
    {
      serviceId: 'tving',
      serviceName: '티빙',
      category: 'VIDEO_OTT',
      // 금액만 있고 나머지는 미입력
      amount: 13900,
      billingCycleValue: null,
      billingCycleUnit: null,
      nextBillingDate: null,
      paymentMethod: null,
    },
    {
      serviceId: null,
      serviceName: '동네 헬스장',
      category: 'ETC',
      amount: 60000,
      billingCycleValue: 3,
      billingCycleUnit: 'MONTH',
      nextBillingDate: '2026-12-05',
      paymentMethod: 'APP_STORE',
    },
  ],
};

const renderScreen = async (serverDraft: object | null = null) => {
  mockApi({ [`GET ${DRAFTS}`]: serverDraft, [`DELETE ${DRAFTS}`]: null });
  await renderRouter(
    {
      // 실제 앱처럼 Stack이라 다음 화면으로 가도 이 화면은 뒤에 남아 있음
      'register/_layout': () => <Stack />,
      'register/index': () => <RegisterSubscriptionScreen />,
      'register/found': () => null,
      'register/selected': () => null,
      'register/select': () => null,
      'register/input': () => null,
    },
    { initialUrl: '/register', wrapper: createQueryWrapper() },
  );
  // 서버 임시저장 조회가 끝난 뒤
  await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
};

beforeEach(async () => {
  jest.useFakeTimers();
  useRegisterDraft.getState().reset();
  await AsyncStorage.clear();
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});
const deleted = () =>
  jest.mocked(globalThis.fetch).mock.calls.some(([, init]) => init?.method === 'DELETE');

describe('RegisterSubscriptionScreen 불러오기 팝업', () => {
  it('등록 중이던 구독이 없으면 팝업이 뜨지 않는다', async () => {
    await renderScreen();

    expect(screen.queryByText('등록 중이던 구독을 불러올까요?')).not.toBeOnTheScreen();
  });

  it('분석 결과를 보던 중이면 불러오기로 불러온 구독 확인 화면으로 간다', async () => {
    useRegisterDraft.getState().setFoundChecked(['found-youtube']);
    const user = await renderScreen();

    expect(screen.getByText('등록 중이던 구독을 불러올까요?')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: '불러오기' }));

    expect(screen).toHavePathname('/register/found');
  });

  it('직접 등록 중이면 불러오기로 선택한 구독 화면으로 간다', async () => {
    useRegisterDraft.getState().setSelectedIds(['netflix', 'tving']);
    const user = await renderScreen();

    await user.press(screen.getByRole('button', { name: '불러오기' }));

    expect(screen).toHavePathname('/register/selected');
  });

  it('새로 등록하기를 누르면 등록 중이던 값을 지우고 머문다', async () => {
    useRegisterDraft.getState().setSelectedIds(['netflix']);
    const user = await renderScreen();

    await user.press(screen.getByRole('button', { name: '새로 등록하기' }));

    expect(useRegisterDraft.getState().selectedIds).toEqual([]);
    expect(screen).toHavePathname('/register');
    // 서버 임시저장도 지움 (명세: 새로 등록하기 → 삭제)
    await waitFor(() => expect(deleted()).toBe(true));
  });

  it('직접 등록에서 서비스 선택에 머물렀으면 불러오기로 서비스 선택 화면으로 간다', async () => {
    useRegisterDraft.getState().setSelectedIds(['netflix']);
    useRegisterDraft.getState().setLastStep('SELECT_SERVICES');
    const user = await renderScreen();

    await user.press(screen.getByRole('button', { name: '불러오기' }));

    expect(screen).toHavePathname('/register/select');
  });

  it('기기엔 없고 서버에만 임시저장이 있으면 팝업을 띄우고, 불러오기로 서버 값을 채운다', async () => {
    const user = await renderScreen(SERVER_DRAFT);

    await user.press(await screen.findByRole('button', { name: '불러오기' }));

    expect(screen).toHavePathname('/register/selected');
    const { selectedIds, payments, lastStep } = useRegisterDraft.getState();
    expect(selectedIds).toEqual(['netflix', 'tving']);
    expect(lastStep).toBe('CONFIRM_SUBSCRIPTIONS');
    // 결제 정보를 다 채운 항목만 결제 정보로 (티빙은 고른 서비스로만)
    expect(payments).toEqual({
      netflix: {
        name: undefined,
        category: '영상·OTT',
        amount: 13500,
        cycle: 1,
        unit: '개월',
        nextDate: new Date(2026, 11, 1),
        paidAt: 'web',
      },
      'custom-draft-2': {
        name: '동네 헬스장',
        category: '기타',
        amount: 60000,
        cycle: 3,
        unit: '개월',
        nextDate: new Date(2026, 11, 5),
        paidAt: 'appstore',
      },
    });
  });

  it('정보 입력 중에 멈췄으면 불러오기로 선택한 구독 위에 그 항목 입력 화면을 연다', async () => {
    const user = await renderScreen({
      ...SERVER_DRAFT,
      lastStep: 'INPUT_SUBSCRIPTION',
      editingItemIndex: 2,
    });

    await user.press(await screen.findByRole('button', { name: '불러오기' }));

    // items[2] 동네 헬스장(직접 입력)의 기기 id
    expect(screen).toHavePathname('/register/input');
    expect(screen).toHaveSearchParams({ id: 'custom-draft-2' });
    await act(() => router.back());
    expect(screen).toHavePathname('/register/selected');
  });

  it('새 직접 입력 중에 멈췄으면(editingItemIndex null) 서비스 선택 위에 빈 직접 입력을 연다', async () => {
    const user = await renderScreen({ ...SERVER_DRAFT, lastStep: 'INPUT_SUBSCRIPTION' });

    await user.press(await screen.findByRole('button', { name: '불러오기' }));

    expect(screen).toHavePathname('/register/input');
    expect(screen).toHaveSearchParams({});
    await act(() => router.back());
    expect(screen).toHavePathname('/register/select');
  });

  it('서버 임시저장만 있을 때 새로 등록하기를 누르면 서버 임시저장을 지운다', async () => {
    const user = await renderScreen(SERVER_DRAFT);

    await user.press(await screen.findByRole('button', { name: '새로 등록하기' }));

    await waitFor(() => expect(deleted()).toBe(true));
    expect(useRegisterDraft.getState().selectedIds).toEqual([]);
    expect(screen.queryByText('등록 중이던 구독을 불러올까요?')).not.toBeOnTheScreen();
  });
});

it('등록 방법을 고른 뒤 돌아오면 선택 표시가 풀려 있다', async () => {
  const user = await renderScreen();

  await user.press(screen.getByRole('radio', { name: /직접 등록하기/ }));
  expect(screen).toHavePathname('/register/select');

  await act(() => router.back());

  expect(screen).toHavePathname('/register');
  expect(screen.getByRole('radio', { name: /직접 등록하기/ })).not.toBeSelected();
});
