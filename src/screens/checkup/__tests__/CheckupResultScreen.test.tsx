import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { CHECKUP_SAMPLE } from '@/constants/checkup';
import { CheckupResultScreen } from '@/screens/checkup/CheckupResultScreen';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

const renderResult = async () => {
  await renderRouter(
    {
      index: () => null,
      'checkup/[id]/result': () => <CheckupResultScreen subscription={CHECKUP_SAMPLE[0]} />,
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
});
