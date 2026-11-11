import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { MoreIcon } from '@/assets/icons';
import { Badge } from '@/components/common/Badge';
import { DetailCostCard } from '@/components/common/DetailCostCard';
import { Divider, ServiceHeader } from '@/components/common/DetailParts';
import { ListItem } from '@/components/common/ListItem';
import { Modal } from '@/components/common/Modal';
import { MoreMenu } from '@/components/common/MoreMenu';
import { TextArea } from '@/components/common/TextArea';
import { TopBar } from '@/components/common/TopBar';
import { type CalendarPayment, nextPaymentDate } from '@/constants/calendar';
import { PAID_AT } from '@/constants/services';
import { formatCycle, formatWon } from '@/utils/formatPayment';
import { monthly } from '@/utils/homeSummary';
import { fillName } from '@/utils/josa';

const monthDay = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`;
const fullDate = (d: Date) => `${d.getFullYear()}년 ${monthDay(d)}`;

// 왼쪽 항목 이름 + 오른쪽 값 한 줄
const InfoRow = ({ title, value }: { title: string; value: string }) => (
  <ListItem title={title} cost={value} showCost costColor="text-text-secondary" costFullWidth />
);

interface CalendarDetailScreenProps {
  payment: CalendarPayment;
}

// C-03 캘린더 결제 일정 상세
export const CalendarDetailScreen = ({ payment: p }: CalendarDetailScreenProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const close = () => setMenuOpen(false);

  return (
    <View className="pt-safe pb-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title="구독 상세"
        onBack={() => router.back()}
        showAction2={false}
        action1={{ icon: MoreIcon, accessibilityLabel: '더보기', onPress: () => setMenuOpen(true) }}
      />
      {/* shortcut: 편집 화면이 아직 없어 편집은 메뉴만 닫힘 */}
      <MoreMenu
        visible={menuOpen}
        onClose={close}
        options={[
          { label: '편집', onSelect: close },
          {
            label: '삭제',
            destructive: true,
            onSelect: () => {
              close();
              setDeleteOpen(true);
            },
          },
        ]}
      />
      {/* C-04 삭제되면 캘린더로 돌아감 (Figma 메모)
          shortcut: 삭제 API가 없어 샘플에서 지워지지 않음, 연동 시 삭제 후 캘린더 목록 다시 불러오기 */}
      <Modal
        visible={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        buttons="both"
        title={fillName('{name}을 삭제할까요?', p.name)}
        description="삭제하면 모든 정보가 사라져요."
        cancelLabel="취소"
        confirmLabel="삭제하기"
        onConfirm={() => router.back()}
      />
      <ScrollView contentContainerClassName="gap-s20 pb-[14px] pt-stack-md">
        <View className="gap-stack-md px-screen-x">
          <ServiceHeader
            name={p.name}
            status="구독 중"
            category={p.categoryLabel}
            badgeVariant="tonal"
          />
          <DetailCostCard
            label="결제 예정"
            amount={formatWon(p.amount)}
            subText={`연 환산 ${formatWon(monthly(p) * 12)}`}
          />
        </View>
        <View className="gap-stack-md">
          <View className="gap-stack-sm px-screen-x">
            <Text
              accessibilityRole="header"
              className="px-[2px] text-text-primary text-body2-semibold"
            >
              결제
            </Text>
            <View>
              <InfoRow title="다음 결제일" value={monthDay(nextPaymentDate(p.day))} />
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
                    className="px-[2px] text-text-primary text-body2-semibold"
                  >
                    최근 점검
                  </Text>
                  <Badge variant="tonal" label={`${monthDay(p.lastCheckup.checkedAt)} 점검`} />
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
    </View>
  );
};
