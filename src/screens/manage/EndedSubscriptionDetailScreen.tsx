import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { MoreIcon } from '@/assets/icons';
import { Badge } from '@/components/common/Badge';
import { Cta } from '@/components/common/Cta';
import { ListItem } from '@/components/common/ListItem';
import { TextArea } from '@/components/common/TextArea';
import { TopBar } from '@/components/common/TopBar';
import { DetailCostCard } from '@/components/manage/DetailCostCard';
import { Divider, ServiceHeader } from '@/components/manage/DetailParts';
import { MoreMenu } from '@/components/manage/MoreMenu';
import type { EndedSubscriptionDetail } from '@/constants/manage';
import { PAID_AT } from '@/constants/services';
import { formatCycle, formatWon } from '@/utils/formatPayment';

const pad = (n: number) => String(n).padStart(2, '0');
const dotDate = (d: Date) => `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
const monthDay = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`;
const fullDate = (d: Date) => `${d.getFullYear()}년 ${monthDay(d)}`;

interface EndedSubscriptionDetailScreenProps {
  subscription: EndedSubscriptionDetail;
}

// M-05 구독 상세 (지난 구독)
export const EndedSubscriptionDetailScreen = ({
  subscription: s,
}: EndedSubscriptionDetailScreenProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View className="pt-safe pb-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title="구독 상세"
        onBack={() => router.back()}
        showAction2={false}
        action1={{ icon: MoreIcon, accessibilityLabel: '더보기', onPress: () => setMenuOpen(true) }}
      />
      {/* shortcut: 지난 구독 더보기 메뉴는 디자인에 없어 구독 중(M-03)과 같은 '편집', 편집 화면이 없어 이동 없음 */}
      <MoreMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        options={[{ label: '편집', onSelect: () => {} }]}
      />
      <ScrollView contentContainerClassName="gap-s20 pb-stack-md pt-stack-md">
        <View className="gap-stack-md px-screen-x">
          <ServiceHeader
            name={s.name}
            status="구독 종료"
            category={s.category}
            badgeVariant="mono"
          />
          <DetailCostCard
            tone="mono"
            label="지금까지 쓴 금액"
            amount={formatWon(s.totalSpent)}
            subText={`${dotDate(s.startedAt)} ~ ${dotDate(s.cancelledAt)}`}
          />
        </View>
        <View className="gap-stack-md">
          <View className="gap-stack-sm px-screen-x">
            <Text accessibilityRole="header" className="text-text-primary text-body1-semibold">
              결제
            </Text>
            <View>
              <ListItem
                title="해지일"
                cost={fullDate(s.cancelledAt)}
                showCost
                costColor="text-text-secondary"
                costFullWidth
              />
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
                title="점검 알림"
                cost="중단됨"
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
                    마지막 점검
                  </Text>
                  <Badge
                    variant="mono"
                    label={`${monthDay(s.lastCheckup.checkedAt)} 점검 · 해지`}
                  />
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
                  {s.lastCheckup.cancelReason && (
                    <>
                      <Text className="py-inline-xs text-text-primary text-body3-semibold">
                        해지 이유
                      </Text>
                      <TextArea
                        value={s.lastCheckup.cancelReason}
                        editable={false}
                        accessibilityLabel="해지 이유"
                      />
                    </>
                  )}
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
      {/* 기존 정보를 채운 구독 정보 입력으로. 저장하면 새 직접 입력처럼 선택한 구독(A-04)에 들어감 */}
      <View className="px-screen-x pb-stack-lg pt-stack-md">
        <Cta
          label="재등록하기"
          onPress={() => router.push({ pathname: '/register/input', params: { reregister: s.id } })}
        />
      </View>
    </View>
  );
};
