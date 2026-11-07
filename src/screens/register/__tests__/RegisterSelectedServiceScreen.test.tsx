import AsyncStorage from '@react-native-async-storage/async-storage';
import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import type { PaymentInfo } from '@/constants/services';
import { useRegisterDraft } from '@/hooks/useRegisterDraft';
import { RegisterSelectedServiceScreen } from '@/screens/register/RegisterSelectedServiceScreen';

const PAYMENT: PaymentInfo = {
  category: '영상·OTT',
  amount: 13500,
  cycle: 1,
  unit: '개월',
  nextDate: new Date(2026, 10, 12),
  paidAt: 'web',
};

const renderSelected = async () => {
  await renderRouter(
    {
      'register/selected': () => <RegisterSelectedServiceScreen />,
      'register/done': () => null,
    },
    { initialUrl: '/register/selected' },
  );
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
};

beforeEach(async () => {
  jest.useFakeTimers();
  useRegisterDraft.getState().reset();
  await AsyncStorage.clear();
  useRegisterDraft.getState().setSelectedIds(['netflix', 'youtube']);
});
afterEach(() => jest.useRealTimers());

describe('RegisterSelectedServiceScreen', () => {
  it('결제 정보를 입력하지 않은 서비스가 있으면 등록할 수 없다', async () => {
    useRegisterDraft.getState().setPayment('netflix', PAYMENT);
    await renderSelected();

    expect(screen.getByRole('button', { name: '2개 구독 등록하기' })).toBeDisabled();
  });

  it('모든 서비스의 결제 정보를 입력하면 고른 서비스 전부를 완료 화면으로 넘긴다', async () => {
    useRegisterDraft.getState().setPayment('netflix', PAYMENT);
    useRegisterDraft.getState().setPayment('youtube', PAYMENT);
    const user = await renderSelected();

    await user.press(screen.getByRole('button', { name: '2개 구독 등록하기' }));

    expect(screen).toHavePathname('/register/done');
    expect(screen).toHaveSearchParams({ ids: 'netflix,youtube' });
  });
});
