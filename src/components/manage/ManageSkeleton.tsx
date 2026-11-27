import { View } from 'react-native';

import { ListItemSkeleton } from '@/components/common/ListItemSkeleton';
import { Skeleton } from '@/components/common/Skeleton';

const LIST_ROWS = 8;

// 금액·정렬 줄 자리 (ManageScreen과 같이 pl-s2)
export const ManageSummarySkeleton = () => (
  <View className="flex-row items-center justify-between pl-s2">
    <Skeleton className="h-[20px] w-[96px] rounded-md" />
    <Skeleton className="h-[16px] w-[64px] rounded-md" />
  </View>
);

// 목록 자리. 탭을 바꿔 새 목록을 기다릴 때도 금액 줄과 같이 씀 (탭은 그대로 보임)
export const ManageListSkeleton = () => (
  <View accessible accessibilityLabel="불러오는 중" className="mt-stack-md px-screen-x">
    <ListItemSkeleton count={LIST_ROWS} />
  </View>
);

// 구독 관리 첫 로딩: 탭(SegmentedControl 164 × 36 + 위아래 4) + 금액 줄 + 목록. 간격은 ManageScreen과 같게
export const ManageSkeleton = () => (
  <View>
    <View className="gap-inset-lg px-screen-x pt-stack-md">
      <Skeleton className="h-[44px] w-[164px] rounded-lg" />
      <ManageSummarySkeleton />
    </View>
    <ManageListSkeleton />
  </View>
);
