import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import type { NotificationPermission } from '@/lib/notifications';
import { apiError, createQueryWrapper, mockApi } from '@/lib/testing';
import { MypageNotificationScreen } from '@/screens/mypage/MypageNotificationScreen';

const SETTINGS = 'GET /api/v1/notifications/settings';
const UPDATE = 'PATCH /api/v1/notifications/settings';

const renderSettings = async (
  enabled: boolean,
  onRequestPermission: () => Promise<NotificationPermission>,
  update: unknown = { paymentReminderEnabled: !enabled },
) => {
  mockApi({ [SETTINGS]: { paymentReminderEnabled: enabled }, [UPDATE]: update });
  await renderRouter(
    { index: () => <MypageNotificationScreen onRequestPermission={onRequestPermission} /> },
    { initialUrl: '/', wrapper: createQueryWrapper() },
  );
  await screen.findByRole('switch');
};
const reminder = () => screen.getByRole('switch', { name: '구독 점검 알림' });
const sentBody = () => {
  const call = jest.mocked(globalThis.fetch).mock.calls.find(([, i]) => i?.method === 'PATCH');
  return call && JSON.parse(String(call[1]?.body));
};

afterEach(() => jest.restoreAllMocks());

test('저장된 설정을 불러와 보여 준다', async () => {
  await renderSettings(true, async () => 'granted' as const);

  expect(reminder()).toBeChecked();
});

test('켤 때 알림 권한을 허용하면 켜고 서버에 저장한다', async () => {
  const onRequestPermission = jest.fn(async () => 'granted' as const);
  await renderSettings(false, onRequestPermission);

  await userEvent.press(reminder());

  expect(onRequestPermission).toHaveBeenCalledTimes(1);
  expect(reminder()).toBeChecked();
  expect(sentBody()).toEqual({ paymentReminderEnabled: true });
});

test('켤 때 알림 권한을 거부하면 저장하지 않고 꺼진 채로 둔다', async () => {
  await renderSettings(false, async () => 'denied' as const);

  await userEvent.press(reminder());

  expect(reminder()).not.toBeChecked();
  expect(sentBody()).toBeUndefined();
});

test('기기 설정에서 거부돼 있으면 켜지 않고 설정 안내 토스트를 띄운다', async () => {
  await renderSettings(false, async () => 'blocked' as const);

  await userEvent.press(reminder());

  expect(reminder()).not.toBeChecked();
  expect(sentBody()).toBeUndefined();
  expect(await screen.findByText('기기 설정에서 알림을 허용하면 켤 수 있어요')).toBeOnTheScreen();
});

test('끌 때는 권한을 묻지 않고 끈다', async () => {
  const onRequestPermission = jest.fn(async () => 'granted' as const);
  await renderSettings(true, onRequestPermission);

  await userEvent.press(reminder());

  expect(onRequestPermission).not.toHaveBeenCalled();
  expect(reminder()).not.toBeChecked();
  expect(sentBody()).toEqual({ paymentReminderEnabled: false });
});

test('저장에 실패하면 토글을 되돌린다', async () => {
  await renderSettings(false, async () => 'granted' as const, apiError(500));

  await userEvent.press(reminder());

  await waitFor(() => expect(reminder()).not.toBeChecked());
});
