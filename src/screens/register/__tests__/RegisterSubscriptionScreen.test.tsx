import AsyncStorage from '@react-native-async-storage/async-storage';
import { userEvent } from '@testing-library/react-native';
import { router, Stack } from 'expo-router';
import { act, renderRouter, screen } from 'expo-router/testing-library';

import { useRegisterDraft } from '@/hooks/useRegisterDraft';
import { RegisterSubscriptionScreen } from '@/screens/register/RegisterSubscriptionScreen';

const renderScreen = async () => {
  await renderRouter(
    {
      // 실제 앱처럼 Stack이라 다음 화면으로 가도 이 화면은 뒤에 남아 있음
      'register/_layout': () => <Stack />,
      'register/index': RegisterSubscriptionScreen,
      'register/found': () => null,
      'register/selected': () => null,
      'register/select': () => null,
    },
    { initialUrl: '/register' },
  );
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
};

beforeEach(async () => {
  jest.useFakeTimers();
  useRegisterDraft.getState().reset();
  await AsyncStorage.clear();
});
afterEach(() => jest.useRealTimers());

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
