import { Redirect } from 'expo-router';

import { useSession } from '@/hooks/useSession';
import { launch } from '@/lib/launch';
import { HomeScreen } from '@/screens/home/HomeScreen';

// 앱을 홈으로 열면 세션 확인(S-01): 재발급되면 홈, 리프레시 토큰이 없거나 만료면 로그인
// 로그인 화면을 거쳐 왔으면 확인하지 않음 (로그인 → 온보딩 → 홈)
// 확인이 실패(네트워크·5xx)해도 토큰은 남아 있어 홈으로, 홈 API가 다시 시도함
export default function HomeRoute() {
  const session = useSession(!launch.loginShown);
  if (!launch.loginShown) {
    // shortcut: 재발급 응답까지 빈 화면, 스플래시를 그동안 붙잡아야 하면 expo-splash-screen preventAutoHideAsync
    if (session.isPending) return null;
    if (session.data === false) return <Redirect href="/login" />;
  }
  return <HomeScreen />;
}
