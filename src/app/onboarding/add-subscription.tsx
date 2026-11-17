import { useLocalSearchParams, useRouter } from 'expo-router';
import { Linking } from 'react-native';

import { AddSubscriptionScreen } from '@/screens/onboarding/AddSubscriptionScreen';

// 첫 구독 등록 안내. Apple 로그인은 App Store 구독 관리로, 열 수 없어도 그대로 둔다
// 스크린샷 안내(A-06)와 같은 https 주소: 기기에선 App Store 구독 목록이 열리고, App Store가 없는 시뮬레이터에서도 열림 (itms-apps://는 시뮬레이터에서 안 열림)
const openAppStoreSubscriptions = () =>
  Linking.openURL('https://apps.apple.com/account/subscriptions').catch(() => {});

export default function AddSubscriptionRoute() {
  const router = useRouter();
  const { provider } = useLocalSearchParams<{ provider?: string }>();
  const isGoogle = provider === 'google';

  return (
    <AddSubscriptionScreen
      provider={isGoogle ? 'google' : 'apple'}
      onSkip={() => router.replace('/')}
      // Google은 바로 Gmail 연동 + 결제 메일 분석(A-12) → 불러온 구독 확인
      onConfirm={
        isGoogle
          ? () => router.push({ pathname: '/register/analyze', params: { source: 'gmail' } })
          : openAppStoreSubscriptions
      }
      // Apple은 캡처하고 돌아와 스크린샷 고르기(A-07) → 분석 → 불러온 구독 확인
      onAddScreenshots={isGoogle ? undefined : () => router.push('/register/images')}
    />
  );
}
