import { onlineManager } from '@tanstack/react-query';
import { act, screen, userEvent } from '@testing-library/react-native';
import { router, Stack } from 'expo-router';
import { renderRouter } from 'expo-router/testing-library';
import { AccessibilityInfo, Pressable } from 'react-native';

import { Text } from '@/components/common/Text';
import { ToastOutlet, ToastProvider } from '@/components/common/ToastProvider';
import { useToast } from '@/hooks/useToast';

const ShowButtons = () => {
  const { show } = useToast();
  return (
    <>
      <Pressable accessibilityRole="button" onPress={() => show({ message: '저장했어요' })}>
        <Text>첫 토스트</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => show({ message: '삭제했어요' })}>
        <Text>두 번째 토스트</Text>
      </Pressable>
    </>
  );
};

// ToastOutlet은 포커스된 화면에서만 그려서 라우트 안에 둠 (앱에선 항상 화면 안)
const renderProvider = () =>
  renderRouter(
    {
      index: () => (
        <>
          <ShowButtons />
          <ToastOutlet />
        </>
      ),
    },
    { initialUrl: '/', wrapper: ToastProvider },
  );

describe('ToastProvider', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('show를 호출하면 메시지가 보이고 스크린리더로 읽어준다', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    await renderProvider();

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: '첫 토스트' }));

    expect(screen.getByText('저장했어요')).toBeOnTheScreen();
    expect(announce).toHaveBeenCalledWith('저장했어요');
  });

  it('2초가 지나면 사라진다', async () => {
    await renderProvider();

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: '첫 토스트' }));
    await act(() => jest.advanceTimersByTime(2000));

    expect(screen.queryByText('저장했어요')).not.toBeOnTheScreen();
  });

  it('떠 있는 동안 다시 show하면 새 메시지로 바뀌고 타이머가 다시 시작된다', async () => {
    await renderProvider();

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: '첫 토스트' }));
    await act(() => jest.advanceTimersByTime(1600));
    await user.press(screen.getByRole('button', { name: '두 번째 토스트' }));
    await act(() => jest.advanceTimersByTime(1600));

    expect(screen.queryByText('저장했어요')).not.toBeOnTheScreen();
    expect(screen.getByText('삭제했어요')).toBeOnTheScreen();

    await act(() => jest.advanceTimersByTime(400));

    expect(screen.queryByText('삭제했어요')).not.toBeOnTheScreen();
  });

  it('화면이 쌓여 있으면 맨 위(포커스된) 화면에만 그린다', async () => {
    await renderRouter(
      {
        _layout: () => <Stack />,
        index: () => <ToastOutlet />,
        notification: () => (
          <>
            <ShowButtons />
            <ToastOutlet />
          </>
        ),
      },
      { initialUrl: '/', wrapper: ToastProvider },
    );
    await act(() => router.push('/notification'));
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await user.press(screen.getByRole('button', { name: '첫 토스트' }));

    // 뒤에 깔린 화면까지 그리면 뒤로 가며 띄운 토스트가 떠나는 화면·도착 화면에서 두 번 보임
    expect(screen.getAllByText('저장했어요', { includeHiddenElements: true })).toHaveLength(1);
  });

  it('다음 화면용 토스트는 지금 화면엔 안 그리고, 돌아간 화면에서 띄운다', async () => {
    const LeaveButton = ({ back }: { back: boolean }) => {
      const { show } = useToast();
      return (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            if (back) router.back();
            show({ message: '삭제했어요' }, { nextScreen: true });
          }}
        >
          <Text>{back ? '삭제하고 나가기' : '나가지 않기'}</Text>
        </Pressable>
      );
    };
    await renderRouter(
      {
        _layout: () => <Stack />,
        index: () => <ToastOutlet />,
        notification: () => (
          <>
            <LeaveButton back={false} />
            <LeaveButton back />
            <ToastOutlet />
          </>
        ),
      },
      { initialUrl: '/', wrapper: ToastProvider },
    );
    await act(() => router.push('/notification'));
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    // 떠나지 않으면 지금 화면에 안 뜸 (떠나는 화면에 먼저 보이던 문제)
    await user.press(screen.getByRole('button', { name: '나가지 않기' }));
    expect(screen.queryByText('삭제했어요', { includeHiddenElements: true })).toBeNull();

    await user.press(screen.getByRole('button', { name: '삭제하고 나가기' }));

    expect(screen).toHavePathname('/');
    expect(screen.getAllByText('삭제했어요', { includeHiddenElements: true })).toHaveLength(1);
  });

  it('토스트가 떠 있는 동안 뒤로 가면 이전 화면엔 다시 뜨지 않는다', async () => {
    await renderRouter(
      {
        _layout: () => <Stack />,
        index: () => <ToastOutlet />,
        notification: () => (
          <>
            <ShowButtons />
            <ToastOutlet />
          </>
        ),
      },
      { initialUrl: '/', wrapper: ToastProvider },
    );
    await act(() => router.push('/notification'));
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: '첫 토스트' }));
    expect(screen.getByText('저장했어요')).toBeOnTheScreen();

    await act(() => router.back());

    expect(screen).toHavePathname('/');
    expect(screen.queryByText('저장했어요', { includeHiddenElements: true })).toBeNull();
  });

  it('인터넷이 끊기면 지금 화면에 연결 확인 토스트를 띄운다', async () => {
    await renderProvider();

    await act(() => onlineManager.setOnline(false));

    expect(screen.getByText('인터넷 연결을 확인해 주세요')).toBeOnTheScreen();
    await act(() => onlineManager.setOnline(true));
  });
});
