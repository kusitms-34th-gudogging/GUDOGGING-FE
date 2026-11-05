import { render, screen, userEvent } from '@testing-library/react-native';

import { ImageCard } from '@/components/common/ImageCard';

const source = { uri: 'https://example.com/photo.png' };

describe('ImageCard', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('add 카드를 누르면 onPress가 호출된다', async () => {
    const onPress = jest.fn();
    await render(<ImageCard variant="add" onPress={onPress} accessibilityLabel="사진 추가" />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: '사진 추가' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('삭제 버튼을 누르면 onDelete가 호출된다', async () => {
    const onDelete = jest.fn();
    await render(
      <ImageCard
        variant="filled"
        source={source}
        onDelete={onDelete}
        deleteAccessibilityLabel="사진 삭제"
      />,
    );

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: '사진 삭제' }));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('showDelete가 false면 삭제 버튼이 보이지 않는다', async () => {
    await render(
      <ImageCard
        variant="filled"
        source={source}
        showDelete={false}
        deleteAccessibilityLabel="사진 삭제"
      />,
    );

    expect(screen.queryByRole('button', { name: '사진 삭제' })).not.toBeOnTheScreen();
  });
});
