import { render, screen, userEvent } from '@testing-library/react-native';
import { View } from 'react-native';

import { TopBar } from '@/components/common/TopBar';

const TestIcon = () => <View />;

const actions = () => ({
  action1: { icon: TestIcon, accessibilityLabel: '알림', onPress: jest.fn() },
  action2: { icon: TestIcon, accessibilityLabel: '검색', onPress: jest.fn() },
});

describe('TopBar', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('detail에서 뒤로 가기를 누르면 onBack이 호출된다', async () => {
    const onBack = jest.fn();
    await render(<TopBar variant="detail" title="상세" onBack={onBack} />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: '뒤로 가기' }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('main에는 onBack을 줘도 뒤로 가기 버튼이 없다', async () => {
    await render(<TopBar variant="main" title="홈" onBack={() => {}} />);

    expect(screen.queryByRole('button', { name: '뒤로 가기' })).not.toBeOnTheScreen();
  });

  it('액션 버튼을 누르면 그 액션의 onPress가 호출된다', async () => {
    const { action1, action2 } = actions();
    await render(<TopBar title="홈" action1={action1} action2={action2} />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: '검색' }));

    expect(action2.onPress).toHaveBeenCalledTimes(1);
    expect(action1.onPress).not.toHaveBeenCalled();
  });

  it('showAction1이 false면 action1 버튼이 숨는다', async () => {
    const { action1, action2 } = actions();
    await render(<TopBar title="홈" showAction1={false} action1={action1} action2={action2} />);

    expect(screen.queryByRole('button', { name: '알림' })).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: '검색' })).toBeOnTheScreen();
  });

  it('detail에서 텍스트 액션 조건이 맞으면 아이콘 대신 텍스트 버튼이 보이고 누르면 호출된다', async () => {
    const { action1 } = actions();
    const onTextActionPress = jest.fn();
    await render(
      <TopBar
        variant="detail"
        title="편집"
        action1={action1}
        showTextAction
        textAction="완료"
        onTextActionPress={onTextActionPress}
      />,
    );

    expect(screen.queryByRole('button', { name: '알림' })).not.toBeOnTheScreen();

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: '완료' }));

    expect(onTextActionPress).toHaveBeenCalledTimes(1);
  });

  it('main에서는 showTextAction을 줘도 텍스트 버튼 대신 아이콘이 보인다', async () => {
    const { action1 } = actions();
    await render(
      <TopBar
        variant="main"
        title="홈"
        action1={action1}
        showTextAction
        textAction="완료"
        onTextActionPress={() => {}}
      />,
    );

    expect(screen.queryByRole('button', { name: '완료' })).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: '알림' })).toBeOnTheScreen();
  });
});
