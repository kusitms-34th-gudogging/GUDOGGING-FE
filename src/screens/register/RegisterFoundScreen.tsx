import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { Cta } from '@/components/common/Cta';
import { TopBar } from '@/components/common/TopBar';
import { AddServiceRow } from '@/components/register/AddServiceRow';
import { PaymentListItem } from '@/components/register/PaymentListItem';
import { ScreenTitle } from '@/components/register/ScreenTitle';
import { FOUND_SAMPLE, type PaymentInfo } from '@/constants/services';
import { useLeaveConfirm } from '@/hooks/useLeaveConfirm';
import { useRegisterDraft, useRegisterServices } from '@/hooks/useRegisterDraft';

export const RegisterFoundScreen = () => {
  const payments = useRegisterDraft((s) => s.payments);
  const setPayment = useRegisterDraft((s) => s.setPayment);
  const foundChecked = useRegisterDraft((s) => s.foundChecked);
  const setFoundChecked = useRegisterDraft((s) => s.setFoundChecked);
  // 스크린샷·Gmail의 첫 저장 화면: 나갈 때 이탈 팝업
  const { modal: leaveModal } = useLeaveConfirm(!!foundChecked);
  const checked = new Set(foundChecked);
  // 서비스 더 선택하기로 추가한 구독. 불러온 것과 같은 서비스는 불러온 쪽만 보여 줌
  const added = useRegisterServices(useRegisterDraft((s) => s.selectedIds)).filter(
    (s) => !FOUND_SAMPLE.some((f) => f.id === s.id),
  );
  const items = [
    // 수정 화면에서 저장한 값이 분석 값보다 우선. issue 없는 분석 값은 모든 칸이 채워져 있음
    ...FOUND_SAMPLE.map((f) => ({
      id: f.id,
      name: f.name,
      issue: f.issue,
      payment: payments[f.id] ?? (f.issue ? undefined : (f.payment as PaymentInfo)),
    })),
    ...added.map((s) => ({ id: s.id, name: s.name, issue: undefined, payment: payments[s.id] })),
  ];
  const needCheck = items.filter((f) => !f.payment);
  const ready = items.filter((f) => f.payment);
  const selected = items.filter((f) => checked.has(f.id));
  const allEntered = selected.length > 0 && selected.every((f) => f.payment);

  const toggle = (id: string, next: boolean) =>
    setFoundChecked(next ? [...checked, id] : [...checked].filter((v) => v !== id));

  const renderItem = (f: (typeof items)[number]) => (
    <PaymentListItem
      key={f.id}
      name={f.name}
      payment={f.payment}
      emptySubtitle={f.issue ?? ''}
      onEdit={() => router.push({ pathname: '/register/input', params: { id: f.id, found: '1' } })}
      showCheckBox
      checked={checked.has(f.id)}
      onCheckedChange={(next) => toggle(f.id, next)}
    />
  );

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title="불러온 구독 확인"
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
      />
      <View className="flex-1 gap-inset-lg px-screen-x pt-stack-md">
        <ScreenTitle
          title={'찾은 구독 정보를\n확인해 주세요.'}
          description="구독이 아닌 항목은 제외할 수 있어요."
        />
        <ScrollView className="max-h-[434px] shrink" contentContainerClassName="gap-inset-lg">
          {needCheck.length > 0 && (
            <View className="gap-inline-sm">
              <Text className="text-text-primary text-body3-semibold">
                확인 필요 {needCheck.length}
              </Text>
              <View className="gap-inline-xs">{needCheck.map(renderItem)}</View>
            </View>
          )}
          <View className="gap-stack-sm">
            <Text className="text-text-primary text-body3-semibold">등록 가능 {ready.length}</Text>
            <View className="gap-inline-xs">
              {ready.map(renderItem)}
              <AddServiceRow
                onPress={() => router.push({ pathname: '/register/select', params: { more: '1' } })}
              />
            </View>
          </View>
        </ScrollView>
      </View>
      <View className="pb-safe px-screen-x">
        {/* 선택한 구독의 결제 정보가 모두 있으면 활성화. shortcut: 등록 API 없이 완료 화면으로만 이동, API 연동 시 저장 성공 후 이동 */}
        <Cta
          label="선택한 구독 등록하기"
          disabled={!allEntered}
          onPress={() => {
            // 완료 화면은 draft의 결제 정보를 읽고, 체크한 항목만 받음
            // 직접 입력(custom-)은 완료 화면이 저장한 이름을 쓰므로 찾은 이름을 같이 저장
            selected.forEach(
              (f) =>
                f.payment &&
                !payments[f.id] &&
                setPayment(f.id, {
                  ...f.payment,
                  name: f.id.startsWith('custom-') ? f.name : undefined,
                }),
            );
            router.push({
              pathname: '/register/done',
              params: { ids: selected.map((f) => f.id).join(',') },
            });
          }}
          className="mb-[14px]"
        />
      </View>
      {leaveModal}
    </View>
  );
};
