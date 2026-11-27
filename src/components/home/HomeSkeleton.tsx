import { View } from 'react-native';

import { ListItemSkeleton } from '@/components/common/ListItemSkeleton';
import { Skeleton } from '@/components/common/Skeleton';

// 홈 로딩: 실제 홈(H-02)과 같은 자리에 회색 박스. 디자인 없음, 간격은 HomeScreen과 같게
export const HomeSkeleton = () => (
  <View accessible accessibilityLabel="불러오는 중" className="gap-inset-lg pt-stack-md">
    <View className="gap-inline-sm px-screen-x">
      <Skeleton className="mx-s2 h-[22px] w-[96px] rounded-md" />
      <View className="flex-row gap-[15px]">
        <Skeleton className="aspect-square flex-1 rounded-[32px]" />
        <Skeleton className="aspect-square flex-1 rounded-[32px]" />
      </View>
    </View>
    <View className="gap-screen-x">
      {/* 구독 점검하기 */}
      <View className="gap-stack-md px-screen-x">
        <Skeleton className="h-[22px] w-[112px] rounded-md" />
        <ListItemSkeleton count={3} />
      </View>
      <View className="h-[0.5px] bg-bg-muted" />
      {/* 잘 안 쓰는 구독: 제목 + 오른쪽 금액 배지 */}
      <View className="gap-stack-md px-screen-x">
        <View className="flex-row items-center justify-between">
          <Skeleton className="h-[22px] w-[112px] rounded-md" />
          <Skeleton className="h-[24px] w-[88px] rounded-full" />
        </View>
        <ListItemSkeleton count={2} />
      </View>
    </View>
  </View>
);
