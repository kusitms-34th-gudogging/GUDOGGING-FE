import { requestNotificationPermission } from '@/lib/notifications';
import { OnboardingScreen } from '@/screens/onboarding/OnboardingScreen';

export default function OnboardingRoute() {
  return <OnboardingScreen onRequestNotification={requestNotificationPermission} />;
}
