import { Image, type ImageSourcePropType, Pressable, View } from 'react-native';

import { CloseIcon, PlusIcon } from '@/assets/icons';
import { cn } from '@/utils/cn';

// Figma type 값마다 필요한 props가 달라서 cva 대신 판별 유니온
type ImageCardProps =
  | {
      variant: 'filled';
      source: ImageSourcePropType;
      showDelete?: boolean;
      onDelete?: () => void;
      deleteAccessibilityLabel: string;
      className?: string;
    }
  | {
      variant: 'add';
      onPress: () => void;
      accessibilityLabel: string;
      className?: string;
      testID?: string;
    };

// 테두리 0.5는 토큰 없음 (border 최소 1)
const cardClassName =
  'size-[106px] overflow-hidden rounded-sheet border-[0.5px] border-border-default';

// Figma corner smoothing 80% → iOS 연속 곡선 (켜고 끄기만). NativeWind 클래스가 없어 style로
const SMOOTH_CORNER = { borderCurve: 'continuous' } as const;

export const ImageCard = (props: ImageCardProps) => {
  if (props.variant === 'add') {
    return (
      <Pressable
        testID={props.testID}
        accessibilityRole="button"
        accessibilityLabel={props.accessibilityLabel}
        onPress={props.onPress}
        style={SMOOTH_CORNER}
        className={cn(
          cardClassName,
          'items-center justify-center bg-bg-default active:opacity-pressed',
          props.className,
        )}
      >
        <View className="size-[30px] items-center justify-center rounded-pill bg-[#D9D9D9]">
          <PlusIcon className="size-icon-md text-icon-secondary" />
        </View>
      </Pressable>
    );
  }

  const { source, showDelete = true, onDelete, deleteAccessibilityLabel, className } = props;

  return (
    <View style={SMOOTH_CORNER} className={cn(cardClassName, className)}>
      <Image source={source} resizeMode="cover" className="size-full" />
      {showDelete && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={deleteAccessibilityLabel}
          onPress={onDelete}
          className="absolute right-[2px] top-[1px] px-inline-sm py-stack-sm active:opacity-pressed"
        >
          <View className="size-[22px] items-center justify-center rounded-pill bg-[#D9D9D9]">
            <CloseIcon className="size-icon-xs text-icon-secondary" />
          </View>
        </Pressable>
      )}
    </View>
  );
};
