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
    };

const cardClassName =
  'size-[106px] overflow-hidden rounded-card border-default border-border-default';

export const ImageCard = (props: ImageCardProps) => {
  if (props.variant === 'add') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={props.accessibilityLabel}
        onPress={props.onPress}
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
    <View className={cn(cardClassName, className)}>
      <Image source={source} resizeMode="cover" className="size-full" />
      {showDelete && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={deleteAccessibilityLabel}
          onPress={onDelete}
          className="absolute right-0 top-0 px-inline-sm py-stack-sm active:opacity-pressed"
        >
          <View className="size-[22px] items-center justify-center rounded-pill bg-[#D9D9D9]">
            <CloseIcon className="size-icon-xs text-icon-secondary" />
          </View>
        </Pressable>
      )}
    </View>
  );
};
