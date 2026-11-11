import { router } from 'expo-router';
import { Image, ScrollView, Text, View } from 'react-native';

import { RecommendCard } from '@/components/checkup/RecommendCard';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ListItem } from '@/components/common/ListItem';
import { TopBar } from '@/components/common/TopBar';
import type { CheckupRecommendation, CheckupSubscription } from '@/constants/checkup';
import { categorySpending } from '@/utils/checkupResult';
import { formatWon } from '@/utils/formatPayment';
import type { HomeSubscription } from '@/utils/homeSummary';

const LOGO = require('@/assets/images/logo_placeholder.png');

interface CheckupResultScreenProps {
  subscription: CheckupSubscription;
  /** 같은 카테고리에서 구독 중인 서비스 (점검 중인 구독 포함) */
  categorySubscriptions: HomeSubscription[];
  /** 같은 서비스를 더 싸게 쓰는 상품. 없으면 영역 숨김 */
  recommendations: CheckupRecommendation[];
}

// K-80 점검 결과
export const CheckupResultScreen = ({
  subscription,
  categorySubscriptions,
  recommendations,
}: CheckupResultScreenProps) => {
  const name = subscription.nameKo ?? subscription.name;
  const { nextDate } = subscription;
  const spending = categorySpending(subscription.id, categorySubscriptions);

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title="점검 결과"
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
      />
      <ScrollView className="flex-1" contentContainerClassName="px-screen-x pb-section pt-stack-md">
        <View className="flex-row items-center gap-inline-sm">
          <View className="size-logo-card overflow-hidden rounded-full border-default border-border-subtle">
            <Image source={LOGO} className="size-full" />
          </View>
          <View className="flex-1">
            <Text className="text-text-primary text-body1-bold">{name} 점검 완료</Text>
            <Text className="text-text-primary text-caption1-regular">
              {`${nextDate.getMonth() + 1}월 ${nextDate.getDate()}일 결제 전에 확인했어요`}
            </Text>
          </View>
        </View>

        {/* ponytail: 활용도 숨 블러(점수·구간 색·유형명) 자리만 잡아 둠. 점수 계산·인터랙션 확정 후 채움 */}
        <View className="mt-s24 h-[236px]" />

        <View className="mt-s40 gap-section">
          <View className="gap-stack-md">
            <View className="flex-row items-center gap-stack-xs">
              <Text className="px-s2 text-text-primary text-body1-semibold">
                {subscription.category ?? '기타'} 구독
              </Text>
              <Badge variant="tonal" label={`매달 ${formatWon(spending.total)} 지출`} />
            </View>
            <View className="gap-stack-xs">
              {spending.items.map((s) => {
                const current = s.id === subscription.id;
                return (
                  <ListItem
                    key={s.id}
                    title={current ? name : s.name}
                    subtitle="현재 점검 중"
                    showSubtitle={current}
                    cost={formatWon(s.monthly)}
                    showCost
                    logo={LOGO}
                    showLogo
                  />
                );
              })}
              {spending.rest > 0 && (
                <Text className="px-s2 text-text-secondary text-caption1-regular">
                  그 외 {spending.rest}개
                </Text>
              )}
            </View>
          </View>

          {recommendations.length > 0 && (
            <View className="gap-stack-md">
              <View className="flex-row items-center justify-between">
                <Text className="px-s2 text-text-primary text-body1-semibold">
                  같은 {name}, 더 싸게
                </Text>
                <Text className="px-inset-2xs text-text-secondary text-caption2-regular">
                  추천 {recommendations.length}개
                </Text>
              </View>
              {/* 화면 끝까지 스크롤되게 좌우 여백을 상쇄하고 안쪽에서 다시 줌 */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-screen-x"
                contentContainerClassName="gap-stack-sm px-screen-x"
              >
                {recommendations.map((r) => (
                  <RecommendCard key={r.id} recommendation={r} />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="pb-safe px-screen-x">
        <View className="mb-[14px] flex-row gap-inline-sm">
          <Button
            variant="tonal"
            label="해지하기"
            onPress={() => router.push(`/checkup/${subscription.id}/cancel`)}
            className="flex-1"
          />
          {/* ponytail: 유지 결정 저장·다음 결제 D-1 재확인 알림 등록은 API 연동 시 */}
          <Button label="유지하기" onPress={() => router.dismissTo('/')} className="flex-1" />
        </View>
      </View>
    </View>
  );
};
