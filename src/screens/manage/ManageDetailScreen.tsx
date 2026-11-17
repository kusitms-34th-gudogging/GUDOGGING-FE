import { View } from 'react-native';

import { QueryState } from '@/components/common/QueryState';
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
        <QueryState isError={isError} onRetry={refetch} />
      </View>
    );
  }
  return data.status === 'ended' ? (
    <EndedSubscriptionDetailScreen subscription={data} />
  ) : (
    <SubscriptionDetailScreen subscription={data} confirmCancel={confirmCancel} />
  );
};
