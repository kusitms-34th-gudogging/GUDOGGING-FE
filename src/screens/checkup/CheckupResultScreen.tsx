import { router } from 'expo-router';
import { View } from 'react-native';

import { Button } from '@/components/common/Button';
import { TopBar } from '@/components/common/TopBar';
import type { CheckupSubscription } from '@/constants/checkup';

interface CheckupResultScreenProps {
  subscription: CheckupSubscription;
}

// K-80 점검 결과
// ponytail: 상세 디자인 확정 전이라 상단 바·하단 버튼만. 결과 카드·카테고리 지출·추천 상품은 디자인 확정 후
export const CheckupResultScreen = (_props: CheckupResultScreenProps) => (
  <View className="pt-safe flex-1 bg-bg-default">
    <TopBar
      variant="detail"
      title="점검 결과"
      onBack={() => router.back()}
      showAction1={false}
      showAction2={false}
    />
    <View className="flex-1" />
    <View className="pb-safe px-screen-x">
      <View className="mb-[14px] flex-row gap-inline-sm">
        {/* ponytail: 해지 이유(K-90) 화면이 생기면 거기로 이동 */}
        <Button variant="tonal" label="해지하기" onPress={() => {}} className="flex-1" />
        {/* ponytail: 유지 결정 저장·다음 결제 D-1 재확인 알림 등록은 API 연동 시 */}
        <Button label="유지하기" onPress={() => router.dismissTo('/')} className="flex-1" />
      </View>
    </View>
  </View>
);
