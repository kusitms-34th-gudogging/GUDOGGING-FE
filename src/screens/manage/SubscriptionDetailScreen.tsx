import { router } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';

import { MoreIcon } from '@/assets/icons';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Toggle } from '@/components/common/Toggle';
import { TopBar } from '@/components/common/TopBar';
import { DetailCostCard } from '@/components/manage/DetailCostCard';
import { MoreMenu } from '@/components/manage/MoreMenu';
import { PAID_AT, type PaidAt } from '@/constants/services';
import { formatCycle, formatWon } from '@/utils/formatPayment';
import { type HomeSubscription, monthly } from '@/utils/homeSummary';

export interface SubscriptionDetail extends HomeSubscription {
  category: string;
  paidAt: PaidAt;
  startedAt: Date;
  // 꾸준히 쓰는 구독: 점검 알림 없이 유지
  steady: boolean;
  lastCheckup?: {
    period: string;
    result: string;
    usage: string;
    satisfaction: string;
    plan: string;
  };
}

const LOGO = require('@/assets/images/logo_placeholder.png');
// shortcut: 구독 상세 API 없이 샘플, 연동 시 라우트 id로 조회하는 API 훅으로 교체
// 점검 화면이 점검 샘플에서 서비스를 찾으므로 같은 id를 씀
const SAMPLE: SubscriptionDetail = {
  id: 'netflix',
  name: 'Netflix',
  amount: 13500,
  cycle: 1,
  unit: '개월',
  nextDate: new Date(2026, 9, 17),
  category: '영상 · OTT',
  paidAt: 'appstore',
  startedAt: new Date(2026, 6, 17),
  steady: false,
  lastCheckup: {
    period: '3월~6월 결과',
    result: '유지 추천(92%)',
    usage: '한 달 6~10편 봤어요',
    satisfaction: '보고 싶은 작품이 계속 생겨요',
    plan: '꼭 볼 작품이 있어요',
  },
};

const monthDay = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`;
const fullDate = (d: Date) => `${d.getFullYear()}년 ${monthDay(d)}`;

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View className="min-w-[280px] flex-row items-center gap-inset-xs py-inline-xs">
    <Text numberOfLines={1} className="flex-1 text-text-primary text-body3-semibold">
      {label}
    </Text>
    <Text numberOfLines={1} className="text-text-secondary text-body3-semibold">
      {value}
    </Text>
  </View>
);

const Divider = () => <View className="h-px bg-border-subtle" />;

interface SubscriptionDetailScreenProps {
  subscription?: SubscriptionDetail;
}

// M-03 구독 상세 (구독 중)
export const SubscriptionDetailScreen = ({
  subscription: s = SAMPLE,
}: SubscriptionDetailScreenProps) => {
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
          <View className="flex-row items-center gap-inline-xs">
            <View className="flex-row items-center gap-inline-sm">
              <View className="size-logo-card overflow-hidden rounded-full border-default border-border-subtle">
                <Image source={LOGO} className="size-full" />
              </View>
              <Text numberOfLines={1} className="shrink text-text-primary text-body2-semibold">
                {s.name}
              </Text>
            </View>
            <Badge variant="tonal" label="구독 중" />
            <Badge variant="tonal" label={s.category} />
          </View>
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
              {s.nextDate && <InfoRow label="다음 결제일" value={monthDay(s.nextDate)} />}
              <InfoRow label="결제 주기" value={formatCycle(s.cycle, s.unit)} />
              <InfoRow
                label="결제한 곳"
                value={PAID_AT.find((p) => p.value === s.paidAt)?.label ?? ''}
              />
              <InfoRow label="구독 시작일" value={fullDate(s.startedAt)} />
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
                  <InfoRow label="점검 결과" value={s.lastCheckup.result} />
                  <InfoRow label="이용도" value={s.lastCheckup.usage} />
                  <InfoRow label="만족도" value={s.lastCheckup.satisfaction} />
                  <InfoRow label="다음 달" value={s.lastCheckup.plan} />
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
      <View className="flex-row gap-inline-sm px-screen-x pb-stack-lg pt-stack-md">
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
