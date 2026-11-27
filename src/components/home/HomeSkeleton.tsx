import { View } from 'react-native';

import { Skeleton } from '@/components/common/Skeleton';

// ListItem(로고·제목·부제목·금액) 한 줄 자리
const RowSkeleton = () => (
  <View className="flex-row items-center gap-inline-md py-inline-xs">
    <Skeleton className="size-logo-card rounded-full" />
    <View className="flex-1 gap-[6px]">
      <Skeleton className="h-[16px] w-[96px] rounded-md" />
      <Skeleton className="h-[14px] w-[140px] rounded-md" />
    </View>
    <Skeleton className="h-[16px] w-[64px] rounded-md" />
  </View>
);

const Rows = ({ count }: { count: number }) => (
  <View className="gap-stack-sm">
    {Array.from({ length: count }, (_, i) => (
      <RowSkeleton key={i} />
    ))}
  </View>
);

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
        <Rows count={3} />
      </View>
      <View className="h-[0.5px] bg-bg-muted" />
      {/* 잘 안 쓰는 구독: 제목 + 오른쪽 금액 배지 */}
      <View className="gap-stack-md px-screen-x">
        <View className="flex-row items-center justify-between">
          <Skeleton className="h-[22px] w-[112px] rounded-md" />
          <Skeleton className="h-[24px] w-[88px] rounded-full" />
        </View>
        <Rows count={2} />
      </View>
    </View>
  </View>
);
