import { useLocalSearchParams } from 'expo-router';

import { ManageDetailScreen } from '@/screens/manage/ManageDetailScreen';

export default function SubscriptionDetailRoute() {
  const { id, confirmCancel } = useLocalSearchParams<{ id: string; confirmCancel?: string }>();
  return <ManageDetailScreen id={id} confirmCancel={!!confirmCancel} />;
}
