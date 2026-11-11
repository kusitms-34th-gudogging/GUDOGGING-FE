import { Redirect } from 'expo-router';
import { useEffect } from 'react';

import { HomeScreen } from '@/screens/home/HomeScreen';

// 앱 실행 후 처음 한 번만 로그인 화면으로 보냄 (로그인 → 온보딩 → 홈)
const launch = { loginShown: false };

export default function HomeRoute() {
  useEffect(() => {
    launch.loginShown = true;
  }, []);

  if (!launch.loginShown) return <Redirect href="/login" />;
  return <HomeScreen />;
}
