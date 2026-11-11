import { Redirect } from 'expo-router';

import { launch } from '@/lib/launch';
import { HomeScreen } from '@/screens/home/HomeScreen';

// 앱 실행 후 로그인 화면을 아직 안 봤으면 로그인부터 (로그인 → 온보딩 → 홈)
export default function HomeRoute() {
  if (!launch.loginShown) return <Redirect href="/login" />;
  return <HomeScreen />;
}
