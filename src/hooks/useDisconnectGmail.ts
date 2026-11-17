import { useMutation, useQueryClient } from '@tanstack/react-query';

import { gmailConnectionKeys, type GmailConnectionResponse } from '@/hooks/useGmailConnection';
import { meKeys } from '@/hooks/useMe';
import { request } from '@/lib/request';

const DISCONNECTED: GmailConnectionResponse = {
  status: 'NOT_CONNECTED',
  connected: false,
  email: null,
};

// Gmail 연동 해제 (E-03b). 응답이 비어 있어 미연결 상태를 캐시에 바로 씀
export const useDisconnectGmail = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => request('/api/v1/gmail/connection', { method: 'DELETE' }),
    onSuccess: () => {
      client.setQueryData(gmailConnectionKeys.all, DISCONNECTED);
      return client.invalidateQueries({ queryKey: meKeys.all });
    },
  });
};
