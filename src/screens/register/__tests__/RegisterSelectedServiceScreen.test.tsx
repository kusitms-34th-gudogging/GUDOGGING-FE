import AsyncStorage from '@react-native-async-storage/async-storage';
import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen, waitFor } from 'expo-router/testing-library';

import type { PaymentInfo } from '@/constants/services';
import { useRegisterDraft } from '@/hooks/useRegisterDraft';
import { apiError, createQueryWrapper, mockApi, TEST_SERVICES, ToastLayout } from '@/lib/testing';
import { RegisterSelectedServiceScreen } from '@/screens/register/RegisterSelectedServiceScreen';

const PAYMENT: PaymentInfo = {
  category: '영상·OTT',
  amount: 13500,
  cycle: 1,
  unit: '개월',
  nextDate: new Date(2026, 10, 12),
  paidAt: 'web',
};

const renderSelected = async (routes: Record<string, unknown> = {}) => {
  mockApi({ 'GET /api/v1/services': { services: TEST_SERVICES }, ...routes });
  await renderRouter(
    {
      _layout: ToastLayout,
      'register/selected': () => <RegisterSelectedServiceScreen />,
      'register/done': () => null,
      'register/select': () => null,
    },
    { initialUrl: '/register/selected', wrapper: createQueryWrapper() },
  );
  // 서비스 이름은 서비스 목록 응답에서
  await screen.findByText('YouTube Premium');
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
};

beforeEach(async () => {
  jest.useFakeTimers();
  // 고정 데이터의 결제일(11월 12일·20일)이 지난 날짜로 보이지 않게 오늘을 고정
  jest.setSystemTime(new Date(2026, 10, 10));
  useRegisterDraft.getState().reset();
  await AsyncStorage.clear();
  useRegisterDraft.getState().setSelectedIds(['netflix', 'youtube']);
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});
const postBody = () => {
  const call = jest.mocked(globalThis.fetch).mock.calls.find(([, i]) => i?.method === 'POST');
  return call && JSON.parse(String(call[1]?.body));
};

