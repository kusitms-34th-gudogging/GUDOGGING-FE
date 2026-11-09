import { render, screen, userEvent } from '@testing-library/react-native';

import { TextField } from '@/components/common/TextField';

describe('TextField', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('입력하면 onChangeText가 입력한 값으로 호출된다', async () => {
    const onChangeText = jest.fn();
    await render(<TextField label="이름" onChangeText={onChangeText} />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.type(screen.getByLabelText('이름'), '구독');

    expect(onChangeText).toHaveBeenLastCalledWith('구독');
  });

  it('disabled면 입력할 수 없다', async () => {
    const onChangeText = jest.fn();
    await render(<TextField label="이름" disabled onChangeText={onChangeText} />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.type(screen.getByLabelText('이름'), '구독');

    expect(screen.getByLabelText('이름')).toBeDisabled();
    expect(onChangeText).not.toHaveBeenCalled();
  });

  it('포커스·블러 시 바깥에서 넘긴 onFocus·onBlur가 호출된다', async () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    await render(<TextField label="이름" onFocus={onFocus} onBlur={onBlur} />);

    // user.type은 포커스 → 입력 → 블러 순으로 이벤트를 보냄
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.type(screen.getByLabelText('이름'), 'a');

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('showHelper와 helper가 둘 다 있으면 도움말이 보인다', async () => {
    await render(<TextField label="이름" helper="2자 이상 입력" showHelper />);

    expect(screen.getByText('2자 이상 입력')).toBeOnTheScreen();
  });

  it('showHelper가 없으면 도움말이 보이지 않는다', async () => {
    await render(<TextField label="이름" helper="2자 이상 입력" />);

    expect(screen.queryByText('2자 이상 입력')).not.toBeOnTheScreen();
  });

  it('error면 showHelper가 없어도 helper가 접근성 힌트로 읽힌다', async () => {
    await render(<TextField label="이름" helper="2자 이상 입력" error />);

    expect(screen.getByHintText('2자 이상 입력')).toBeOnTheScreen();
  });

  it('error여도 disabled면 helper가 접근성 힌트로 읽히지 않는다', async () => {
    await render(<TextField label="이름" helper="2자 이상 입력" error disabled />);

    expect(screen.queryByHintText('2자 이상 입력')).not.toBeOnTheScreen();
  });

  it('showLabel을 끄면 라벨 글자는 숨지만 입력칸은 라벨 이름으로 찾을 수 있다', async () => {
    await render(<TextField label="결제 주기" showLabel={false} />);

    expect(screen.queryByText('결제 주기')).not.toBeOnTheScreen();
    expect(screen.getByLabelText('결제 주기')).toBeOnTheScreen();
  });

  it('suffix가 있으면 값 뒤에 단위가 보인다', async () => {
    await render(<TextField label="결제 금액" suffix="원" />);

    expect(screen.getByText('원')).toBeOnTheScreen();
  });
});
