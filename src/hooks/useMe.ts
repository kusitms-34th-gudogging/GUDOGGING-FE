import { useQuery } from '@tanstack/react-query';

import { request } from '@/lib/request';

interface MeResponse {
  userId: string;
  provider: 'APPLE' | 'GOOGLE';
  // Apple 이메일 숨김 등으로 없으면 null
  email: string | null;
  gmailLinked: boolean;
  gmailEmail: string | null;
}

const PROVIDER_LABEL = { APPLE: 'Apple로 로그인', GOOGLE: 'Google로 로그인' } as const;

export const meKeys = {
  all: ['me'] as const,
};

// E-01 마이페이지 계정 (로그인 계정, Gmail 연동 계정과 별개)
export const useMe = () =>
  useQuery({
    queryKey: meKeys.all,
    queryFn: ({ signal }) => request<MeResponse>('/api/v1/users/me', { signal }),
    select: (me) => ({ email: me.email, loginProvider: PROVIDER_LABEL[me.provider] }),
  });
