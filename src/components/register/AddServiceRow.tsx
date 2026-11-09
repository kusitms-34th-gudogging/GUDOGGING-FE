import { Pressable, Text } from 'react-native';

import { PlusIcon } from '@/assets/icons';

interface AddServiceRowProps {
  label: string;
  onPress: () => void;
}

// 구독 목록 끝의 추가 줄 (구독 추가하기·직접 입력하기 등)
export const AddServiceRow = ({ label, onPress }: AddServiceRowProps) => (
  <Pressable
    accessibilityRole="button"
    // 행 높이는 36이라 위아래로 늘려 터치 영역 44
    hitSlop={{ top: 4, bottom: 4 }}
    onPress={onPress}
    className="flex-row items-center gap-inset-xs py-inline-xs active:opacity-pressed"
  >
    <PlusIcon className="size-[28px] text-icon-secondary" />
    <Text className="text-text-secondary text-body3-semibold">{label}</Text>
  </Pressable>
);
