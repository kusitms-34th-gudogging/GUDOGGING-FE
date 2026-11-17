import { useLocalSearchParams } from 'expo-router';

import { CancelGuideScreen } from '@/screens/cancel/CancelGuideScreen';

export default function CancelGuideRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CancelGuideScreen subscriptionId={id} />;
}
