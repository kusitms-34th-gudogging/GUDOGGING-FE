import { View } from 'react-native';

import { Skeleton } from '@/components/common/Skeleton';

const INFO_ROWS = 4;

interface DetailSkeletonProps {
  /** 구독 상세(M-03)의 '꾸준히 쓰는 구독' 토글 줄 + 구분선. 상태를 모르는 로딩 중엔 구독 중으로 봄 */
  showToggle?: boolean;
}

// 구독 상세(M-03·M-05)·캘린더 결제 상세(C-03) 로딩: 서비스 헤더 + 금액 카드 + 결제 정보. 간격은 두 상세 화면과 같게
// 최근 점검은 기록이 있을 때만 나와서 그리지 않음
export const DetailSkeleton = ({ showToggle }: DetailSkeletonProps) => (
  <View accessible accessibilityLabel="불러오는 중" className="gap-s20 pt-stack-md">
    <View className="gap-stack-md px-screen-x">
      {/* ServiceHeader: 로고 + 이름 + 상태·카테고리 배지 */}
      <View className="flex-row items-center gap-inline-sm">
        <Skeleton className="size-logo-card rounded-full" />
        <Skeleton className="h-[20px] w-[96px] rounded-md" />
        <Skeleton className="h-[24px] w-[56px] rounded-full" />
      </View>
      {/* DetailCostCard */}
      <Skeleton className="h-[105px] rounded-sheet" />
    </View>
    <View className="gap-screen-x">
      {showToggle && (
        <>
          {/* 제목·설명 + 오른쪽 토글 */}
          <View className="flex-row items-center justify-between px-screen-x">
            <View className="gap-[6px]">
              <Skeleton className="h-[18px] w-[104px] rounded-md" />
              <Skeleton className="h-[12px] w-[180px] rounded-md" />
            </View>
            <Skeleton className="h-[31px] w-[51px] rounded-full" />
          </View>
          <View className="h-[0.6px] bg-border-subtle" />
        </>
      )}
      {/* 결제 정보: 제목 + 항목 이름·값 줄 */}
      <View className="gap-stack-sm px-screen-x">
        <Skeleton className="h-[22px] w-[48px] rounded-md" />
        <View className="gap-[20px] py-inline-xs">
          {Array.from({ length: INFO_ROWS }, (_, i) => (
            <View key={i} className="flex-row items-center justify-between">
              <Skeleton className="h-[16px] w-[72px] rounded-md" />
              <Skeleton className="h-[16px] w-[112px] rounded-md" />
            </View>
          ))}
        </View>
      </View>
    </View>
  </View>
);
