import { useLocalSearchParams, useRouter } from 'expo-router';

import { requestNotificationPermission } from '@/lib/notifications';
import { OnboardingScreen } from '@/screens/onboarding/OnboardingScreen';

export default function OnboardingRoute() {
  const router = useRouter();
  const { provider } = useLocalSearchParams<{ provider?: string }>();

  return (
    <OnboardingScreen
      onRequestNotification={requestNotificationPermission}
      onComplete={() =>
        router.replace({ pathname: '/onboarding/add-subscription', params: { provider } })
      }
    />
  );
}
