import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { CHECKUP_RECOMMEND_SAMPLE, CHECKUP_SAMPLE } from '@/constants/checkup';
import { CheckupResultScreen } from '@/screens/checkup/CheckupResultScreen';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

const netflix = CHECKUP_SAMPLE[0];

const renderResult = async (recommendations = CHECKUP_RECOMMEND_SAMPLE.netflix) => {
  await renderRouter(
    {
      index: () => null,
      'checkup/[id]/result': () => (
        <CheckupResultScreen
          subscription={netflix}
          categorySubscriptions={[{ ...netflix, cycle: 1, unit: '개월' }]}
          recommendations={recommendations}
        />
      ),
      'checkup/[id]/cancel': () => null,
    },
    { initialUrl: '/checkup/netflix/result' },
  );
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
};

describe('CheckupResultScreen', () => {
  it('해지하기를 누르면 해지 이유로 이동한다', async () => {
    const user = await renderResult();
    await user.press(screen.getByRole('button', { name: '해지하기' }));
    expect(screen).toHavePathname('/checkup/netflix/cancel');
  });

  it('유지하기를 누르면 홈으로 돌아간다', async () => {
    const user = await renderResult();

    await user.press(screen.getByRole('button', { name: '유지하기' }));
    expect(screen).toHavePathname('/');
  });

  it('추천 상품이 없으면 더 싸게 영역을 숨긴다', async () => {
    await renderResult();
    expect(screen.getByText('같은 넷플릭스, 더 싸게')).toBeOnTheScreen();

    screen.unmount();
    await renderResult([]);
    expect(screen.queryByText('같은 넷플릭스, 더 싸게')).not.toBeOnTheScreen();
  });
});
