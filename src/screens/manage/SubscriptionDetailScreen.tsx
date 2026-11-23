import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { MoreIcon } from '@/assets/icons';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { DetailCostCard } from '@/components/common/DetailCostCard';
import { Divider, ServiceHeader } from '@/components/common/DetailParts';
import { ListItem } from '@/components/common/ListItem';
import { Modal } from '@/components/common/Modal';
import { MoreMenu } from '@/components/common/MoreMenu';
import { Text } from '@/components/common/Text';
import { ToastOutlet } from '@/components/common/ToastProvider';
import { Toggle } from '@/components/common/Toggle';
import { TopBar } from '@/components/common/TopBar';
import type { ActiveSubscriptionDetail } from '@/constants/manage';
import { PAID_AT } from '@/constants/services';
import { useCancelSubscription } from '@/hooks/useCancelSubscription';
import { useDeleteSubscriptions } from '@/hooks/useDeleteSubscriptions';
import { useSetSteadySubscription } from '@/hooks/useSetSteadySubscription';
import { useToast } from '@/hooks/useToast';
import { track } from '@/lib/analytics';
import { formatCycle, formatWon } from '@/utils/formatPayment';
import { monthly } from '@/utils/homeSummary';
import { fillName } from '@/utils/josa';

const monthDay = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`;
const fullDate = (d: Date) => `${d.getFullYear()}년 ${monthDay(d)}`;

interface SubscriptionDetailScreenProps {
  subscription: ActiveSubscriptionDetail;
  // 해지 확인 알림(N-02)으로 들어오면 해지 완료 확인 모달(X-06)을 띄운 채 시작
  confirmCancel?: boolean;
}

// M-03 구독 상세 (구독 중)
export const SubscriptionDetailScreen = ({
  subscription: s,
  confirmCancel = false,
}: SubscriptionDetailScreenProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteSubscriptions = useDeleteSubscriptions();
  const { show } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(confirmCancel);
  // 토글은 바로 바뀌고 저장 실패하면 되돌림
  // shortcut: 실패 안내(토스트)는 디자인에 없어 되돌리기만, 디자인 나오면 안내 추가
  const [steady, setSteady] = useState(s.steady);
  const setSteadySubscription = useSetSteadySubscription(s.id);
  const cancelSubscription = useCancelSubscription();
  const changeSteady = (next: boolean) => {
    setSteady(next);
    track('steady_toggle', {
      service_name: s.name,
      category: s.category,
      enabled: next ? 'true' : 'false',
    });
    setSteadySubscription.mutate(next, { onError: () => setSteady(!next) });
  };

  return (
    <View testID="manage-detail-active" className="pt-safe pb-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title="구독 상세"
        onBack={() => router.back()}
        showAction2={false}
        action1={{ icon: MoreIcon, accessibilityLabel: '더보기', onPress: () => setMenuOpen(true) }}
      />
      <MoreMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        options={[
          {
            label: '편집',
            onSelect: () => router.push({ pathname: '/register/input', params: { edit: s.id } }),
          },
          {
            label: '삭제',
            destructive: true,
            onSelect: () => setDeleteOpen(true),
          },
        ]}
      />
      {/* 삭제 확인 (C-04와 같은 문구) */}
      <Modal
        visible={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        buttons="both"
        title={fillName('{name}을 삭제할까요?', s.name)}
        description="삭제하면 모든 정보가 사라져요."
        cancelLabel="취소"
        confirmLabel="삭제하기"
        onConfirm={() =>
          deleteSubscriptions.mutate([s.id], {
            onSuccess: () => {
              router.back();
              show(
                { type: 'success', message: fillName('{name}을 삭제했어요', s.name) },
                { nextScreen: true },
              );
            },
            onError: () => show({ type: 'error', message: '삭제하지 못했어요' }),
          })
        }
      />
      <View className="flex-1">
        <ScrollView bounces={false} contentContainerClassName="gap-s20 pb-stack-md pt-stack-md">
          <View className="gap-stack-md px-screen-x">
            <ServiceHeader
              name={s.name}
              logoUrl={s.logoUrl}
              status="구독 중"
              category={s.category}
              badgeVariant="tonal"
            />
            <DetailCostCard
              label="결제 예정"
              amount={formatWon(s.amount)}
              subText={`연 환산 ${formatWon(s.yearlyAmount)}`}
            />
          </View>
          <View className="gap-screen-x">
            <View className="flex-row items-center justify-between gap-inline-sm px-screen-x">
              <View className="shrink">
                <Text className="text-text-primary text-body2-bold">꾸준히 쓰는 구독</Text>
                <Text className="text-text-secondary text-caption2-regular">
                  점검 알림 없이 그대로 유지해요
                </Text>
              </View>
              <Toggle
                value={steady}
                onValueChange={changeSteady}
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
                    cost={fullDate(s.nextDate)}
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
        {/* 편집 저장(S-3) 토스트는 하단 버튼 위. 아래 버튼 영역의 위 패딩(stack-md)만큼 내려서 버튼 위 8 (CTA 화면과 같음) */}
        <ToastOutlet className="-bottom-stack-md pb-stack-sm" />
      </View>
      <View className="flex-row gap-inline-sm px-screen-x pb-[14px] pt-stack-md">
        <Button
          variant="tonal"
          label="해지하기"
          onPress={() => router.push(`/checkup/${s.id}/cancel`)}
          className="flex-1"
        />
        <Button
          label="구독 점검"
          onPress={() => router.push(`/checkup/${s.id}?restart=1&from=detail`)}
          className="flex-1"
        />
      </View>
      {/* 해지 완료하면 상세를 다시 불러와 같은 경로가 구독 종료(M-05) 화면으로 바뀜 */}
      <Modal
        visible={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        buttons="both"
        title={fillName('{name}을 해지했나요?', s.name)}
        description={'해지 완료를 누르면 점검 알림이\n더 이상 오지 않아요.'}
        cancelLabel="취소"
        confirmLabel="해지 완료"
        // 재조회로 구독 종료 화면으로 바뀌면 이 화면이 사라져 mutate 콜백이 안 불림 → mutateAsync로
        onConfirm={() =>
          cancelSubscription.mutateAsync(s.id).then(
            () => {
              // 이 모달은 해지 확인 알림(N-02)으로 들어올 때만 열림
              track('cancel_complete', {
                service_name: s.name,
                category: s.category,
                amount: monthly(s),
                cancel_from: 'push',
              });
              show({ type: 'success', message: fillName('{name}을 해지했어요', s.name) });
            },
            () => show({ type: 'error', message: '저장하지 못했어요' }),
          )
        }
      />
    </View>
  );
};
