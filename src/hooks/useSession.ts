import { useQuery } from '@tanstack/react-query';

import { restoreSession } from '@/lib/request';

export const sessionKeys = { all: ['session'] as const };

// 앱 실행 때 한 번 리프레시 토큰으로 재발급해 로그인이 살아 있는지 확인 (S-01)
// retry false: 오프라인이면 재시도 대기 동안 빈 화면이 길어짐 → 바로 실패로 보고 홈에서 다시 시도
export const useSession = (enabled: boolean) =>
  useQuery({
    queryKey: sessionKeys.all,
    queryFn: restoreSession,
    enabled,
    retry: false,
    staleTime: Infinity,
  });
