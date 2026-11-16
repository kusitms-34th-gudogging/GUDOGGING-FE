import { render, screen } from '@testing-library/react-native';

import { NOTIFICATION_SAMPLE } from '@/constants/notification';
import { HomeNotificationScreen } from '@/screens/home/HomeNotificationScreen';

const EMPTY = '아직 받은 알림이 없어요';

test('알림이 없으면 빈 상태를 보여 준다', async () => {
  await render(<HomeNotificationScreen notifications={[]} />);

  expect(screen.getByText(EMPTY)).toBeOnTheScreen();
  expect(screen.queryByRole('header', { name: '오늘' })).not.toBeOnTheScreen();
});

test('이전 알림만 있으면 오늘 묶음 없이 이전 알림만 보여 준다', async () => {
  await render(
    <HomeNotificationScreen notifications={NOTIFICATION_SAMPLE.filter((n) => !n.today)} />,
  );

  expect(screen.getByRole('header', { name: '이전 알림' })).toBeOnTheScreen();
  expect(screen.queryByRole('header', { name: '오늘' })).not.toBeOnTheScreen();
  expect(screen.queryByText(EMPTY)).not.toBeOnTheScreen();
});
