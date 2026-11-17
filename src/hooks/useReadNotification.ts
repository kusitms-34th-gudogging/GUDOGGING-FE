import { useMutation, useQueryClient } from '@tanstack/react-query';

import { homeKeys } from '@/hooks/useHome';
import { notificationKeys } from '@/hooks/useNotifications';
import { request } from '@/lib/request';

// 알림 읽음 처리. 홈 알림 아이콘의 안 읽음 표시(hasUnreadNotification)도 바뀜
export const useReadNotification = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => request(`/api/v1/notifications/${id}/read`, { method: 'PATCH' }),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: notificationKeys.all }),
        client.invalidateQueries({ queryKey: homeKeys.all }),
      ]),
  });
};
