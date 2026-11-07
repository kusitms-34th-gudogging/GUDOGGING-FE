import { Pressable, Text } from 'react-native';

import { PlusIcon } from '@/assets/icons';

interface AddServiceRowProps {
  onPress: () => void;
}

// 구독 목록 끝의 "서비스 더 선택하기" 줄 (ListItem과 같은 높이·구분선)
export const AddServiceRow = ({ onPress }: AddServiceRowProps) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    className="h-[69px] flex-row items-center gap-inline-md border-b-default border-border-default px-inline-xs active:opacity-pressed"
  >
    <PlusIcon className="size-[28px] text-icon-secondary" />
    <Text className="text-text-secondary text-body2-semibold">서비스 더 선택하기</Text>
  </Pressable>
);
