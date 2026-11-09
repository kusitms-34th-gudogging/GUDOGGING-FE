import AsyncStorage from '@react-native-async-storage/async-storage';
import { userEvent } from '@testing-library/react-native';
import { router, Stack } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';
import { Pressable, Text } from 'react-native';

import { useRegisterDraft } from '@/hooks/useRegisterDraft';
import { RegisterServiceSelectScreen } from '@/screens/register/RegisterServiceSelectScreen';

const Start = () => (
  <Pressable accessibilityRole="button" onPress={() => router.push('/register/select')}>
    <Text>직접 등록하기</Text>
  </Pressable>
);

const renderSelect = async ({ more = false } = {}) => {
  await renderRouter(
    {
      'register/_layout': () => <Stack />,
      'register/index': Start,
      'register/select': () => <RegisterServiceSelectScreen more={more} />,
    },
    { initialUrl: '/register' },
  );
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  await user.press(screen.getByRole('button', { name: '직접 등록하기' }));
  return user;
};

beforeEach(async () => {
  jest.useFakeTimers();
  useRegisterDraft.getState().reset();
  await AsyncStorage.clear();
});
afterEach(() => jest.useRealTimers());

describe('RegisterServiceSelectScreen 이탈 팝업', () => {
  it('아무것도 고르지 않았으면 팝업 없이 나간다', async () => {
    const user = await renderSelect();

    await user.press(screen.getByRole('button', { name: '뒤로 가기' }));

    expect(screen).toHavePathname('/register');
  });

  it('서비스를 고른 뒤 나가기를 누르면 등록 중이던 값을 지우고 나간다', async () => {
    const user = await renderSelect();
    await user.press(screen.getByRole('checkbox', { name: 'Netflix' }));

    await user.press(screen.getByRole('button', { name: '뒤로 가기' }));
    expect(screen.getByText('등록을 그만할까요?')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: '나가기' }));

    expect(screen).toHavePathname('/register');
    expect(useRegisterDraft.getState().selectedIds).toEqual([]);
  });

  it('불러온 구독 확인에서 더 고르러 온 경우엔 팝업 없이 돌아간다', async () => {
    const user = await renderSelect({ more: true });
    await user.press(screen.getByRole('checkbox', { name: 'Netflix' }));

    await user.press(screen.getByRole('button', { name: '뒤로 가기' }));

    expect(screen).toHavePathname('/register');
    expect(useRegisterDraft.getState().selectedIds).toEqual(['netflix']);
  });
});

it('불러온 구독 확인에서 추가 선택으로 들어왔으면 뒤로 가기에 그 화면으로 돌아간다', async () => {
  const Found = () => (
    <Pressable accessibilityRole="button" onPress={() => router.push('/register/select')}>
      <Text>구독 추가하기</Text>
    </Pressable>
  );
  await renderRouter(
    {
      'register/_layout': () => <Stack />,
      'register/index': Start,
      'register/found': Found,
      'register/select': () => <RegisterServiceSelectScreen more />,
    },
    { initialUrl: '/register/found' },
  );
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  await user.press(screen.getByRole('button', { name: '구독 추가하기' }));

  await user.press(screen.getByRole('button', { name: '뒤로 가기' }));

  expect(screen).toHavePathname('/register/found');
});

it('불러온 구독 확인에서 추가로 고르면 결제 정보 입력 없이 그 화면으로 돌아가고 새로 고른 것만 체크해 둔다', async () => {
  useRegisterDraft.getState().setSelectedIds(['spotify']);
  useRegisterDraft.getState().setFoundChecked(['youtube']);
  const Found = () => (
    <Pressable accessibilityRole="button" onPress={() => router.push('/register/select')}>
      <Text>구독 추가하기</Text>
    </Pressable>
  );
  await renderRouter(
    {
      'register/_layout': () => <Stack />,
      'register/found': Found,
      'register/select': () => <RegisterServiceSelectScreen more />,
      'register/selected': () => null,
    },
    { initialUrl: '/register/found' },
  );
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  await user.press(screen.getByRole('button', { name: '구독 추가하기' }));

  await user.press(screen.getByRole('checkbox', { name: 'Netflix' }));
  await user.press(screen.getByRole('button', { name: '2개 선택 완료' }));

  expect(screen).toHavePathname('/register/found');
  expect(useRegisterDraft.getState().foundChecked).toEqual(['youtube', 'netflix']);
});
