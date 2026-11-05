import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { CalendarIcon, HomeIcon, UserIcon, WalletIcon } from '@/assets/icons';
import { useSlidingIndicator } from '@/hooks/useSlidingIndicator';
import { cn } from '@/utils/cn';

import { TabItem } from './TabItem';

const TABS = [
  { menu: 'home', label: '홈', icon: HomeIcon },
  { menu: 'calendar', label: '캘린더', icon: CalendarIcon },
  { menu: 'subscription', label: '구독 관리', icon: WalletIcon },
  { menu: 'mypage', label: '마이페이지', icon: UserIcon },
] as const;

export type TabBarMenu = (typeof TABS)[number]['menu'];

interface TabBarProps {
  selected: TabBarMenu;
  onSelect: (menu: TabBarMenu) => void;
  className?: string;
}

// 화면 배치(좌우 20, 하단 Safe Area + 16)는 사용처가 정함
export const TabBar = ({ selected, onSelect, className }: TabBarProps) => {
  const { indicatorStyle, onItemLayout, ready } = useSlidingIndicator(
    TABS.findIndex(({ menu }) => menu === selected),
  );

  return (
    <View
      accessibilityRole="tablist"
      className={cn(
        'w-full max-w-[335px] flex-row items-center rounded-pill bg-surface-raised p-inset-2xs shadow-elevation-2',
        className,
      )}
    >
      {ready && (
        <Animated.View
          pointerEvents="none"
          style={indicatorStyle}
          className="absolute bottom-inset-2xs left-0 top-inset-2xs rounded-pill bg-bg-muted"
        />
      )}
      {TABS.map(({ menu, label, icon }, index) => (
        <TabItem
          key={menu}
          icon={icon}
          accessibilityLabel={label}
          selected={selected === menu}
          onSelect={() => onSelect(menu)}
          onLayout={onItemLayout(index)}
          className="flex-1"
        />
      ))}
    </View>
  );
};
