import { Stack } from 'expo-router';

export default function RegisterLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 완료 화면에서 스와이프로 돌아가면 이미 비운 등록 화면이 나와서 막음. 나가기는 확인 버튼으로만 */}
      <Stack.Screen name="done" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
