import { useQuery } from '@tanstack/react-query';

import { request } from '@/lib/request';

export interface GmailConnectionResponse {
  status: 'NOT_CONNECTED' | 'CONNECTED';
  connected: boolean;
  email: string | null;
}

export const gmailConnectionKeys = {
  all: ['gmailConnection'] as const,
};

// E-02·E-03 Gmail 연동 상태. 연결된 Gmail 주소, 미연결이면 null
export const useGmailConnection = () =>
  useQuery({
    queryKey: gmailConnectionKeys.all,
    queryFn: ({ signal }) =>
      request<GmailConnectionResponse>('/api/v1/gmail/connection', { signal }),
    select: (data) => (data.connected ? data.email : null),
  });
