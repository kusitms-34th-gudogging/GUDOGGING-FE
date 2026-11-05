import { render, screen, userEvent } from '@testing-library/react-native';

import { SearchBar } from '@/components/common/SearchBar';

describe('SearchBar', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('입력하면 onChangeText가 호출된다', async () => {
    const onChangeText = jest.fn();
    await render(<SearchBar value="" onChangeText={onChangeText} placeholder="검색" />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.type(screen.getByPlaceholderText('검색'), 'a');

    expect(onChangeText).toHaveBeenLastCalledWith('a');
  });

  it('입력값이 비어 있으면 지우기 버튼이 없다', async () => {
    await render(<SearchBar value="" onChangeText={() => {}} />);

    expect(screen.queryByRole('button', { name: '검색어 지우기' })).not.toBeOnTheScreen();
  });

  it('입력값이 있을 때 지우기 버튼을 누르면 onChangeText("")가 호출된다', async () => {
    const onChangeText = jest.fn();
    await render(<SearchBar value="넷플릭스" onChangeText={onChangeText} />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: '검색어 지우기' }));

    expect(onChangeText).toHaveBeenCalledWith('');
  });
});
