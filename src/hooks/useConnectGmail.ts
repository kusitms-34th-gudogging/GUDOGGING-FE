import { useMutation, useQueryClient } from '@tanstack/react-query';

import { gmailConnectionKeys, type GmailConnectionResponse } from '@/hooks/useGmailConnection';
import { meKeys } from '@/hooks/useMe';
import { request } from '@/lib/request';

// Google 인증 코드로 Gmail 연동. 서버가 FAILED로 답해도 실패로 다룸 (E-04)
export const useConnectGmail = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (authCode: string) => {
      const data = await request<GmailConnectionResponse>('/api/v1/gmail/connection', {
        method: 'POST',
        body: { authCode },
      });
      if (!data.connected) throw new Error('Gmail 연동 실패');
      return data;
    },
    onSuccess: (data) => {
      client.setQueryData(gmailConnectionKeys.all, data);
      return client.invalidateQueries({ queryKey: meKeys.all });
    },
  });
};
