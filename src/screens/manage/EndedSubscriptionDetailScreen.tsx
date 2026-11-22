import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { MoreIcon } from '@/assets/icons';
import { Badge } from '@/components/common/Badge';
import { Cta } from '@/components/common/Cta';
import { DetailCostCard } from '@/components/common/DetailCostCard';
import { Divider, ServiceHeader } from '@/components/common/DetailParts';
import { ListItem } from '@/components/common/ListItem';
import { Modal } from '@/components/common/Modal';
import { MoreMenu } from '@/components/common/MoreMenu';
import { Text } from '@/components/common/Text';
import { TextArea } from '@/components/common/TextArea';
import { TopBar } from '@/components/common/TopBar';
import type { EndedSubscriptionDetail } from '@/constants/manage';
import { PAID_AT } from '@/constants/services';
import { useDeleteSubscriptions } from '@/hooks/useDeleteSubscriptions';
import { formatCycle, formatWon } from '@/utils/formatPayment';
import { fillName } from '@/utils/josa';

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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteSubscriptions = useDeleteSubscriptions();

  return (
    <View testID="manage-detail-ended" className="pt-safe pb-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title="구독 상세"
        onBack={() => router.back()}
        showAction2={false}
        action1={{ icon: MoreIcon, accessibilityLabel: '더보기', onPress: () => setMenuOpen(true) }}
      />
      {/* 구독 종료는 편집 없이 삭제만 (편집 API는 구독 중만 받음) */}
      <MoreMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        options={[
          // 구독 종료 화면은 회색이라 삭제도 빨간색 대신 회색
          { label: '삭제', muted: true, onSelect: () => setDeleteOpen(true) },
        ]}
      />
      {/* 삭제 확인 (C-04와 같은 문구). 삭제 완료 토스트 없음 */}
      <Modal
        visible={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        buttons="both"
        title={fillName('{name}을 삭제할까요?', s.name)}
        description="삭제하면 모든 정보가 사라져요."
        cancelLabel="취소"
        confirmLabel="삭제하기"
        onConfirm={() => deleteSubscriptions.mutate([s.id], { onSuccess: () => router.back() })}
      />
      <ScrollView bounces={false} contentContainerClassName="gap-s20 pb-stack-md pt-stack-md">
        <View className="gap-stack-md px-screen-x">
          <ServiceHeader
            name={s.name}
            logoUrl={s.logoUrl}
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
                    // 해지를 골랐을 때만 '· 해지' (유지를 골랐거나 안 골랐으면 점검일만)
                    label={`${monthDay(s.lastCheckup.checkedAt)} 점검${s.lastCheckup.decision === 'CANCEL' ? ' · 해지' : ''}`}
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
      {/* 기존 정보를 채운 구독 정보 입력으로. 다음 결제일만 바꿔 같은 구독을 재등록 (명세 reactivate) */}
      <View className="px-screen-x pb-[14px] pt-stack-md">
        <Cta
          testID="manage-detail-reregister"
          label="재등록하기"
          onPress={() => router.push({ pathname: '/register/input', params: { reregister: s.id } })}
        />
      </View>
    </View>
  );
};
