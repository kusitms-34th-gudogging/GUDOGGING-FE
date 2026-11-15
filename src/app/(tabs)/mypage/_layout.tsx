import { Stack } from 'expo-router';

// 마이페이지 하위 화면 중 탭바가 보이는 화면(알림 설정)을 탭 안에 쌓음
export default function MypageLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
