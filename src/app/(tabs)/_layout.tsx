import { router } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { View } from 'react-native';

import { TabBar, type TabBarMenu } from '@/components/common/TabBar';

// name = 탭 라우트 파일명. 홈은 '/' 유지를 위해 index
const TAB_ROUTES = [
  { menu: 'home', name: 'index', href: '/' },
  { menu: 'calendar', name: 'calendar', href: '/calendar' },
  { menu: 'manage', name: 'manage', href: '/manage' },
  { menu: 'mypage', name: 'mypage', href: '/mypage' },
] as const satisfies { menu: TabBarMenu; name: string; href: string }[];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state }) => (
        // 화면 위에 떠 있는 탭바 (좌우 20, 하단 Safe Area + 4)
        <View
          pointerEvents="box-none"
          className="pb-safe absolute inset-x-0 bottom-0 items-center px-screen-x"
        >
          <TabBar
            selected={TAB_ROUTES[state.index].menu}
            onSelect={(menu) => router.navigate(TAB_ROUTES.find((tab) => tab.menu === menu)!.href)}
            className="mb-s4"
          />
        </View>
      )}
    >
      {TAB_ROUTES.map(({ name }) => (
        <Tabs.Screen key={name} name={name} />
      ))}
    </Tabs>
  );
}
