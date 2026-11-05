import { render, screen, userEvent } from '@testing-library/react-native';
import { Text } from 'react-native';

import { BottomSheet } from '@/components/common/BottomSheet';

// 시트 애니메이션·제스처는 네이티브라 라이브러리 mock으로 내용만 렌더
jest.mock('@gorhom/bottom-sheet', () => jest.requireActual('@gorhom/bottom-sheet/mock'));

const renderSheet = (props: { onConfirm: () => void; confirmDisabled?: boolean }) =>
  render(
    <BottomSheet visible onClose={jest.fn()} title="다음 결제일" confirmLabel="확인" {...props}>
      <Text>내용</Text>
    </BottomSheet>,
  );

describe('BottomSheet', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('확인을 누르면 onConfirm이 호출된다', async () => {
    const onConfirm = jest.fn();
    await renderSheet({ onConfirm });

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: '확인' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('confirmDisabled면 확인을 눌러도 onConfirm이 호출되지 않는다', async () => {
    const onConfirm = jest.fn();
    await renderSheet({ onConfirm, confirmDisabled: true });

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: '확인' }));

    expect(onConfirm).not.toHaveBeenCalled();
  });
});
