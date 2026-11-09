import AsyncStorage from '@react-native-async-storage/async-storage';
import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { useRegisterDraft } from '@/hooks/useRegisterDraft';
import { RegisterFoundScreen } from '@/screens/register/RegisterFoundScreen';

const CTA = { name: '선택한 구독 등록하기' };

const renderFound = async () => {
  await renderRouter(
    {
      'register/found': () => <RegisterFoundScreen />,
      'register/done': () => null,
    },
    { initialUrl: '/register/found' },
  );
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
};

beforeEach(async () => {
  jest.useFakeTimers();
  useRegisterDraft.getState().reset();
  await AsyncStorage.clear();
});
afterEach(() => jest.useRealTimers());

describe('RegisterFoundScreen', () => {
  // 샘플: ChatGPT Plus는 금액을 못 읽어 확인 필요, YouTube Premium은 바로 등록 가능
  it('등록 가능에서 체크한 구독이 없으면 등록할 수 없다', async () => {
    useRegisterDraft.getState().setFoundChecked(['youtube']);
    const user = await renderFound();

    await user.press(screen.getByRole('checkbox', { name: 'YouTube Premium' }));

    expect(screen.getByRole('button', CTA)).toBeDisabled();
  });

  it('확인 필요 항목은 체크할 수 없고, 미리 체크돼 있어도 등록에서 빠진다', async () => {
    useRegisterDraft.getState().setFoundChecked(['chatgpt', 'youtube']);
    const user = await renderFound();

    expect(screen.queryByRole('checkbox', { name: 'ChatGPT Plus' })).not.toBeOnTheScreen();

    await user.press(screen.getByRole('button', CTA));

    expect(screen).toHaveSearchParams({ ids: 'youtube' });
  });

  it('수정 화면에서 결제 정보를 저장한 항목은 확인 필요여도 등록할 수 있다', async () => {
    useRegisterDraft.getState().setFoundChecked(['chatgpt']);
    useRegisterDraft.getState().setPayment('chatgpt', {
      category: '생산성·AI',
      amount: 29000,
      cycle: 1,
      unit: '개월',
      nextDate: new Date(2026, 10, 12),
      paidAt: 'appstore',
    });
    await renderFound();

    expect(screen.getByRole('button', CTA)).toBeEnabled();
  });

  it('등록하면 체크한 항목만 완료 화면으로 넘긴다', async () => {
    useRegisterDraft.getState().setFoundChecked(['youtube']);
    const user = await renderFound();

    await user.press(screen.getByRole('button', CTA));

    expect(screen).toHavePathname('/register/done');
    expect(screen).toHaveSearchParams({ ids: 'youtube' });
    // 완료 화면은 저장소의 결제 정보로 금액·요약을 그림
    expect(useRegisterDraft.getState().payments.youtube).toMatchObject({
      amount: 17000,
      nextDate: new Date(2026, 10, 12),
      paidAt: 'appstore',
    });
  });

  it('구독 추가하기로 추가한 구독도 목록에 보이고 함께 등록한다', async () => {
    useRegisterDraft.getState().setSelectedIds(['spotify']);
    useRegisterDraft.getState().setPayment('spotify', {
      category: '음악',
      amount: 10900,
      cycle: 1,
      unit: '개월',
      nextDate: new Date(2026, 10, 20),
      paidAt: 'appstore',
    });
    useRegisterDraft.getState().setFoundChecked(['youtube', 'spotify']);
    const user = await renderFound();

    await user.press(screen.getByRole('button', CTA));

    expect(screen).toHaveSearchParams({ ids: 'youtube,spotify' });
  });
});
