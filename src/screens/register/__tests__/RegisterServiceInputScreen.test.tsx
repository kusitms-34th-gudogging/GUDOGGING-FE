import AsyncStorage from '@react-native-async-storage/async-storage';
import { userEvent } from '@testing-library/react-native';
import { router, Stack } from 'expo-router';
import { act, renderRouter, screen } from 'expo-router/testing-library';
import { Pressable, Text } from 'react-native';

import { FOUND_SAMPLE } from '@/constants/services';
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

describe('RegisterServiceInputScreen 불러온 구독 수정', () => {
  const youtube = FOUND_SAMPLE.find((f) => f.id === 'youtube');

  const renderFoundEdit = async (found = youtube) => {
    await renderRouter(
      {
        'register/_layout': () => <Stack />,
        'register/found': () => null,
        'register/input': () => <RegisterServiceInputScreen serviceId={found?.id} found={found} />,
      },
      { initialUrl: '/register/found' },
    );
    await act(() => router.push('/register/input'));
    return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  };

  it('서비스명을 바꿔 저장하면 바꾼 이름이 저장된다', async () => {
    const user = await renderFoundEdit();

    await user.type(screen.getByLabelText('서비스명'), '유튜브');
    await user.press(screen.getByRole('button', { name: '수정 완료' }));

    expect(useRegisterDraft.getState().payments.youtube?.name).toBe('유튜브');
  });

  it('서비스명을 비워 두면 찾은 이름으로 저장된다', async () => {
    const user = await renderFoundEdit();

    await user.press(screen.getByRole('button', { name: '수정 완료' }));

    expect(useRegisterDraft.getState().payments.youtube?.name).toBe('YouTube Premium');
  });

  it('분석이 결제일을 못 읽었으면 오늘 날짜로 채워 둔다', async () => {
    jest.setSystemTime(new Date(2026, 10, 10, 15));
    await renderFoundEdit(FOUND_SAMPLE.find((f) => f.id === 'netflix'));

    expect(screen.getByText('2026.11.10')).toBeOnTheScreen();
  });

  // 밀리의 서재: 결제일만 빠진 확인 필요 항목
  it('확인 필요 항목은 금액 에러를 켠 채로 열리고, 금액을 고치면 사라진다', async () => {
    const user = await renderFoundEdit(FOUND_SAMPLE.find((f) => f.id === 'custom-found-millie'));
    const helper = '금액을 정확히 읽지 못했어요. 실제 결제 금액을 확인해 주세요.';

    expect(screen.getByText(helper)).toBeOnTheScreen();

    await user.type(screen.getByLabelText('결제 금액'), '0');

    expect(screen.queryByText(helper)).not.toBeOnTheScreen();
  });

  it('금액 에러가 떠 있어도 금액이 있으면 수정 완료를 누를 수 있다', async () => {
    await renderFoundEdit(FOUND_SAMPLE.find((f) => f.id === 'custom-found-millie'));

    expect(
      screen.getByText('금액을 정확히 읽지 못했어요. 실제 결제 금액을 확인해 주세요.'),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: '수정 완료' })).toBeEnabled();
  });
});

it('불러온 구독 확인에서 직접 입력으로 추가하면 그 화면으로 돌아가 체크해 둔다', async () => {
  await renderRouter(
    {
      'register/_layout': () => <Stack />,
      'register/found': () => null,
      'register/select': () => null,
      'register/input': () => <RegisterServiceInputScreen more />,
    },
    { initialUrl: '/register/found' },
  );
  await act(() => router.push('/register/select'));
  await act(() => router.push('/register/input'));
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  await user.type(screen.getByLabelText('서비스명'), '왓챠');
  await user.type(screen.getByLabelText('결제 금액'), '7900');
  await user.press(screen.getByLabelText('다음 결제일'));
  // 시트 mock은 단위·결제일 시트를 둘 다 그려서 뒤의 결제일 시트 확인을 누름
  await user.press(screen.getAllByRole('button', { name: '확인' })[1]);
  await user.press(screen.getByRole('button', { name: '저장하기' }));

  expect(screen).toHavePathname('/register/found');
  const [id] = useRegisterDraft.getState().foundChecked ?? [];
  expect(useRegisterDraft.getState().payments[id]?.name).toBe('왓챠');
});

it('사전 등록 서비스는 그 서비스의 카테고리를 기본값으로 채운다', async () => {
  await renderRouter(
    { 'register/input': () => <RegisterServiceInputScreen serviceId="spotify" /> },
    { initialUrl: '/register/input' },
  );

  expect(screen.getByText('음악')).toBeOnTheScreen();
});
