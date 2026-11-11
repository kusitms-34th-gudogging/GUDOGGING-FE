import { render, screen, userEvent } from '@testing-library/react-native';

import { Modal } from '@/components/common/Modal';

describe('Modal', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('확인을 누르면 onConfirm과 onClose가 호출된다', async () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();
    await render(
      <Modal
        visible
        onClose={onClose}
        buttons="confirm"
        title="해지할까요?"
        confirmLabel="확인"
        onConfirm={onConfirm}
      />,
    );

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: '확인' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('취소를 누르면 onCancel과 onClose가 호출되고 onConfirm은 호출되지 않는다', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const onClose = jest.fn();
    await render(
      <Modal
        visible
        onClose={onClose}
        buttons="both"
        title="해지할까요?"
        confirmLabel="확인"
        cancelLabel="취소"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: '취소' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('배경은 눌러서 닫는 버튼이 아니다', async () => {
    await render(
      <Modal
        visible
        onClose={jest.fn()}
        buttons="confirm"
        title="해지할까요?"
        confirmLabel="확인"
      />,
    );

    expect(screen.queryByRole('button', { name: '닫기' })).not.toBeOnTheScreen();
  });

  it('buttons가 없으면 확인·취소 버튼이 보이지 않는다', async () => {
    await render(
      <Modal visible onClose={jest.fn()} title="처리 중" confirmLabel="확인" cancelLabel="취소" />,
    );

    expect(screen.queryByRole('button', { name: '확인' })).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: '취소' })).not.toBeOnTheScreen();
  });

  it('buttons가 confirm이면 취소 버튼이 보이지 않는다', async () => {
    await render(
      <Modal
        visible
        onClose={jest.fn()}
        buttons="confirm"
        title="해지할까요?"
        confirmLabel="확인"
        cancelLabel="취소"
      />,
    );

    expect(screen.queryByRole('button', { name: '취소' })).not.toBeOnTheScreen();
  });

  it('showDescription이 false면 설명이 보이지 않는다', async () => {
    await render(
      <Modal
        visible
        onClose={jest.fn()}
        title="해지할까요?"
        description="다음 결제일부터 청구되지 않아요"
        showDescription={false}
      />,
    );

    expect(screen.queryByText('다음 결제일부터 청구되지 않아요')).not.toBeOnTheScreen();
  });
});
