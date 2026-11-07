import { useLocalSearchParams, useRouter } from 'expo-router';
import { Linking } from 'react-native';

import { AddSubscriptionScreen } from '@/screens/onboarding/AddSubscriptionScreen';

// 첫 구독 등록 안내. Apple 로그인은 App Store 구독 관리로, 열 수 없어도 그대로 둔다
const openAppStoreSubscriptions = () =>
  Linking.openURL('itms-apps://apps.apple.com/account/subscriptions').catch(() => {});

export default function AddSubscriptionRoute() {
  const router = useRouter();
  const { provider } = useLocalSearchParams<{ provider?: string }>();
  const isGoogle = provider === 'google';

  return (
    <AddSubscriptionScreen
      provider={isGoogle ? 'google' : 'apple'}
      onSkip={() => router.replace('/')}
      onConfirm={isGoogle ? undefined : openAppStoreSubscriptions}
    />
  );
}