describe('RegisterSelectedServiceScreen', () => {
  // 기획 변경: A-09처럼 확인 필요는 빼고 등록 가능에서 체크한 것만 등록
  it('결제 정보를 입력하지 않은 서비스는 확인 필요에 두고, 입력한 것만 등록한다', async () => {
    useRegisterDraft.getState().setPayment('netflix', PAYMENT);
    const user = await renderSelected({ 'POST /api/v1/subscriptions': { createdCount: 1 } });

    expect(screen.getByText(/확인 필요/)).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: '1개 구독 등록하기' }));

    await waitFor(() => expect(screen).toHavePathname('/register/done'));
    expect(postBody().subscriptions.map((s: { serviceId: string }) => s.serviceId)).toEqual([
      'netflix',
    ]);
  });

  it('등록 가능에서 체크를 풀면 등록에서 빼고, 하나도 체크하지 않으면 등록할 수 없다', async () => {
    useRegisterDraft.getState().setPayment('netflix', PAYMENT);
    useRegisterDraft.getState().setPayment('youtube', PAYMENT);
    const user = await renderSelected();

    await user.press(screen.getByRole('checkbox', { name: 'Netflix' }));
    expect(screen.getByRole('button', { name: '1개 구독 등록하기' })).toBeEnabled();

    await user.press(screen.getByRole('checkbox', { name: 'YouTube Premium' }));
    expect(screen.getByRole('button', { name: '0개 구독 등록하기' })).toBeDisabled();
    // 나갔다 불러와도 유지되게 저장소에 둠
    expect(useRegisterDraft.getState().unchecked).toEqual(['netflix', 'youtube']);
  });

  it('불러온 결제 정보의 다음 결제일이 지났으면 입력이 필요한 것으로 보고 등록에서 뺀다', async () => {
    // 11월 12일에 임시저장해 두고 오늘(11월 13일) 불러옴
    jest.setSystemTime(new Date(2026, 10, 13));
    useRegisterDraft.getState().setPayment('netflix', PAYMENT);
    useRegisterDraft
      .getState()
      .setPayment('youtube', { ...PAYMENT, nextDate: new Date(2026, 10, 13) });
    await renderSelected();

    expect(screen.getAllByText('결제 정보 입력 필요')).toHaveLength(1);
    expect(screen.getByRole('button', { name: '1개 구독 등록하기' })).toBeEnabled();
  });

  it('모든 서비스의 결제 정보를 입력하면 일괄 등록하고, 완료 화면으로 간다', async () => {
    useRegisterDraft.getState().setPayment('netflix', PAYMENT);
    useRegisterDraft.getState().setPayment('youtube', { ...PAYMENT, paidAt: 'appstore' });
    useRegisterDraft.getState().setPayment('custom-1', {
      ...PAYMENT,
      name: '동네 헬스장',
      category: '쇼핑·멤버십',
      cycle: 3,
      unit: '주',
    });
    const user = await renderSelected({ 'POST /api/v1/subscriptions': { createdCount: 3 } });

    await user.press(screen.getByRole('button', { name: '3개 구독 등록하기' }));

    await waitFor(() => expect(screen).toHavePathname('/register/done'));
    const base = {
      amount: 13500,
      nextBillingDate: '2026-11-12',
    };
    expect(postBody()).toEqual({
      source: 'MANUAL',
      subscriptions: [
        {
          ...base,
          serviceId: 'netflix',
          serviceName: 'Netflix',
          category: 'VIDEO_OTT',
          billingCycleValue: 1,
          billingCycleUnit: 'MONTH',
          paymentMethod: 'WEB_DIRECT',
        },
        {
          ...base,
          serviceId: 'youtube',
          serviceName: 'YouTube Premium',
          category: 'VIDEO_OTT',
          billingCycleValue: 1,
          billingCycleUnit: 'MONTH',
          paymentMethod: 'APP_STORE',
        },
        // 직접 입력은 사전 등록 서비스 id 없이 입력한 이름으로
        {
          ...base,
          serviceId: null,
          serviceName: '동네 헬스장',
          category: 'SHOPPING_DELIVERY',
          billingCycleValue: 3,
          billingCycleUnit: 'WEEK',
          paymentMethod: 'WEB_DIRECT',
        },
      ],
    });
  });

  it('등록에 실패하면 안내하고 선택한 구독 화면에 남는다', async () => {
    useRegisterDraft.getState().setPayment('netflix', PAYMENT);
    useRegisterDraft.getState().setPayment('youtube', PAYMENT);
    const user = await renderSelected({ 'POST /api/v1/subscriptions': apiError(409) });

    await user.press(screen.getByRole('button', { name: '2개 구독 등록하기' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: '2개 구독 등록하기' })).toBeEnabled(),
    );
    expect(screen).toHavePathname('/register/selected');
    expect(await screen.findByText('구독 등록에 실패했어요')).toBeOnTheScreen();
  });

  // 이어서 등록은 선택한 구독 화면으로 바로 들어와 앞 화면이 서비스 선택이 아님
  it('구독 추가하기를 누르면 서비스 선택으로 간다', async () => {
    const user = await renderSelected();

    await user.press(screen.getByRole('button', { name: '구독 추가하기' }));

    expect(screen).toHavePathname('/register/select');
  });

  it('불러오기로 바로 들어와도 뒤로 가면 서비스 선택으로 간다', async () => {
    const user = await renderSelected();

    await user.press(screen.getByRole('button', { name: '뒤로 가기' }));

    expect(screen).toHavePathname('/register/select');
  });

  it('결제 정보가 없는 구독을 먼저 보여 주고, 입력 전엔 금액 대신 화살표로 입력을 안내한다', async () => {
    useRegisterDraft.getState().setPayment('netflix', PAYMENT);
    await renderSelected();

    const rows = screen.getAllByRole('button', { name: /결제 정보/ });
    expect(rows.map((r) => r.props.accessibilityLabel)).toEqual([
      'YouTube Premium 결제 정보 입력하기',
      'Netflix 결제 정보 수정하기',
    ]);
    expect(screen.getByText('13,500원')).toBeOnTheScreen();
    expect(screen.queryByText('입력하기')).not.toBeOnTheScreen();
  });

  // 서비스 목록 순서(Netflix·ChatGPT·YouTube)가 아니라 고른 순서
  it('입력 여부로 나눈 그룹 안에서는 추가한 순서로 보여 준다', async () => {
    useRegisterDraft.getState().setSelectedIds(['youtube', 'netflix', 'chatgpt']);
    useRegisterDraft.getState().setPayment('chatgpt', PAYMENT);
    await renderSelected();

    const rows = screen.getAllByRole('button', { name: /결제 정보/ });
    expect(rows.map((r) => r.props.accessibilityLabel)).toEqual([
      'YouTube Premium 결제 정보 입력하기',
      'Netflix 결제 정보 입력하기',
      'ChatGPT 결제 정보 수정하기',
    ]);
  });
});
