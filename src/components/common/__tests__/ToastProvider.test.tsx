import { act, render, screen, userEvent } from '@testing-library/react-native';
import { AccessibilityInfo, Pressable, Text } from 'react-native';

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

const renderProvider = () =>
  render(
    <ToastProvider>
      <ShowButtons />
      <ToastOutlet />
    </ToastProvider>,
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

  it('1초가 지나면 사라진다', async () => {
    await renderProvider();

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: '첫 토스트' }));
    await act(() => jest.advanceTimersByTime(1000));

    expect(screen.queryByText('저장했어요')).not.toBeOnTheScreen();
  });

  it('떠 있는 동안 다시 show하면 새 메시지로 바뀌고 타이머가 다시 시작된다', async () => {
    await renderProvider();

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: '첫 토스트' }));
    await act(() => jest.advanceTimersByTime(800));
    await user.press(screen.getByRole('button', { name: '두 번째 토스트' }));
    await act(() => jest.advanceTimersByTime(800));

    expect(screen.queryByText('저장했어요')).not.toBeOnTheScreen();
    expect(screen.getByText('삭제했어요')).toBeOnTheScreen();

    await act(() => jest.advanceTimersByTime(200));

    expect(screen.queryByText('삭제했어요')).not.toBeOnTheScreen();
  });
});
