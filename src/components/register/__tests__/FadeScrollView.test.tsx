import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { FadeScrollView } from '@/components/register/FadeScrollView';

const renderList = async () => {
  await render(
    <FadeScrollView testID="list">
      <Text>항목</Text>
    </FadeScrollView>,
  );
  const list = screen.getByTestId('list');
  // 보이는 높이 100
  await fireEvent(list, 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width: 300, height: 100 } },
  });
  return list;
};

const scrollTo = (list: ReturnType<typeof screen.getByTestId>, y: number) =>
  fireEvent.scroll(list, {
    nativeEvent: {
      contentOffset: { x: 0, y },
      contentSize: { width: 300, height: 300 },
      layoutMeasurement: { width: 300, height: 100 },
    },
  });

describe('FadeScrollView', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('내용이 영역보다 짧으면 페이드가 없다', async () => {
    const list = await renderList();

    await fireEvent(list, 'contentSizeChange', 300, 80);

    expect(screen.queryByTestId('scroll-fade')).not.toBeOnTheScreen();
  });

  it('내용이 영역을 넘으면 페이드가 보이고, 맨 아래까지 내리면 사라진다', async () => {
    const list = await renderList();
    await fireEvent(list, 'contentSizeChange', 300, 300);
    expect(screen.getByTestId('scroll-fade')).toBeOnTheScreen();

    await scrollTo(list, 200);
    expect(screen.queryByTestId('scroll-fade')).not.toBeOnTheScreen();

    await scrollTo(list, 120);
    expect(screen.getByTestId('scroll-fade')).toBeOnTheScreen();
  });
});
