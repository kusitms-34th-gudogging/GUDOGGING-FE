import { Pressable } from 'react-native';

import { PlusIcon } from '@/assets/icons';
import { Text } from '@/components/common/Text';

interface AddServiceRowProps {
  label: string;
  onPress: () => void;
  testID?: string;
}

// 구독 목록 끝의 추가 버튼 (구독 추가하기·직접 입력하기 등)
// Figma: Text button(Disabled 색) + plus 16, 목록 가운데. TextButton은 disabled면 눌리지 않아 모양만 맞춤
export const AddServiceRow = ({ label, onPress, testID }: AddServiceRowProps) => (
  <Pressable
    testID={testID}
    accessibilityRole="button"
    onPress={onPress}
    className="h-touch-target max-w-[200px] flex-row items-center justify-center gap-inline-xs self-center rounded-button px-inset-xs active:bg-action-ghost-pressed"
  >
    <Text numberOfLines={1} className="shrink text-text-disabled text-body3-semibold">
      {label}
    </Text>
    <PlusIcon className="size-icon-xs text-text-disabled" />
  </Pressable>
);
