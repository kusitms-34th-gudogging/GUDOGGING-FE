import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';

import { Dial } from '@/components/common/Dial';

// userEvent.press는 실제 타이머면 내부에서 기다림 → 가짜 타이머 (.claude/rules/unit-test.md "속도")
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

// 연도 기본값이 올해 기준이라 범위를 고정 (실행 날짜와 상관없이 같은 결과)
const renderDial = async (value: Date) => {
  const onValueChange = jest.fn();
  await render(<Dial value={value} onValueChange={onValueChange} minYear={2026} maxYear={2030} />);
  return onValueChange;
};

// 손가락 스크롤은 Jest로 재현할 수 없어서 VoiceOver 올리기·내리기로 열을 한 칸씩 움직임
const adjust = (column: '연' | '월' | '일', actionName: 'increment' | 'decrement') =>
  fireEvent(screen.getByRole('adjustable', { name: column }), 'accessibilityAction', {
    nativeEvent: { actionName },
  });

describe('Dial', () => {
  it('1월 31일에서 월을 올리면 2월 말일(28일)로 맞춘다', async () => {
    const onValueChange = await renderDial(new Date(2026, 0, 31));
    await adjust('월', 'increment');
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 1, 28));
  });

  it('윤년이면 2월 말일을 29일로 맞춘다', async () => {
    const onValueChange = await renderDial(new Date(2028, 0, 31));
    await adjust('월', 'increment');
    expect(onValueChange).toHaveBeenCalledWith(new Date(2028, 1, 29));
  });

  it('12월에서 월을 올리면 연도는 그대로 두고 1월로 돌아간다', async () => {
    const onValueChange = await renderDial(new Date(2026, 11, 15));
    await adjust('월', 'increment');
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 0, 15));
  });

  it('말일에서 일을 올리면 1일로 돌아간다', async () => {
    const onValueChange = await renderDial(new Date(2026, 0, 31));
    await adjust('일', 'increment');
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 0, 1));
  });

  it('1일에서 일을 내리면 말일로 돌아간다', async () => {
    const onValueChange = await renderDial(new Date(2026, 0, 1));
    await adjust('일', 'decrement');
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 0, 31));
  });

  it('윤년 2월 29일에서 연도를 올리면 다음 해 2월 28일로 맞춘다', async () => {
    const onValueChange = await renderDial(new Date(2028, 1, 29));
    await adjust('연', 'increment');
    expect(onValueChange).toHaveBeenCalledWith(new Date(2029, 1, 28));
  });

  it('연도는 순환하지 않고 범위 끝에서 멈춘다', async () => {
    const atMax = await renderDial(new Date(2030, 5, 1));
    await adjust('연', 'increment');
    expect(atMax).not.toHaveBeenCalled();

    const atMin = await renderDial(new Date(2026, 5, 1));
    await adjust('연', 'decrement');
    expect(atMin).not.toHaveBeenCalled();
  });

  it('범위 밖 연도는 minYear로 맞춰서 월을 바꿔도 그 연도로 전달한다', async () => {
    const onValueChange = await renderDial(new Date(2024, 5, 15));
    await adjust('월', 'increment');
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 6, 15));
  });

  it('범위 밖 윤일은 맞춘 연도의 말일로 보정해 읽어준다', async () => {
    await renderDial(new Date(2024, 1, 29));
    expect(screen.getByRole('adjustable', { name: '일' })).toHaveAccessibilityValue({
      text: '28일',
    });
  });

  it('각 열이 현재 날짜를 읽어준다', async () => {
    await renderDial(new Date(2026, 0, 31));
    expect(screen.getByRole('adjustable', { name: '연' })).toHaveAccessibilityValue({
      text: '2026년',
    });
    expect(screen.getByRole('adjustable', { name: '월' })).toHaveAccessibilityValue({
      text: '1월',
    });
    expect(screen.getByRole('adjustable', { name: '일' })).toHaveAccessibilityValue({
      text: '31일',
    });
  });

  it('위아래 줄을 누르면 그 값으로 바뀐다', async () => {
    const onValueChange = await renderDial(new Date(2026, 0, 15));
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    // 순환 목록이라 같은 값 줄이 여러 개 그려짐. 어느 줄이든 같은 값
    await user.press(screen.getAllByRole('button', { name: '2월' })[0]);
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 1, 15));
  });
});
