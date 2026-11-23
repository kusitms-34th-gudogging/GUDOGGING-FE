import { getMessaging, getToken } from '@react-native-firebase/messaging';
import { useMutation } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { request } from '@/lib/request';

// 푸시 토큰 등록 (O-03·O-04). 권한이 없으면 보내지 않음 (명세: 거부하면 토큰 저장 안 함)
// 이미 등록된 토큰이면 서버가 갱신 → 홈 진입마다 불러 토큰 교체·설정 앱에서 나중에 허용한 경우도 반영
// 서버가 Firebase Admin SDK로 보내서 iOS도 APNs 토큰이 아니라 FCM 토큰
// ponytail: getToken은 v27에서 deprecated(Installation ID 권장), 서버가 FID 발송으로 바뀌면 register/onRegistered로
// ARM64 시뮬레이터는 APNs 토큰을 못 받아 getToken이 실패 → 실기기에서 확인
export const useRegisterPushToken = () =>
  useMutation({
    mutationFn: async () => {
      if (!(await Notifications.getPermissionsAsync()).granted) return;
      const deviceToken = await getToken(getMessaging());
      await request('/api/v1/notifications/tokens', {
        method: 'POST',
        body: { deviceToken, platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID' },
      });
    },
  });
