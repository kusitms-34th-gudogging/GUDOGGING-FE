import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { CalendarColorAsset, EditColorAsset } from '@/assets/graphics';
import { BellDotIcon, BellIcon } from '@/assets/icons';
import { Badge } from '@/components/common/Badge';
import { FloatingButton } from '@/components/common/FloatingButton';
import { ListItem } from '@/components/common/ListItem';
import { QueryState } from '@/components/common/QueryState';
import { Text } from '@/components/common/Text';
import { TopBar } from '@/components/common/TopBar';
import { CostCard } from '@/components/home/CostCard';
import { HomeEmptyState } from '@/components/home/HomeEmptyState';
import { SectionHeader } from '@/components/home/SectionHeader';
import { ServiceCard } from '@/components/home/ServiceCard';
import { StateCard } from '@/components/home/StateCard';
import { useHome } from '@/hooks/useHome';
import { cn } from '@/utils/cn';
import { parseDate } from '@/utils/date';
import { formatWon } from '@/utils/formatPayment';

// shortcut: 목서버 로고 URL이 실제 이미지가 아니라 placeholder, 실제 로고 URL이 오면 { uri: logoUrl }로
const LOGO = require('@/assets/images/logo_placeholder.png');

const dateLabel = (date: string) => {
  const d = parseDate(date);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 결제`;
};

// H-01 홈 (등록된 구독 없음) · H-02 홈 (구독 있음) · H-03 홈 (점검 유도)
export const HomeScreen = () => {
  const { data, isError, refetch } = useHome();
  const today = new Date();

  if (!data) {
    return (
      <View className="pt-safe flex-1 bg-bg-default">
        <QueryState isError={isError} onRetry={refetch} />
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
        className={cn(!isEmpty && 'mb-[68px]')}
        contentContainerClassName={cn('gap-inset-lg pt-stack-md', isEmpty && 'grow')}
      >
        <View className="gap-inline-sm px-screen-x">
          <Text accessibilityRole="header" className="px-s2 text-text-primary text-body1-bold">
            내 구독 정보
          </Text>
          <View className="flex-row gap-[15px]">
            <CostCard
              label={`${today.getMonth() + 1}월 결제 예정`}
              amount={formatWon(summary.expectedAmount)}
              yearAmount={`연 ${formatWon(summary.yearlyAmount)}`}
              className="flex-1"
            />
            <ServiceCard
              label={`${summary.subscriptionCount}개 구독 중이에요`}
              logos={summary.logos.map((url, i) => ({ id: `${i}-${url}`, logo: LOGO }))}
              className="flex-1"
            />
          </View>
        </View>
        {isEmpty ? (
          <HomeEmptyState onRegister={() => router.push('/register')} />
        ) : (
          <View className="gap-stack-md">
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
                      logo={LOGO}
                      showLogo
                      cost={formatWon(s.amount)}
                      showCost
                      // 행 전체가 터치 영역 → 그 구독 점검 1/4. 이번 주기 점검을 마쳤으면 누를 수 없음 (명세 needsCheckup)
                      iconRightAction={
                        s.needsCheckup
                          ? {
                              accessibilityLabel: `${s.serviceName} 점검하기`,
                              onPress: () => router.push(`/checkup/${s.subscriptionId}?restart=1`),
                            }
                          : undefined
                      }
                    />
                  ))}
                </View>
              )}
            </View>
            <View className="h-[2px] bg-bg-subtle" />
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
                        logo={LOGO}
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
                  <SectionHeader
                    title="잘 안 쓰는 구독"
                    showChevron
                    onPress={() => router.navigate('/manage')}
                  />
                  <StateCard
                    title={'결제 전 30초 질문,\n잘 쓰는 구독을 가려 드려요'}
                    buttonLabel="점검하러 가기"
                    Asset={EditColorAsset}
                    buttonTestID="home-checkup"
                    onPress={() =>
                      usage.nudgeSubscriptionId &&
                      router.push(`/checkup/${usage.nudgeSubscriptionId}?restart=1`)
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
            onPress={() => router.push('/register')}
            className="mb-[74px]"
          />
        </View>
      )}
    </View>
  );
};
