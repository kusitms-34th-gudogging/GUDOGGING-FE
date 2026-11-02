import type { ComponentType } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { cn } from '@/utils/cn';

import { AssetTile } from './AssetTile';

interface OptionCardProps {
  title: string;
  description: string;
  asset: ComponentType<SvgProps>;
  monoAsset: ComponentType<SvgProps>;
  selected: boolean;
  onSelect: () => void;
  className?: string;
}

export const OptionCard = ({
  title,
  description,
  asset,
  monoAsset,
  selected,
  onSelect,
  className,
}: OptionCardProps) => (
  <Pressable
    accessibilityRole="radio"
    accessibilityState={{ selected }}
    onPress={onSelect}
    className={cn(
      'w-full flex-row items-center gap-inline-md rounded-input border-default bg-bg-default px-inset-md py-inset-sm',
      selected ? 'border-border-brand' : 'border-border-default',
      className,
    )}
  >
    {selected ? (
      <AssetTile tone="brand-bgx" asset={asset} />
    ) : (
      <AssetTile tone="mono-bgx" asset={monoAsset} />
    )}
    <View className="flex-1 gap-inline-xs">
      <Text numberOfLines={1} className="text-text-primary text-body2-semibold">
        {title}
      </Text>
      <Text numberOfLines={2} className="text-text-secondary text-caption2-regular">
        {description}
      </Text>
    </View>
  </Pressable>
);
