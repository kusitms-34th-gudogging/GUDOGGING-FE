import { SubscriptionDetailScreen } from '@/screens/manage/SubscriptionDetailScreen';

// shortcut: 상세 API가 없어 id를 쓰지 않고 샘플을 보여 줌, 연동 시 useLocalSearchParams로 id를 읽어 넘김
export default function SubscriptionDetailRoute() {
  return <SubscriptionDetailScreen />;
}
