import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { MoreIcon } from '@/assets/icons';
import { Badge } from '@/components/common/Badge';
import { DetailCostCard } from '@/components/common/DetailCostCard';
import { Divider, ServiceHeader } from '@/components/common/DetailParts';
import { ListItem } from '@/components/common/ListItem';
import { Modal } from '@/components/common/Modal';
import { MoreMenu } from '@/components/common/MoreMenu';
import { QueryState } from '@/components/common/QueryState';
import { Text } from '@/components/common/Text';
import { TextArea } from '@/components/common/TextArea';
import { ToastOutlet } from '@/components/common/ToastProvider';
import { TopBar } from '@/components/common/TopBar';
import { PAID_AT } from '@/constants/services';
import { useDeleteSubscriptions } from '@/hooks/useDeleteSubscriptions';
import { useCalendarPaymentDetail } from '@/hooks/useSubscriptions';
import { useToast } from '@/hooks/useToast';
import { formatCycle, formatWon } from '@/utils/formatPayment';
import { fillName } from '@/utils/josa';

const monthDay = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`;
const fullDate = (d: Date) => `${d.getFullYear()}년 ${monthDay(d)}`;

// 왼쪽 항목 이름 + 오른쪽 값 한 줄
const InfoRow = ({ title, value }: { title: string; value: string }) => (
  <ListItem title={title} cost={value} showCost costColor="text-text-secondary" costFullWidth />
);

interface CalendarDetailScreenProps {
  id: string;
  // 캘린더에서 고른 결제 날짜. 서버가 이 날짜 다음 결제일을 줌 (CAL-003)
  date: Date;
}

// C-03 캘린더 결제 일정 상세
export const CalendarDetailScreen = ({ id, date }: CalendarDetailScreenProps) => {
  // 삭제 후 다시 불러오면 404지만 TanStack은 이전 data를 남겨서 닫히는 동안 빈 화면이 안 됨
  const { data: p, isError, refetch } = useCalendarPaymentDetail(id, date);
  const deleteSubscriptions = useDeleteSubscriptions();
  const { show } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const close = () => setMenuOpen(false);

  if (!p) {
    return (
      <View className="pt-safe flex-1 bg-bg-default">
        <QueryState isError={isError} onRetry={refetch} />
        <ToastOutlet placement="bottom" />
      </View>
    );
  }

  // 삭제하기: 구독과 점검 기록을 지우고 캘린더로 돌아감 (C-04, TST-001 S-2·E-6)
  const ended = !p.nextDate;
  const onDelete = () =>
    deleteSubscriptions.mutate([p.id], {
      onSuccess: () => {
        router.back();
        show(
          { type: 'success', message: fillName('{name}을 삭제했어요', p.name) },
          { nextScreen: true },
        );
      },
      onError: () => show({ type: 'error', message: '삭제하지 못했어요' }),
    });

  return (
    <View className="pt-safe pb-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title="구독 상세"
        onBack={() => router.back()}
        showAction2={false}
        action1={{ icon: MoreIcon, accessibilityLabel: '더보기', onPress: () => setMenuOpen(true) }}
      />
      {/* 구독 중이면 편집·삭제, 구독 종료면 삭제만 (편집 API는 구독 중만 받음). 편집은 구독 관리 상세와 같은 화면
          해지일 이전 날짜로 들어와도 이미 해지했으면 편집 없음 (상태 칩은 선택한 날짜 기준이라 따로 봄) */}
      <MoreMenu
        visible={menuOpen}
        onClose={close}
        options={[
          ...(!ended && !p.canceled
            ? [
                {
                  label: '편집',
                  onSelect: () =>
                    router.push({ pathname: '/register/input', params: { edit: p.id } }),
                },
              ]
            : []),
          {
            label: '삭제',
            // 구독 종료면 회색 화면이라 빨간색 대신 회색
            destructive: !ended,
            muted: ended,
            onSelect: () => {
              close();
              setDeleteOpen(true);
            },
          },
        ]}
      />
      {/* C-04 삭제 확인. 삭제 완료 토스트 없음 (화면설계서) */}
      <Modal
        visible={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        buttons="both"
        title={fillName('{name}을 삭제할까요?', p.name)}
        description="삭제하면 모든 정보가 사라져요."
        cancelLabel="취소"
        confirmLabel="삭제하기"
        onConfirm={onDelete}
      />
      <ScrollView bounces={false} contentContainerClassName="gap-s20 pb-[14px] pt-stack-md">
        <View className="gap-stack-md px-screen-x">
          {/* 기준일(고른 날짜) 기준 상태. 다음 결제일이 없으면 구독 종료라 구독 종료 상세(M-05)처럼 회색 (C-03, 서버가 계산) */}
          <ServiceHeader
            name={p.name}
            logoUrl={p.logoUrl}
            status={ended ? '구독 종료' : '구독 중'}
            category={p.categoryLabel}
            badgeVariant={ended ? 'mono' : 'tonal'}
          />
          <DetailCostCard
            tone={ended ? 'mono' : 'brand'}
            label="결제 예정"
            amount={formatWon(p.amount)}
            subText={`연 환산 ${formatWon(p.yearlyAmount)}`}
          />
        </View>
        <View className="gap-stack-md">
          <View className="gap-stack-sm px-screen-x">
            <Text accessibilityRole="header" className="text-text-primary text-body1-semibold">
              결제
            </Text>
            <View>
              {/* 구독 종료면 다음 결제일이 없음 (명세 null) */}
              {p.nextDate && <InfoRow title="다음 결제일" value={fullDate(p.nextDate)} />}
              <InfoRow title="결제 주기" value={formatCycle(p.cycle, p.unit)} />
              <InfoRow
                title="결제한 곳"
                value={PAID_AT.find((a) => a.value === p.paidAt)?.label ?? ''}
              />
              <InfoRow title="구독 시작일" value={fullDate(p.startedAt)} />
            </View>
          </View>
          {p.lastCheckup && (
            <>
              <Divider />
              <View className="gap-inline-sm px-screen-x">
                <View className="flex-row items-center gap-stack-xs">
                  <Text
                    accessibilityRole="header"
                    className="text-text-primary text-body1-semibold"
                  >
                    최근 점검
                  </Text>
                  <Badge
                    variant={ended ? 'mono' : 'tonal'}
                    label={`${monthDay(p.lastCheckup.checkedAt)} 점검`}
                  />
                </View>
                <View className="gap-s2">
                  <InfoRow title="점검 결과" value={p.lastCheckup.result} />
                  <InfoRow title="이용도" value={p.lastCheckup.usage} />
                  <InfoRow title="만족도" value={p.lastCheckup.satisfaction} />
                  <InfoRow title="다음 달" value={p.lastCheckup.plan} />
                  {p.lastCheckup.memo && (
                    <>
                      <Text className="py-inline-xs text-text-primary text-body3-semibold">
                        메모
                      </Text>
                      <TextArea
                        value={p.lastCheckup.memo}
                        editable={false}
                        accessibilityLabel="메모"
                      />
                    </>
                  )}
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
      {/* 삭제 실패 토스트. 하단 버튼이 없어 다른 화면과 같은 높이(하단 안전 영역 위 68)에 둠 (TST-001) */}
      <ToastOutlet placement="bottom" />
    </View>
  );
};
