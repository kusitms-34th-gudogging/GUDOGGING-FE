import { router } from 'expo-router';
import { type ComponentType, Fragment } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import {
  AlertColorAsset,
  BellColorAsset,
  CheckColorAsset,
  CheckupColorAsset,
  EditColorAsset,
  MailColorAsset,
} from '@/assets/graphics';
import { ChevronRightIcon } from '@/assets/icons';
import { ListItem } from '@/components/common/ListItem';
import { TopBar } from '@/components/common/TopBar';

const PROFILE = require('@/assets/images/logo_placeholder.png');

// ListItem 왼쪽 아이콘 슬롯은 28, Figma는 그 안에 24 에셋을 가운데 둠
const assetSlot = (Asset: ComponentType<SvgProps>) =>
  function AssetSlot() {
    return (
      <View className="size-[28px] items-center justify-center">
        <Asset />
      </View>
    );
  };

const SECTIONS = [
  {
    title: '연동 및 알림',
    items: [
      {
        title: 'Gmail 연동',
        icon: assetSlot(MailColorAsset),
        onPress: () => router.push('/mypage/gmail'),
      },
      { title: '알림 설정', icon: assetSlot(BellColorAsset) },
    ],
  },
  {
    title: '약관 및 정책',
    items: [
      { title: '이용 약관', icon: assetSlot(CheckupColorAsset) },
      { title: '개인정보 처리방침', icon: assetSlot(EditColorAsset) },
    ],
  },
  {
    title: '계정 관리',
    items: [
      { title: '로그아웃', icon: assetSlot(CheckColorAsset) },
      { title: '회원 탈퇴', icon: assetSlot(AlertColorAsset) },
    ],
  },
];

interface MypageScreenProps {
  email?: string;
  loginProvider?: string;
}

// shortcut: 계정 정보·Gmail 외 행 이동은 아직 없음, 로그인 API·하위 화면 연동 시 props와 onPress 연결
export const MypageScreen = ({
  email = 'suum.user@icloud.com',
  loginProvider = 'Apple로 로그인',
}: MypageScreenProps) => (
  <View className="pt-safe flex-1 bg-bg-default">
    <TopBar title="마이페이지" showAction1={false} showAction2={false} />
    <ScrollView contentContainerClassName="items-center gap-inset-lg pb-[120px] pt-[22px]">
      <View className="w-[279px] flex-row items-center gap-inline-sm">
        <Image source={PROFILE} className="size-logo-card rounded-full" />
        <View className="flex-1">
          <Text className="text-text-primary text-body1-semibold">{email}</Text>
          <Text className="text-text-secondary text-caption1-regular">{loginProvider}</Text>
        </View>
      </View>
      <View className="w-full gap-stack-md">
        {SECTIONS.map((section, index) => (
          <Fragment key={section.title}>
            {index > 0 && <View className="h-[0.6px] bg-border-subtle" />}
            <View className="gap-stack-sm px-screen-x">
              <Text className="px-[2px] text-text-primary text-body2-semibold">
                {section.title}
              </Text>
              <View>
                {section.items.map((item) => (
                  <ListItem
                    key={item.title}
                    title={item.title}
                    iconLeft={item.icon}
                    showIconLeft
                    iconRight={ChevronRightIcon}
                    showIconRight
                    iconRightAction={
                      'onPress' in item && item.onPress
                        ? { accessibilityLabel: item.title, onPress: item.onPress }
                        : undefined
                    }
                  />
                ))}
              </View>
            </View>
          </Fragment>
        ))}
      </View>
    </ScrollView>
  </View>
);
