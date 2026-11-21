import { Modal, Pressable } from 'react-native';
import Animated, {
  type EntryExitAnimationFunction,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { DropdownOption } from '@/components/common/DropdownOption';
import { cn } from '@/utils/cn';

interface MoreMenuOption {
  label: string;
  destructive?: boolean;
  onSelect: () => void;
}

interface MoreMenuProps {
  visible: boolean;
  onClose: () => void;
  options: MoreMenuOption[];
  // 현재 고른 옵션 (정렬 메뉴처럼 체크 표시가 있을 때)
  selected?: string;
  // 폭: 더보기 160 · 정렬 128 (Figma Popover)
  size?: 'md' | 'sm';
  // 메뉴 위치(mt·mr). 기본은 상단 바 ⋯ 버튼 아래
  className?: string;
}

// iOS 풀다운 메뉴처럼 scale 0.9 → 1 + 페이드 (0.25s spring)
const popIn: EntryExitAnimationFunction = () => {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ scale: 0.9 }] },
    animations: {
      opacity: withTiming(1, { duration: 250 }),
      transform: [{ scale: withSpring(1, { duration: 250 }) }],
    },
  };
};

// 상단 바 ⋯ 버튼 아래로 펼치는 메뉴 (Figma Popover · 더보기·정렬). 배경 dim 없음, 바깥을 누르면 닫힘
export const MoreMenu = ({
  visible,
  onClose,
  options,
  selected,
  size = 'md',
  className = 'mt-[36px]',
}: MoreMenuProps) => (
  <Modal transparent statusBarTranslucent visible={visible} onRequestClose={onClose}>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="메뉴 닫기"
      onPress={onClose}
      // 상단 바(56) 안 ⋯ 버튼 자리(위에서 36, 오른쪽 16)에 붙임
      className="pt-safe flex-1 items-end pr-inset-md"
    >
      <Animated.View
        entering={popIn}
        accessibilityRole="menu"
        className={cn(
          'rounded-md bg-surface-raised p-inset-2xs shadow-elevation-2',
          size === 'md' ? 'w-[160px]' : 'w-[128px]',
          className,
        )}
      >
        {options.map((option) => (
          <DropdownOption
            key={option.label}
            label={option.label}
            destructive={option.destructive}
            selected={option.label === selected}
            onSelect={() => {
              onClose();
              option.onSelect();
            }}
          />
        ))}
      </Animated.View>
    </Pressable>
  </Modal>
);
