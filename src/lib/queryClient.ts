import { onlineManager, QueryClient } from '@tanstack/react-query';
import * as Network from 'expo-network';

import { ApiError } from '@/lib/request';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status < 500) && failureCount < 2,
    },
  },
});

// RN은 연결 상태를 TanStack이 모름 → expo-network로 알려 줌 (TanStack React Native 문서 예시)
// 끊기면 요청을 멈추고 다시 연결되면 다시 불러옴. 끊김 안내 토스트(TST-001 E-2)도 이 상태를 씀
onlineManager.setEventListener((setOnline) => {
  let initialized = false;
  const subscription = Network.addNetworkStateListener((state) => {
    initialized = true;
    setOnline(!!state.isConnected);
  });
  // 첫 이벤트 전 상태. 일부 플랫폼에서 실패할 수 있어 무시 (문서)
  Network.getNetworkStateAsync()
    .then((state) => {
      if (!initialized) setOnline(!!state.isConnected);
    })
    .catch(() => {});
  return subscription.remove;
});
