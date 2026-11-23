import { renderHook } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';

import { homeKeys } from '@/hooks/useHome';
import { notificationKeys } from '@/hooks/useNotifications';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { queryClient } from '@/lib/queryClient';

jest.mock('expo-notifications');

it('앱을 보는 중에 푸시가 오면 알림 목록과 홈을 다시 불러온다', async () => {
  let onReceived = () => {};
  jest.mocked(Notifications.addNotificationReceivedListener).mockImplementation((listener) => {
    onReceived = () => listener({} as Notifications.Notification);
    return { remove: jest.fn() };
  });
  const invalidate = jest.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
  await renderHook(() => usePushNotifications());

  onReceived();

  expect(invalidate).toHaveBeenCalledWith({ queryKey: notificationKeys.all });
  expect(invalidate).toHaveBeenCalledWith({ queryKey: homeKeys.all });
});

it('앱을 보는 중에도 푸시를 배너로 띄운다', async () => {
  const handler = jest.mocked(Notifications.setNotificationHandler).mock.calls[0][0];

  await expect(
    handler?.handleNotification({} as Notifications.Notification),
  ).resolves.toMatchObject({ shouldShowBanner: true, shouldShowList: true });
});
