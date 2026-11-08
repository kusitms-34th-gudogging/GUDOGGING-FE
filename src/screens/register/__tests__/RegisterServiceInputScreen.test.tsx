import AsyncStorage from '@react-native-async-storage/async-storage';
import { userEvent } from '@testing-library/react-native';
import { router, Stack } from 'expo-router';
import { act, renderRouter, screen } from 'expo-router/testing-library';
import { Pressable, Text } from 'react-native';

import { useRegisterDraft } from '@/hooks/useRegisterDraft';
import { RegisterServiceInputScreen } from '@/screens/register/RegisterServiceInputScreen';
import { RegisterServiceSelectScreen } from '@/screens/register/RegisterServiceSelectScreen';

// 시트 애니메이션·제스처는 네이티브라 라이브러리 mock으로 내용만 렌더
jest.mock('@gorhom/bottom-sheet', () => jest.requireActual('@gorhom/bottom-sheet/mock'));

const Start = () => (
  <Pressable accessibilityRole="button" onPress={() => router.push('/register/select')}>
    <Text>직접 등록하기</Text>
  </Pressable>
);

// 구독 추가(A-01) → 서비스 선택(A-02, Netflix 체크) → 결제 정보 입력
const renderInput = async () => {
  await renderRouter(
    {
      'register/_layout': () => <Stack />,
      'register/index': Start,
      'register/select': () => <RegisterServiceSelectScreen />,
      'register/input': () => <RegisterServiceInputScreen serviceId="netflix" />,
    },
    { initialUrl: '/register' },
  );
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  await user.press(screen.getByRole('button', { name: '직접 등록하기' }));
  await user.press(screen.getByRole('checkbox', { name: 'Netflix' }));
  await act(() => router.push('/register/input'));
  return user;
};

beforeEach(async () => {
  jest.useFakeTimers();
  useRegisterDraft.getState().reset();
  await AsyncStorage.clear();
});
afterEach(() => jest.useRealTimers());

describe('RegisterServiceInputScreen 이탈 팝업', () => {
  it('입력한 게 없으면 뒤로 가기에 팝업 없이 앞 화면으로 간다', async () => {
    const user = await renderInput();

    await user.press(screen.getByRole('button', { name: '뒤로 가기' }));

    expect(screen.queryByText('등록을 그만할까요?')).not.toBeOnTheScreen();
    expect(screen).toHavePathname('/register/select');
  });

  it('입력한 게 있으면 뒤로 가기에 팝업이 뜨고, 계속 작성하기면 머문다', async () => {
    const user = await renderInput();
    await user.type(screen.getByLabelText('결제 금액'), '13500');

    await user.press(screen.getByRole('button', { name: '뒤로 가기' }));
    expect(screen.getByText('등록을 그만할까요?')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: '계속 작성하기' }));
    expect(screen).toHavePathname('/register/input');
  });

  it('나가기를 누르면 등록 중이던 값을 지우고 구독 추가로 한 번에 돌아간다', async () => {
    const user = await renderInput();
    await user.type(screen.getByLabelText('결제 금액'), '13500');

    await user.press(screen.getByRole('button', { name: '뒤로 가기' }));
    await user.press(screen.getByRole('button', { name: '나가기' }));

    expect(screen).toHavePathname('/register');
    // 사이의 서비스 선택 화면이 팝업을 다시 띄우지 않음
    expect(screen.queryByText('등록을 그만할까요?')).not.toBeOnTheScreen();
    expect(useRegisterDraft.getState().selectedIds).toEqual([]);
  });
});
