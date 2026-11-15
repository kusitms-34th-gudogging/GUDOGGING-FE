import { render, screen, userEvent } from '@testing-library/react-native';

import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { MypageNotificationScreen } from '@/screens/mypage/MypageNotificationScreen';

beforeEach(() => useNotificationSettings.setState({ checkupReminder: false }));

const reminder = () => screen.getByRole('switch', { name: '꾸준히 쓰는 구독 알림' });

test('켤 때 알림 권한을 허용하면 켜진다', async () => {
  const onRequestPermission = jest.fn(async () => true);
  await render(<MypageNotificationScreen onRequestPermission={onRequestPermission} />);

  await userEvent.press(reminder());

  expect(onRequestPermission).toHaveBeenCalledTimes(1);
  expect(reminder()).toBeChecked();
});

test('켤 때 알림 권한을 거부하면 꺼진 채로 둔다', async () => {
  await render(<MypageNotificationScreen onRequestPermission={async () => false} />);

  await userEvent.press(reminder());

  expect(reminder()).not.toBeChecked();
});

test('끌 때는 권한을 묻지 않고 끈다', async () => {
  useNotificationSettings.setState({ checkupReminder: true });
  const onRequestPermission = jest.fn(async () => true);
  await render(<MypageNotificationScreen onRequestPermission={onRequestPermission} />);

  await userEvent.press(reminder());

  expect(onRequestPermission).not.toHaveBeenCalled();
  expect(reminder()).not.toBeChecked();
});
