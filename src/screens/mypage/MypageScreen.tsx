import { router } from 'expo-router';
import { type ComponentType, Fragment, useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import {
  AlertColorAsset,
  BellColorAsset,
  CheckColorAsset,
  CheckupColorAsset,
  MailColorAsset,
} from '@/assets/graphics';
import { ChevronRightIcon } from '@/assets/icons';
import { ListItem } from '@/components/common/ListItem';
import { Modal } from '@/components/common/Modal';
import { Text } from '@/components/common/Text';
import { TopBar } from '@/components/common/TopBar';
import { openPolicy } from '@/constants/policy';
import { useLogout } from '@/hooks/useLogout';
import { useMe } from '@/hooks/useMe';

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

interface MenuItem {
  title: string;
  icon: ComponentType<SvgProps>;
  onPress?: () => void;
  testID?: string;
}

// 로그아웃은 이 화면의 확인 팝업을 열어서 화면 안에서 만듦
const getSections = (openLogout: () => void): { title: string; items: MenuItem[] }[] => [
  {
    title: '연동 및 알림',
    items: [
      {
        title: 'Gmail 연동',
        icon: assetSlot(MailColorAsset),
        onPress: () => router.push('/mypage/gmail'),
      },
      {
        title: '알림 설정',
        icon: assetSlot(BellColorAsset),
        onPress: () => router.push('/mypage/notification'),
      },
    ],
  },
  {
    title: '약관 및 정책',
    items: [
      {
        title: '이용 약관 및 개인정보 처리방침',
        icon: assetSlot(CheckupColorAsset),
        onPress: openPolicy,
      },
    ],
  },
  {
    title: '계정 관리',
    items: [
      {
        title: '로그아웃',
        icon: assetSlot(CheckColorAsset),
        onPress: openLogout,
        testID: 'mypage-logout',
      },
      {
        title: '회원 탈퇴',
        icon: assetSlot(AlertColorAsset),
        onPress: () => router.push('/mypage/withdraw'),
        testID: 'mypage-withdraw',
      },
    ],
  },
];

// 계정 정보를 못 불러와도 메뉴는 쓸 수 있게 계정 칸만 비워 둠
export const MypageScreen = () => {
  const { data: me } = useMe();
  const logoutMutation = useLogout();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const sections = getSections(() => setLogoutOpen(true));

  // 서버 세션을 끝내고 기기 토큰·계정 데이터 캐시를 비운 뒤 로그인 화면으로 (실패해도 기기에선 로그아웃)
  const logout = () =>
    logoutMutation.mutate(undefined, { onSettled: () => router.replace('/login') });

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <TopBar title="마이페이지" showAction1={false} showAction2={false} />
      <ScrollView bounces={false} contentContainerClassName="gap-inset-lg pb-[120px] pt-[12px]">
        <View className="ml-screen-x w-[279px] flex-row items-center gap-inline-sm">
          <Image source={PROFILE} className="size-logo-card rounded-full" />
          <View className="flex-1">
            {me?.email && <Text className="text-text-primary text-body1-semibold">{me.email}</Text>}
            <Text className="text-text-secondary text-caption1-regular">{me?.loginProvider}</Text>
          </View>
        </View>
        <View className="w-full gap-stack-md">
          {sections.map((section, index) => (
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
                        item.onPress && {
                          accessibilityLabel: item.title,
                          onPress: item.onPress,
                          testID: item.testID,
                        }
                      }
                    />
                  ))}
                </View>
              </View>
            </Fragment>
          ))}
        </View>
      </ScrollView>
      <Modal
        visible={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        buttons="both"
        title="로그아웃 할까요?"
        description="다시 로그인해야 서비스를 이용할 수 있어요."
        cancelLabel="취소"
        confirmLabel="로그아웃 하기"
        confirmTestID="mypage-logout-confirm"
        onConfirm={logout}
      />
    </View>
  );
};
