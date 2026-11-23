import '@/global.css';
import '@/lib/nativewindInterop';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components/common/ToastProvider';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { queryClient } from '@/lib/queryClient';

// 푸시 탭 처리가 읽음 API(useMutation)를 써서 QueryClientProvider 안쪽에서 호출
function RootStack() {
  usePushNotifications();
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView className="flex-1">
        <SafeAreaProvider>
          <BottomSheetModalProvider>
            <ToastProvider>
              <RootStack />
            </ToastProvider>
          </BottomSheetModalProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
