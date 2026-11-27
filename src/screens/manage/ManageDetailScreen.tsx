import { router } from 'expo-router';
import { View } from 'react-native';

import { DetailSkeleton } from '@/components/common/DetailSkeleton';
import { QueryState } from '@/components/common/QueryState';
import { ToastOutlet } from '@/components/common/ToastProvider';
import { TopBar } from '@/components/common/TopBar';
import { useSubscription } from '@/hooks/useSubscriptions';
import { EndedSubscriptionDetailScreen } from '@/screens/manage/EndedSubscriptionDetailScreen';
import { SubscriptionDetailScreen } from '@/screens/manage/SubscriptionDetailScreen';

interface ManageDetailScreenProps {
  id: string;
  confirmCancel?: boolean;
}

// 구독 상세 조회 후 상태로 화면을 고름: 구독 중(M-03) · 구독 종료(M-05)
// 같은 id라도 해지 완료하면 다시 불러와 구독 종료 화면으로 바뀜
export const ManageDetailScreen = ({ id, confirmCancel }: ManageDetailScreenProps) => {
  const { data, isError, refetch } = useSubscription(id);

  if (!data) {
    return (
      <View className="pt-safe flex-1 bg-bg-default">
        {/* 로딩·에러 중에도 뒤로 갈 수 있게 상단바는 상세 화면과 같게 */}
        <TopBar
          variant="detail"
          title="구독 상세"
          onBack={() => router.back()}
          showAction1={false}
          showAction2={false}
        />
        {isError ? <QueryState isError onRetry={refetch} /> : <DetailSkeleton showToggle />}
        <ToastOutlet placement="bottom" />
      </View>
    );
  }
  return data.status === 'ended' ? (
    <EndedSubscriptionDetailScreen subscription={data} />
  ) : (
    <SubscriptionDetailScreen subscription={data} confirmCancel={confirmCancel} />
  );
};
