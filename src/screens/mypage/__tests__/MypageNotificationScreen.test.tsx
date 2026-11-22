import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import { apiError, createQueryWrapper, mockApi } from '@/lib/testing';
import { MypageNotificationScreen } from '@/screens/mypage/MypageNotificationScreen';

const SETTINGS = 'GET /api/v1/notifications/settings';
const UPDATE = 'PATCH /api/v1/notifications/settings';

const renderSettings = async (
  enabled: boolean,
  onRequestPermission: () => Promise<boolean>,
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
  await renderSettings(true, async () => true);

  expect(reminder()).toBeChecked();
});

test('켤 때 알림 권한을 허용하면 켜고 서버에 저장한다', async () => {
  const onRequestPermission = jest.fn(async () => true);
  await renderSettings(false, onRequestPermission);

  await userEvent.press(reminder());

  expect(onRequestPermission).toHaveBeenCalledTimes(1);
  expect(reminder()).toBeChecked();
  expect(sentBody()).toEqual({ paymentReminderEnabled: true });
});

test('켤 때 알림 권한을 거부하면 저장하지 않고 꺼진 채로 둔다', async () => {
  await renderSettings(false, async () => false);

  await userEvent.press(reminder());

  expect(reminder()).not.toBeChecked();
  expect(sentBody()).toBeUndefined();
});

test('끌 때는 권한을 묻지 않고 끈다', async () => {
  const onRequestPermission = jest.fn(async () => true);
  await renderSettings(true, onRequestPermission);

  await userEvent.press(reminder());

  expect(onRequestPermission).not.toHaveBeenCalled();
  expect(reminder()).not.toBeChecked();
  expect(sentBody()).toEqual({ paymentReminderEnabled: false });
});

test('저장에 실패하면 토글을 되돌린다', async () => {
  await renderSettings(false, async () => true, apiError(500));

  await userEvent.press(reminder());

  await waitFor(() => expect(reminder()).not.toBeChecked());
});
