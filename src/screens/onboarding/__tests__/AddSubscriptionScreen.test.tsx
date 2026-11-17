import { render, screen, userEvent } from '@testing-library/react-native';

import { AddSubscriptionScreen } from '@/screens/onboarding/AddSubscriptionScreen';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

it('Apple은 구독 관리를 열고 돌아오면 다시 열기와 스크린샷 등록하기가 보인다 (A-06과 같음)', async () => {
  const onConfirm = jest.fn();
  const onAddScreenshots = jest.fn();
  await render(
    <AddSubscriptionScreen
      provider="apple"
      onConfirm={onConfirm}
      onAddScreenshots={onAddScreenshots}
    />,
  );
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  await user.press(screen.getByRole('button', { name: '스크린샷 찍으러 가기' }));
  expect(onConfirm).toHaveBeenCalledTimes(1);

  await user.press(screen.getByRole('button', { name: '구독 목록 열기' }));
  expect(onConfirm).toHaveBeenCalledTimes(2);
  await user.press(screen.getByRole('button', { name: '스크린샷 등록하기' }));
  expect(onAddScreenshots).toHaveBeenCalled();
});

it('Google은 Gmail 연동 버튼 하나만 둔다', async () => {
  const onConfirm = jest.fn();
  await render(<AddSubscriptionScreen provider="google" onConfirm={onConfirm} />);
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  await user.press(screen.getByRole('button', { name: 'Gmail 연동하기' }));

  expect(onConfirm).toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Gmail 연동하기' })).toBeOnTheScreen();
});
