import { View } from 'react-native';

import { Skeleton } from '@/components/common/Skeleton';

interface ListItemSkeletonProps {
  count: number;
}

// ListItem(로고·제목·부제목·금액) 줄 자리 count개. 간격은 화면 리스트와 같은 gap-stack-sm
export const ListItemSkeleton = ({ count }: ListItemSkeletonProps) => (
  <View className="gap-stack-sm">
    {Array.from({ length: count }, (_, i) => (
      <View key={i} className="flex-row items-center gap-inline-md py-inline-xs">
        <Skeleton className="size-logo-card rounded-full" />
        <View className="flex-1 gap-[6px]">
          <Skeleton className="h-[16px] w-[96px] rounded-md" />
          <Skeleton className="h-[14px] w-[140px] rounded-md" />
        </View>
        <Skeleton className="h-[16px] w-[64px] rounded-md" />
      </View>
    ))}
  </View>
);
