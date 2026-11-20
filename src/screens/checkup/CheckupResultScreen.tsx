import { router } from 'expo-router';
import { Image, ScrollView, View } from 'react-native';

import { RecommendCard } from '@/components/checkup/RecommendCard';
import { UsageBreath } from '@/components/checkup/UsageBreath';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ListItem } from '@/components/common/ListItem';
import { QueryState } from '@/components/common/QueryState';
import { Text } from '@/components/common/Text';
import { TopBar } from '@/components/common/TopBar';
import { useCheckupResult } from '@/hooks/useCheckups';
import { useDecideCheckup } from '@/hooks/useDecideCheckup';
import { formatWon } from '@/utils/formatPayment';

const LOGO = require('@/assets/images/logo_placeholder.png');

interface CheckupResultScreenProps {
  checkupId: string;
}

// K-80 점검 결과
export const CheckupResultScreen = ({ checkupId }: CheckupResultScreenProps) => {
  const { data, isError, refetch } = useCheckupResult(checkupId);
  const decide = useDecideCheckup(checkupId);

  if (!data) {
    return (
      <View className="pt-safe flex-1 bg-bg-default">
        <QueryState isError={isError} onRetry={refetch} />
      </View>
    );
  }

  // 활용도(%)·같은 카테고리 지출·더 싸게(번들 추천, 없으면 영역 숨김)는 서버가 계산
  const { subscription, usage, spending, recommendations } = data;
  const { name, nextDate } = subscription;

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title="점검 결과"
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
      />
      {/* 스크롤 내용이 아래 버튼에 바로 붙어 잘려 보이지 않게 버튼 위로 간격 */}
      <ScrollView
        bounces={false}
        className="mb-s12 flex-1"
        contentContainerClassName="px-screen-x pb-section pt-stack-md"
      >
        <UsageBreath usage={usage} name={name}>
          <View className="flex-row items-center gap-inline-sm">
            <View className="size-logo-card overflow-hidden rounded-full border-default border-border-subtle">
              <Image source={LOGO} className="size-full" />
            </View>
            <View className="flex-1">
              <Text className="text-text-primary text-body1-bold">{name} 점검 완료</Text>
              {nextDate && (
                <Text className="text-text-primary text-caption1-regular">
                  {`${nextDate.getMonth() + 1}월 ${nextDate.getDate()}일 결제 전에 확인했어요`}
                </Text>
              )}
            </View>
          </View>
        </UsageBreath>
        {/* shortcut: 블러 아래 유형명 + 안내 문구(본전 뽑는 중 등, 이용도·만족도 사분면 기준) 없음.
            점수 계산(백엔드 확인)이 정해지면 유형·보정 여부를 props로 받아 추가 */}

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
                const { current } = s;
                return (
                  <ListItem
                    key={s.name}
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
            testID="checkup-result-cancel"
            label="해지하기"
            onPress={() => router.push(`/checkup/${subscription.id}/cancel?checkupId=${checkupId}`)}
            className="flex-1"
          />
          {/* 유지 결정을 저장하면 홈 사용 현황에서 빠짐. D-1 알림은 서버가 모든 구독에 보냄 (명세)
              shortcut: 저장 실패 안내는 디자인에 없어 화면에 남음, 디자인 나오면 안내 추가 */}
          <Button
            label="유지하기"
            disabled={decide.isPending}
            onPress={() =>
              decide.mutate({ decision: 'KEEP' }, { onSuccess: () => router.dismissTo('/') })
            }
            className="flex-1"
          />
        </View>
      </View>
    </View>
  );
};
