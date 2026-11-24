import { router } from 'expo-router';
import { useEffect } from 'react';
import { AppState, ScrollView, View } from 'react-native';

import { CalendarColorAsset, EditColorAsset } from '@/assets/graphics';
import { BellDotIcon, BellIcon } from '@/assets/icons';
import { Badge } from '@/components/common/Badge';
import { FloatingButton } from '@/components/common/FloatingButton';
import { ListItem } from '@/components/common/ListItem';
import { QueryState } from '@/components/common/QueryState';
import { Text } from '@/components/common/Text';
import { ToastOutlet } from '@/components/common/ToastProvider';
import { TopBar } from '@/components/common/TopBar';
import { CostCard } from '@/components/home/CostCard';
import { HomeEmptyState } from '@/components/home/HomeEmptyState';
import { SectionHeader } from '@/components/home/SectionHeader';
import { ServiceCard } from '@/components/home/ServiceCard';
import { StateCard } from '@/components/home/StateCard';
import { serviceLogo } from '@/constants/services';
import { useHome } from '@/hooks/useHome';
import { useRegisterPushToken } from '@/hooks/useRegisterPushToken';
import { useUpdateNotificationSettings } from '@/hooks/useUpdateNotificationSettings';
import { notificationPermissionChange } from '@/lib/notifications';
import { cn } from '@/utils/cn';
import { parseDate } from '@/utils/date';
import { formatWon } from '@/utils/formatPayment';

