import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { PlusIcon } from '@/assets/icons';
import { Cta } from '@/components/common/Cta';
import { ListItem } from '@/components/common/ListItem';
import { TopBar } from '@/components/common/TopBar';
import { FOUND_SAMPLE, type PaymentInfo } from '@/constants/services';
import { useRegisterDraft } from '@/hooks/useRegisterDraft';
import { formatPaymentSummary, formatWon } from '@/utils/formatPayment';

export const RegisterFoundScreen = () => {
  const { payments, setPayment } = useRegisterDraft();
  const [checked, setChecked] = useState(
    () => new Set(FOUND_SAMPLE.filter((f) => f.checked).map((f) => f.id)),
  );
  // 수정 화면에서 저장한 값이 분석 값보다 우선. issue 없는 분석 값은 모든 칸이 채워져 있음
  const items = FOUND_SAMPLE.map((f) => ({
    ...f,
    payment: payments[f.id] ?? (f.issue ? undefined : (f.payment as PaymentInfo)),
  }));
  const needCheck = items.filter((f) => !f.payment);
  const ready = items.filter((f) => f.payment);
  const selected = items.filter((f) => checked.has(f.id));
  const allEntered = selected.length > 0 && selected.every((f) => f.payment);

  const toggle = (id: string, next: boolean) =>
    setChecked((prev) => {
      const s = new Set(prev);
      if (next) s.add(id);
      else s.delete(id);
      return s;
    });

  const renderItem = (f: (typeof items)[number]) => (
    <ListItem
      key={f.id}
      title={f.name}
      subtitle={f.payment ? formatPaymentSummary(f.payment) : f.issue}
      showSubtitle
      logo={require('@/assets/images/logo_placeholder.png')}
      showLogo
      cost={f.payment ? formatWon(f.payment.amount) : '입력하기'}
      showCost
      costColor={f.payment ? 'text-text-primary' : 'text-text-error'}
      iconRightAction={{
        accessibilityLabel: `${f.name} 결제 정보 ${f.payment ? '수정하기' : '입력하기'}`,
        onPress: () =>
          router.push({ pathname: '/register/input', params: { id: f.id, found: '1' } }),
      }}
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
        <View className="gap-inline-sm">
          <Text className="text-text-primary text-head1-bold">
            {'찾은 구독 정보를\n확인해 주세요.'}
          </Text>
          <Text className="text-text-primary text-body2-regular">
            구독이 아닌 항목은 제외할 수 있어요.
          </Text>
        </View>
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
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/register/select')}
                className="h-[69px] flex-row items-center gap-inline-md border-b-default border-border-default px-inline-xs active:opacity-pressed"
              >
                <PlusIcon className="size-[28px] text-icon-secondary" />
                <Text className="text-text-secondary text-body2-semibold">서비스 더 선택하기</Text>
              </Pressable>
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
            // 완료 화면은 draft의 결제 정보를 읽음. 직접 입력(custom-)은 draft에 있으면 자동으로 목록에 붙음
            selected.forEach((f) => f.payment && !payments[f.id] && setPayment(f.id, f.payment));
            const ids = selected.filter((f) => !f.id.startsWith('custom-')).map((f) => f.id);
            router.push({ pathname: '/register/done', params: { ids: ids.join(',') } });
          }}
          className="mb-[14px]"
        />
      </View>
    </View>
  );
};
