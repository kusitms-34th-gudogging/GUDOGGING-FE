import { useMutation, useQueryClient } from '@tanstack/react-query';

import { gmailConnectionKeys, type GmailConnectionResponse } from '@/hooks/useGmailConnection';
import { meKeys } from '@/hooks/useMe';
import { request } from '@/lib/request';

// Google 인증 코드로 Gmail 연동. 실패는 서버가 오류 코드로 답함 → E-04
export const useConnectGmail = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (authCode: string) =>
      request<GmailConnectionResponse>('/api/v1/gmail/connection', {
        method: 'POST',
        body: { authCode },
      }),
    onSuccess: (data) => {
      client.setQueryData(gmailConnectionKeys.all, data);
      return client.invalidateQueries({ queryKey: meKeys.all });
    },
  });
};
