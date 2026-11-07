import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

import { BottomSheet } from '@/components/common/BottomSheet';
import { Cta } from '@/components/common/Cta';
import { Dial } from '@/components/common/Dial';
import { Dropdown } from '@/components/common/Dropdown';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { TextField } from '@/components/common/TextField';
import { TopBar } from '@/components/common/TopBar';
import { PAID_AT, type PaidAt, SERVICES } from '@/constants/services';
import { useRegisterDraft } from '@/hooks/useRegisterDraft';

const CATEGORIES = [
  '영상·OTT',
  '음악',
  '쇼핑·배달 멤버십',
  '교육·학습',
  '생산성·AI',
  '엔터테인먼트',
  '기타',
];
const CYCLE_UNITS = ['일', '주', '개월', '년'];

const formatDate = (d: Date) =>
  `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
const startOfToday = () => new Date(new Date().setHours(0, 0, 0, 0));

interface RegisterServiceInputScreenProps {
  serviceId: string;
}

export const RegisterServiceInputScreen = ({ serviceId }: RegisterServiceInputScreenProps) => {
  const service = SERVICES.find((s) => s.id === serviceId);
  const { payments, setPayment } = useRegisterDraft();
  // 이미 저장한 값이 있으면 이어서 수정
  const saved = payments[serviceId];
  const [category, setCategory] = useState(saved?.category ?? CATEGORIES[0]);
  const [amount, setAmount] = useState(saved ? String(saved.amount) : '');
  const [cycle, setCycle] = useState(String(saved?.cycle ?? 1));
  const [unit, setUnit] = useState(saved?.unit ?? '개월');
  const [nextDate, setNextDate] = useState(saved?.nextDate);
  const [paidAt, setPaidAt] = useState<PaidAt>(saved?.paidAt ?? 'web');
  const [openMenu, setOpenMenu] = useState<'category' | 'unit'>();
  const [dateSheet, setDateSheet] = useState(false);
  const [draftDate, setDraftDate] = useState(startOfToday);

  const cycleNum = Number(cycle);
  const valid = Number(amount) > 0 && cycleNum >= 1 && cycleNum <= 31 && !!nextDate;
  const toggleMenu = (menu: 'category' | 'unit') =>
    setOpenMenu((m) => (m === menu ? undefined : menu));
  const closeMenu = () => setOpenMenu(undefined);

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title="구독 정보 입력"
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow px-screen-x pt-stack-md pb-stack-lg"
        keyboardShouldPersistTaps="handled"
      >
        {/* 드롭다운 메뉴 바깥(빈 곳)을 누르면 닫힘. 안쪽 버튼·입력칸은 각자 터치를 가져감 */}
        <Pressable accessible={false} onPress={closeMenu} className="grow gap-stack-lg">
          <View className="flex-row items-center gap-inline-md">
            <Image
              source={require('@/assets/images/logo_placeholder.png')}
              className="size-logo-card"
            />
            <Text className="text-text-primary text-body2-semibold">{service?.name}</Text>
          </View>
          <View className="gap-inline-md">
            <Dropdown
              label="카테고리"
              placeholder="카테고리를 선택해 주세요"
              value={category}
              open={openMenu === 'category'}
              onPress={() => toggleMenu('category')}
              options={CATEGORIES}
              onSelect={(v) => {
                setCategory(v);
                setOpenMenu(undefined);
              }}
            />
            <TextField
              label="결제 금액"
              placeholder="결제 금액을 입력해 주세요"
              keyboardType="number-pad"
              value={amount}
              onChangeText={(t) => setAmount(t.replace(/\D/g, ''))}
              onFocus={closeMenu}
            />
            <View className="flex-row items-end gap-inset-xs">
              <TextField
                label="결제 주기"
                keyboardType="number-pad"
                maxLength={2}
                value={cycle}
                onChangeText={(t) => setCycle(t.replace(/\D/g, ''))}
                error={cycle !== '' && (cycleNum < 1 || cycleNum > 31)}
                onFocus={closeMenu}
                className="flex-1"
              />
              <Dropdown
                label="결제 주기 단위"
                showLabel={false}
                placeholder="단위"
                value={unit}
                open={openMenu === 'unit'}
                onPress={() => toggleMenu('unit')}
                options={CYCLE_UNITS}
                onSelect={(v) => {
                  setUnit(v);
                  setOpenMenu(undefined);
                }}
                className="w-[127px]"
              />
            </View>
            <Dropdown
              label="다음 결제일"
              placeholder="다음 결제일을 선택해 주세요"
              value={nextDate && formatDate(nextDate)}
              showIcon={false}
              onPress={() => {
                closeMenu();
                setDraftDate(nextDate ?? startOfToday());
                setDateSheet(true);
              }}
            />
            <View className="gap-inset-xs">
              <Text className="text-text-primary text-body3-regular">결제한 곳</Text>
              <SegmentedControl
                options={PAID_AT}
                selected={paidAt}
                onSelect={(v) => {
                  setPaidAt(v);
                  closeMenu();
                }}
              />
              <Text className="text-text-tertiary text-caption1-regular">
                {
                  "서비스 홈페이지나 앱에서 카드로 직접 결제했다면\n'웹·직접 결제'를 골라 주세요. 해지 방법 안내에 쓰여요."
                }
              </Text>
            </View>
          </View>
        </Pressable>
      </ScrollView>
      <View className="pb-safe px-screen-x">
        <Cta
          label="저장하기"
          disabled={!valid}
          onPress={() => {
            if (!nextDate) return;
            setPayment(serviceId, {
              category,
              amount: Number(amount),
              cycle: cycleNum,
              unit,
              nextDate,
              paidAt,
            });
            router.back();
          }}
          className="mb-[14px]"
        />
      </View>
      <BottomSheet
        visible={dateSheet}
        onClose={() => setDateSheet(false)}
        title="다음 결제일"
        confirmLabel="선택"
        // 과거 결제일은 허용하지 않음 (명세)
        confirmDisabled={draftDate < startOfToday()}
        onConfirm={() => setNextDate(draftDate)}
      >
        <Dial value={draftDate} onValueChange={setDraftDate} />
      </BottomSheet>
    </View>
  );
};
