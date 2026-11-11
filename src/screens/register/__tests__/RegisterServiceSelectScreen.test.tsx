import AsyncStorage from '@react-native-async-storage/async-storage';
import { userEvent, within } from '@testing-library/react-native';
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

describe('RegisterServiceSelectScreen 뒤로 가기', () => {
  // 이탈 팝업은 구독 정보 입력(A-03)에서만 (기획 답변)
  it('서비스를 고른 뒤 뒤로 가도 팝업 없이 나가고 고른 값은 남는다', async () => {
    const user = await renderSelect();
    await user.press(screen.getByRole('checkbox', { name: 'Netflix' }));

    await user.press(screen.getByRole('button', { name: '뒤로 가기' }));

    expect(screen).toHavePathname('/register');
    expect(screen.queryByText('등록을 그만할까요?')).not.toBeOnTheScreen();
    expect(useRegisterDraft.getState().selectedIds).toEqual(['netflix']);
  });

  it('불러온 구독 확인에서 더 고르러 온 경우엔 팝업 없이 돌아간다', async () => {
    const user = await renderSelect({ more: true });
    await user.press(screen.getByRole('checkbox', { name: 'Spotify' }));

    await user.press(screen.getByRole('button', { name: '뒤로 가기' }));

    expect(screen).toHavePathname('/register');
    expect(useRegisterDraft.getState().selectedIds).toEqual(['spotify']);
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
  useRegisterDraft.getState().setFoundChecked(['found-youtube']);
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

  await user.press(screen.getByRole('checkbox', { name: '티빙' }));
  await user.press(screen.getByRole('button', { name: '2개 선택 완료' }));

  expect(screen).toHavePathname('/register/found');
  expect(useRegisterDraft.getState().foundChecked).toEqual(['found-youtube', 'tving']);
});

it('선택한 서비스 칩은 고른 순서대로 나열한다', async () => {
  const user = await renderSelect();

  await user.press(screen.getByRole('checkbox', { name: 'Spotify' }));
  await user.press(screen.getByRole('checkbox', { name: 'Netflix' }));

  const chips = screen.getAllByRole('button', { name: /^(Spotify|Netflix)$/ });
  expect(chips.map((c) => (within(c).queryByText('Spotify') ? 'Spotify' : 'Netflix'))).toEqual([
    'Spotify',
    'Netflix',
  ]);
});

it('검색 결과는 이름 일치율 높은 순으로 보여 준다', async () => {
  const user = await renderSelect();

  // 티빙은 앞부분 일치라 맨 위, 챗지피티·스포티파이는 중간에 포함이라 목록 순서대로
  await user.type(screen.getByPlaceholderText('검색'), '티');

  const names = screen.getAllByRole('checkbox').map((c) => c.props.accessibilityLabel);
  expect(names).toEqual(['티빙', 'ChatGPT', 'Spotify']);
});

it('구독 추가하기로 왔으면 이미 불러온 서비스는 체크된 채로 풀리지 않는다', async () => {
  const user = await renderSelect({ more: true });
  const netflix = screen.getByRole('checkbox', { name: 'Netflix' });

  expect(netflix).toBeChecked();
  expect(netflix).toBeDisabled();
  await user.press(netflix);

  expect(screen.getByRole('checkbox', { name: 'Netflix' })).toBeChecked();
  expect(useRegisterDraft.getState().selectedIds).toEqual([]);
});

it('불러온 구독의 이름을 바꿨으면 그 서비스는 잠기지 않아 새로 고를 수 있다', async () => {
  useRegisterDraft.getState().setPayment('found-netflix', {
    name: '넷플 가족',
    category: '영상·OTT',
    amount: 13500,
    cycle: 1,
    unit: '개월',
    nextDate: new Date(2026, 10, 20),
    paidAt: 'web',
  });
  const user = await renderSelect({ more: true });
  const netflix = screen.getByRole('checkbox', { name: 'Netflix' });

  expect(netflix).not.toBeChecked();
  expect(netflix).toBeEnabled();
  await user.press(netflix);

  expect(useRegisterDraft.getState().selectedIds).toEqual(['netflix']);
});
