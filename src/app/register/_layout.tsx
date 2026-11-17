import { Stack } from 'expo-router';

import { useSyncSubscriptionDraft } from '@/hooks/useSubscriptionDraft';

export default function RegisterLayout() {
  // 직접 등록 중 바뀐 내용을 서버 임시저장에 맞춤
  useSyncSubscriptionDraft();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 완료 화면에서 스와이프로 돌아가면 이미 비운 등록 화면이 나와서 막음. 나가기는 확인 버튼으로만 */}
      <Stack.Screen name="done" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
