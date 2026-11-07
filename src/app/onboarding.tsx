import { requestNotificationPermission } from '@/lib/notifications';
import { OnboardingScreen } from '@/screens/OnboardingScreen';

export default function OnboardingRoute() {
  return <OnboardingScreen onRequestNotification={requestNotificationPermission} />;
}
