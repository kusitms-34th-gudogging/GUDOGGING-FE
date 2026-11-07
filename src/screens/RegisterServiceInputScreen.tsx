import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

import { ImageColorAsset, ImageMonoAsset } from '@/assets/graphics';
import { BottomSheet } from '@/components/common/BottomSheet';
import { Cta } from '@/components/common/Cta';
import { Dial } from '@/components/common/Dial';
import { Dropdown } from '@/components/common/Dropdown';
import { OptionCard } from '@/components/common/OptionCard';
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
const CYCLE_UNITS = [
  { unit: '일', example: 'ex) 20일마다 결제돼요' },
  { unit: '주', example: 'ex) 2주마다 결제돼요' },
  { unit: '개월', example: 'ex) 1개월마다 결제돼요' },
  { unit: '년', example: 'ex) 1년마다 결제돼요' },
];

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
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [unitSheet, setUnitSheet] = useState(false);
  const [draftUnit, setDraftUnit] = useState<string>();
  const [dateSheet, setDateSheet] = useState(false);
  const [draftDate, setDraftDate] = useState(startOfToday);

  const cycleNum = Number(cycle);
  const valid = Number(amount) > 0 && cycleNum >= 1 && cycleNum <= 31 && !!nextDate;
  const closeMenu = () => setCategoryOpen(false);

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
              open={categoryOpen}
              onPress={() => setCategoryOpen((o) => !o)}
              options={CATEGORIES}
              onSelect={(v) => {
                setCategory(v);
                closeMenu();
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
                onPress={() => {
                  closeMenu();
                  setDraftUnit(undefined);
                  setUnitSheet(true);
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
        visible={unitSheet}
        onClose={() => setUnitSheet(false)}
        title="결제 주기 단위를 선택해 주세요"
        confirmLabel="확인"
        confirmDisabled={!draftUnit}
        onConfirm={() => draftUnit && setUnit(draftUnit)}
      >
        <View className="gap-[6px]">
          {CYCLE_UNITS.map((c) => (
            <OptionCard
              key={c.unit}
              title={c.unit}
              description={c.example}
              asset={ImageColorAsset}
              monoAsset={ImageMonoAsset}
              selected={draftUnit === c.unit}
              onSelect={() => setDraftUnit(c.unit)}
            />
          ))}
        </View>
      </BottomSheet>
      <BottomSheet
        visible={dateSheet}
        onClose={() => setDateSheet(false)}
        title="다음 결제일을 선택해 주세요"
        description="카드 결제 내역이나 앱 구독 화면에서 확인할 수 있어요."
        confirmLabel="확인"
        // 과거 결제일은 허용하지 않음 (명세)
        confirmDisabled={draftDate < startOfToday()}
        onConfirm={() => setNextDate(draftDate)}
      >
        <Dial value={draftDate} onValueChange={setDraftDate} />
      </BottomSheet>
    </View>
  );
};
