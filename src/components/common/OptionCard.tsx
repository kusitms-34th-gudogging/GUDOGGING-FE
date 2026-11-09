import type { ComponentType } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { cn } from '@/utils/cn';

import { AssetTile } from './AssetTile';

interface OptionCardProps {
  title: string;
  description?: string;
  showDescription?: boolean;
  asset?: ComponentType<SvgProps>;
  monoAsset?: ComponentType<SvgProps>;
  showAsset?: boolean;
  selected: boolean;
  onSelect: () => void;
  // 여러 개 고르는 목록이면 true (스크린리더가 체크박스로 읽음)
  multiple?: boolean;
  className?: string;
}

export const OptionCard = ({
  title,
  description,
  showDescription = true,
  asset,
  monoAsset,
  showAsset = true,
  selected,
  onSelect,
  multiple,
  className,
}: OptionCardProps) => (
  <Pressable
    accessibilityRole={multiple ? 'checkbox' : 'radio'}
    accessibilityState={multiple ? { checked: selected } : { selected }}
    onPress={onSelect}
    className={cn(
      'w-full flex-row items-center gap-inline-md rounded-input border-default bg-bg-default px-inset-md py-inset-sm transition-colors',
      selected ? 'border-border-brand' : 'border-border-default',
      className,
    )}
  >
    {showAsset && selected && asset && <AssetTile tone="brand-bgx" asset={asset} />}
    {showAsset && !selected && monoAsset && <AssetTile tone="mono-bgx" asset={monoAsset} />}
    <View className="flex-1 gap-inline-xs">
      <Text numberOfLines={1} className="text-text-primary text-body2-semibold">
        {title}
      </Text>
      {showDescription && description && (
        <Text numberOfLines={2} className="text-text-secondary text-caption2-regular">
          {description}
        </Text>
      )}
    </View>
  </Pressable>
);
