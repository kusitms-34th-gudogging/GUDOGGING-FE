import { useLocalSearchParams } from 'expo-router';

import { MANAGE_SAMPLE } from '@/constants/manage';
import { FOUND_SAMPLE } from '@/constants/services';
import { RegisterServiceInputScreen } from '@/screens/register/RegisterServiceInputScreen';

export default function RegisterServiceInputRoute() {
  const { id, found, more, reregister } = useLocalSearchParams<{
    id?: string;
    found?: string;
    more?: string;
    reregister?: string;
  }>();
  // shortcut: 지난 구독을 샘플에서 찾음, 구독 상세 API 연동 시 훅으로 교체
  const prev = reregister ? MANAGE_SAMPLE.find((s) => s.id === reregister) : undefined;
  return (
    <RegisterServiceInputScreen
      serviceId={id}
      found={found ? FOUND_SAMPLE.find((f) => f.id === id) : undefined}
      more={!!more}
      // 다음 결제일은 새로 정해야 해서 채우지 않음 (오늘이 기본값)
      prefill={
        prev && {
          name: prev.name,
          category: prev.category,
          amount: prev.amount,
          cycle: prev.cycle,
          unit: prev.unit,
          paidAt: prev.paidAt,
        }
      }
    />
  );
}
