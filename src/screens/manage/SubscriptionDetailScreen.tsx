import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { MoreIcon } from '@/assets/icons';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { DetailCostCard } from '@/components/common/DetailCostCard';
import { Divider, ServiceHeader } from '@/components/common/DetailParts';
import { ListItem } from '@/components/common/ListItem';
import { MoreMenu } from '@/components/common/MoreMenu';
import { Toggle } from '@/components/common/Toggle';
import { TopBar } from '@/components/common/TopBar';
import type { ActiveSubscriptionDetail } from '@/constants/manage';
import { PAID_AT } from '@/constants/services';
import { formatCycle, formatWon } from '@/utils/formatPayment';
import { monthly } from '@/utils/homeSummary';

const monthDay = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`;
const fullDate = (d: Date) => `${d.getFullYear()}년 ${monthDay(d)}`;

interface SubscriptionDetailScreenProps {
  subscription: ActiveSubscriptionDetail;
}

// M-03 구독 상세 (구독 중)
export const SubscriptionDetailScreen = ({ subscription: s }: SubscriptionDetailScreenProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  // shortcut: 화면 안에서만 바뀜, 구독 수정 API 연동 시 저장
  const [steady, setSteady] = useState(s.steady);

  return (
    <View className="pt-safe pb-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title="구독 상세"
        onBack={() => router.back()}
        showAction2={false}
        action1={{ icon: MoreIcon, accessibilityLabel: '더보기', onPress: () => setMenuOpen(true) }}
      />
      {/* shortcut: 구독 편집 화면이 아직 없어 이동 없음 */}
      <MoreMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        options={[{ label: '편집', onSelect: () => {} }]}
      />
      <ScrollView contentContainerClassName="gap-s20 pb-stack-md pt-stack-md">
        <View className="gap-stack-md px-screen-x">
          <ServiceHeader
            name={s.name}
            status="구독 중"
            category={s.category}
            badgeVariant="tonal"
          />
          <DetailCostCard
            label="결제 예정"
            amount={formatWon(s.amount)}
            subText={`연 환산 ${formatWon(monthly(s) * 12)}`}
          />
        </View>
        <View className="gap-stack-md">
          <View className="flex-row items-center justify-between gap-inline-sm px-screen-x">
            <View className="shrink">
              <Text className="text-text-primary text-body2-bold">꾸준히 쓰는 구독</Text>
              <Text className="text-text-secondary text-caption2-regular">
                점검 알림 없이 그대로 유지해요
              </Text>
            </View>
            <Toggle
              value={steady}
              onValueChange={setSteady}
              accessibilityLabel="꾸준히 쓰는 구독"
            />
          </View>
          <Divider />
          <View className="gap-stack-sm px-screen-x">
            <Text accessibilityRole="header" className="text-text-primary text-body1-semibold">
              결제
            </Text>
            <View>
              {s.nextDate && (
                <ListItem
                  title="다음 결제일"
                  cost={monthDay(s.nextDate)}
                  showCost
                  costColor="text-text-secondary"
                  costFullWidth
                />
              )}
              <ListItem
                title="결제 주기"
                cost={formatCycle(s.cycle, s.unit)}
                showCost
                costColor="text-text-secondary"
                costFullWidth
              />
              <ListItem
                title="결제한 곳"
                cost={PAID_AT.find((p) => p.value === s.paidAt)?.label ?? ''}
                showCost
                costColor="text-text-secondary"
                costFullWidth
              />
              <ListItem
                title="구독 시작일"
                cost={fullDate(s.startedAt)}
                showCost
                costColor="text-text-secondary"
                costFullWidth
              />
            </View>
          </View>
          {s.lastCheckup && (
            <>
              <Divider />
              <View className="gap-inline-sm px-screen-x">
                <View className="flex-row items-center gap-stack-xs">
                  <Text
                    accessibilityRole="header"
                    className="text-text-primary text-body1-semibold"
                  >
                    지난 점검
                  </Text>
                  <Badge variant="tonal" label={s.lastCheckup.period} />
                </View>
                <View className="gap-s2">
                  <ListItem
                    title="점검 결과"
                    cost={s.lastCheckup.result}
                    showCost
                    costColor="text-text-secondary"
                    costFullWidth
                  />
                  <ListItem
                    title="이용도"
                    cost={s.lastCheckup.usage}
                    showCost
                    costColor="text-text-secondary"
                    costFullWidth
                  />
                  <ListItem
                    title="만족도"
                    cost={s.lastCheckup.satisfaction}
                    showCost
                    costColor="text-text-secondary"
                    costFullWidth
                  />
                  <ListItem
                    title="다음 달"
                    cost={s.lastCheckup.plan}
                    showCost
                    costColor="text-text-secondary"
                    costFullWidth
                  />
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
      <View className="flex-row gap-inline-sm px-screen-x pb-[14px] pt-stack-md">
        <Button
          variant="tonal"
          label="해지하기"
          onPress={() => router.push(`/checkup/${s.id}/cancel`)}
          className="flex-1"
        />
        <Button
          label="구독 점검"
          onPress={() => router.push(`/checkup/${s.id}?restart=1`)}
          className="flex-1"
        />
      </View>
    </View>
  );
};