const dateLabel = (date: string) => {
  const d = parseDate(date);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 결제`;
};

// H-01 홈 (등록된 구독 없음) · H-02 홈 (구독 있음) · H-03 홈 (점검 유도)
export const HomeScreen = () => {
  const { data, isError, refetch } = useHome();
  const registerPushToken = useRegisterPushToken().mutate;
  const saveSettings = useUpdateNotificationSettings().mutate;
  const today = new Date();

  // 홈에 올 때마다 푸시 토큰 등록·갱신 (권한 없으면 훅이 건너뜀). 실패해도 화면엔 영향 없음
  // 기기 설정에서 알림 권한을 바꾸고 돌아오면 점검 알림도 맞춤 (허용 → ON, 거부 → OFF)
  useEffect(() => {
    const sync = async () => {
      registerPushToken();
      const granted = await notificationPermissionChange();
      if (granted !== null) saveSettings({ paymentReminderEnabled: granted });
    };
    void sync();
    // 설정 앱에서 알림을 허용하고 돌아와도 등록 (홈은 탭이라 계속 마운트돼 있어 위 호출이 다시 안 돎)
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void sync();
    });
    return () => sub.remove();
  }, [registerPushToken, saveSettings]);

  if (!data) {
    return (
      <View className="pt-safe flex-1 bg-bg-default">
        <QueryState isError={isError} onRetry={refetch} />
        <ToastOutlet placement="aboveTabBar" />
      </View>
    );
  }

  const { summary, upcomingPayments, usage } = data;
  const isEmpty = summary.subscriptionCount === 0;

  return (
    <View
      testID="home-screen"
      className={cn('pt-safe flex-1 bg-bg-default', !isEmpty && 'pb-safe')}
    >
      <TopBar
        variant="main"
        title="홈"
        showBack={false}
        showAction2={false}
        action1={{
          icon: data.hasUnreadNotification ? BellDotIcon : BellIcon,
          accessibilityLabel: '알림',
          onPress: () => router.push('/notification'),
        }}
      />
      {/* 캘린더·구독 관리처럼 스크롤 영역을 떠 있는 탭바(52 + 아래 4) + 간격 12 위에서 끝냄 (아래 끝 내용은 잘려 보여도 됨)
          맨 아래 여백은 없음 (+ 버튼이 마지막 행 금액을 가려도 됨). 빈 상태는 화면 높이만큼 채우고 안에서 탭바만큼 뺌 */}
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        className={cn(!isEmpty && 'mb-[68px]')}
        contentContainerClassName={cn('gap-inset-lg pt-stack-md', isEmpty && 'grow')}
      >
        <View className="gap-inline-sm px-screen-x">
          <Text accessibilityRole="header" className="px-s2 text-text-primary text-body1-bold">
            내 구독 정보
          </Text>
          {/* 카드를 틀로 감쌈: flex-1을 카드에 바로 주면 패딩이 큰 CostCard(20)가 ServiceCard(16)보다 넓어짐 */}
          <View className="flex-row gap-[15px]">
            <View className="flex-1">
              <CostCard
                label={`${today.getMonth() + 1}월 결제 예정`}
                amount={formatWon(summary.expectedAmount)}
                yearAmount={`연 ${formatWon(summary.yearlyAmount)}`}
              />
            </View>
            <View className="flex-1">
              <ServiceCard
                label={`${summary.subscriptionCount}개 구독 중이에요`}
                // 구독이 있으면 개수만큼(최대 10) 둥둥. 서버 logos엔 로고 없는 구독(직접 입력 등)이 빠져 있어 그 자리는 기본 이미지
                logos={Array.from(
                  {
                    length: Math.min(Math.max(summary.subscriptionCount, summary.logos.length), 10),
                  },
                  (_, i) => ({
                    id: `${i}-${summary.logos[i] ?? ''}`,
                    logo: serviceLogo(summary.logos[i]),
                  }),
                )}
              />
            </View>
          </View>
        </View>
        {isEmpty ? (
          <HomeEmptyState onRegister={() => router.push('/register?from=home')} />
        ) : (
          <View className="gap-screen-x">
            <View className="gap-stack-md px-screen-x">
              <SectionHeader
                title="구독 점검하기"
                showChevron
                onPress={() => router.navigate('/calendar')}
              />
              {/* 이번 결제 주기에 아직 점검 안 한 구독만 서버가 내려 줌 (HOM-001). 다 점검했으면 완료 카드 (H-03.1) */}
              {upcomingPayments.length === 0 ? (
                <StateCard
                  title={'구독 점검 완료!\n이번 달 결제 일정을 확인해요'}
                  buttonLabel="캘린더 확인하기"
                  Asset={CalendarColorAsset}
                  // Figma H-03.1: 오른쪽에서 4 안쪽
                  assetRightClassName="right-[4px]"
                  onPress={() => router.navigate('/calendar')}
                />
              ) : (
                <View className="gap-stack-sm">
                  {upcomingPayments.map((s) => (
                    <ListItem
                      key={s.subscriptionId}
                      title={s.serviceName}
                      subtitle={`${dateLabel(s.nextBillingDate)} · D-${s.dDay}`}
                      showSubtitle
                      logo={serviceLogo(s.logoUrl ?? undefined)}
                      showLogo
                      cost={formatWon(s.amount)}
                      showCost
                      // 행 전체가 터치 영역 → 그 구독 점검 1/4. 이번 주기 점검을 마쳤으면 누를 수 없음 (명세 needsCheckup)
                      iconRightAction={
                        s.needsCheckup
                          ? {
                              accessibilityLabel: `${s.serviceName} 점검하기`,
                              onPress: () =>
                                router.push(`/checkup/${s.subscriptionId}?restart=1&from=home`),
                            }
                          : undefined
                      }
                    />
                  ))}
                </View>
              )}
            </View>
            {/* 구분선 0.5는 토큰 없음 (border 최소 1) */}
            <View className="h-[0.5px] bg-bg-muted" />
            <View className="gap-stack-md px-screen-x">
              {/* 잘 안 쓰는 구독이 없으면(점검 기록이 없거나 다 잘 쓰는 중) 점검 유도 카드 (H-03) */}
              {usage.items.length > 0 ? (
                <>
                  <View className="flex-row items-center justify-between">
                    <SectionHeader
                      title="잘 안 쓰는 구독"
                      showChevron
                      onPress={() => router.navigate('/manage')}
                    />
                    <Badge variant="tonal" label={`월 ${formatWon(usage.monthlyAmount)} 결제`} />
                  </View>
                  <View className="gap-stack-sm">
                    {usage.items.map((s) => (
                      <ListItem
                        key={s.subscriptionId}
                        title={s.serviceName}
                        // 화면설계서 구간: 40% 미만 해지 추천, 40–59% 해지 고려 (API 명세의 'n% 유지 추천'보다 우선)
                        subtitle={`${s.scorePercent}% ${s.scorePercent < 40 ? '해지 추천' : '해지 고려'}`}
                        showSubtitle
                        logo={serviceLogo(s.logoUrl ?? undefined)}
                        showLogo
                        cost={formatWon(s.amount)}
                        showCost
                        // 행 전체가 터치 영역 → 구독 상세 (M-03)
                        iconRightAction={{
                          accessibilityLabel: `${s.serviceName} 상세`,
                          onPress: () => router.push(`/manage/detail/${s.subscriptionId}`),
                        }}
                      />
                    ))}
                  </View>
                </>
              ) : (
                <>
                  {/* 보여 줄 구독이 없어 제목만 (Figma H-03, 화살표 없음) */}
                  <SectionHeader title="잘 안 쓰는 구독" />
                  <StateCard
                    title={'결제 전 30초 질문,\n잘 쓰는 구독을 가려 드려요'}
                    buttonLabel="점검하러 가기"
                    Asset={EditColorAsset}
                    // Figma H-03: 오른쪽으로 2 넘침
                    assetRightClassName="-right-[2px]"
                    buttonTestID="home-checkup"
                    onPress={() =>
                      usage.nudgeSubscriptionId &&
                      router.push(`/checkup/${usage.nudgeSubscriptionId}?restart=1&from=home`)
                    }
                  />
                </>
              )}
            </View>
          </View>
        )}
      </ScrollView>
      {/* 탭바(하단 안전 영역 + 4 + 52) 위 18. 구독이 없으면 빈 상태 버튼이 대신해서 없음 */}
      {!isEmpty && (
        <View
          pointerEvents="box-none"
          className="pb-safe absolute inset-x-0 bottom-0 items-end px-screen-x"
        >
          <FloatingButton
            testID="home-add"
            accessibilityLabel="구독 추가"
            onPress={() => router.push('/register?from=home')}
            className="mb-[74px]"
          />
        </View>
      )}
      {/* 상세에서 삭제(S-2) 후 돌아오면 토스트. 탭바 위 12, 구독 관리와 같음. + 버튼과 겹치면 토스트가 위 */}
      <ToastOutlet placement="aboveTabBar" />
    </View>
  );
};
