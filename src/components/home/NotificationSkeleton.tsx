import { View } from 'react-native';

import { Skeleton } from '@/components/common/Skeleton';

const ROWS = 8;

// NotificationItem 자리: 로고 + 제목·시간 줄 + 설명 2줄. 패딩은 NotificationItem과 같게
const ItemSkeleton = () => (
  <View className="flex-row items-start gap-inline-md px-screen-x py-inset-sm">
    <Skeleton className="size-logo-card rounded-full" />
    <View className="flex-1 gap-inset-2xs">
      <View className="flex-row items-center justify-between gap-inline-sm">
        <Skeleton className="h-[16px] w-[120px] rounded-md" />
        <Skeleton className="h-[12px] w-[36px] rounded-md" />
      </View>
      <Skeleton className="h-[14px] w-full rounded-md" />
      <Skeleton className="h-[14px] w-[60%] rounded-md" />
    </View>
  </View>
);

// 알림 목록 로딩: 섹션 제목 + 알림 줄. 간격은 HomeNotificationScreen과 같게
export const NotificationSkeleton = () => (
  <View accessible accessibilityLabel="불러오는 중" className="gap-inset-xs pt-stack-md">
    <View className="px-screen-x">
      <Skeleton className="ml-s2 h-[20px] w-[48px] rounded-md" />
    </View>
    <View>
      {Array.from({ length: ROWS }, (_, i) => (
        <ItemSkeleton key={i} />
      ))}
    </View>
  </View>
);
