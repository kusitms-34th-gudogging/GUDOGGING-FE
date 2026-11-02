import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentType } from 'react';
import { View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import {
  EducationColorAsset,
  EntertainmentColorAsset,
  EtcColorAsset,
  MusicColorAsset,
  OttColorAsset,
  ProductivityColorAsset,
  ShoppingColorAsset,
} from '@/assets/graphics';
import { cn } from '@/utils/cn';

const assetTileVariants = cva('items-center justify-center', {
  variants: {
    tone: {
      brand: 'bg-asset-tile',
      ott: 'bg-category-ott-tile',
      music: 'bg-category-music-tile',
      shopping: 'bg-category-shopping-tile',
      education: 'bg-category-education-tile',
      productivity: 'bg-category-productivity-tile',
      entertainment: 'bg-category-entertainment-tile',
      etc: 'bg-category-etc-tile',
      mono: 'bg-asset-mono-tile',
      'brand-bgx': '',
      'ott-bgx': '',
      'music-bgx': '',
      'shopping-bgx': '',
      'education-bgx': '',
      'productivity-bgx': '',
      'entertainment-bgx': '',
      'etc-bgx': '',
      'mono-bgx': '',
    },
    size: {
      sm: 'size-touch-target rounded-thumbnail',
      lg: 'size-[96px] rounded-card',
    },
  },
  defaultVariants: { size: 'sm' },
});

const assetVariants = cva('', {
  variants: {
    size: { sm: 'size-s24', lg: 'size-[56px]' },
  },
  defaultVariants: { size: 'sm' },
});

type Tone = NonNullable<VariantProps<typeof assetTileVariants>['tone']>;
type FreeTone = Extract<Tone, 'brand' | 'brand-bgx' | 'mono' | 'mono-bgx'>;
type CategoryTone = Exclude<Tone, FreeTone>;

// Figma: 카테고리 톤에는 같은 카테고리 에셋만 → 톤에서 에셋이 정해짐
const categoryAssets: Record<CategoryTone, ComponentType<SvgProps>> = {
  ott: OttColorAsset,
  'ott-bgx': OttColorAsset,
  music: MusicColorAsset,
  'music-bgx': MusicColorAsset,
  shopping: ShoppingColorAsset,
  'shopping-bgx': ShoppingColorAsset,
  education: EducationColorAsset,
  'education-bgx': EducationColorAsset,
  productivity: ProductivityColorAsset,
  'productivity-bgx': ProductivityColorAsset,
  entertainment: EntertainmentColorAsset,
  'entertainment-bgx': EntertainmentColorAsset,
  etc: EtcColorAsset,
  'etc-bgx': EtcColorAsset,
};

interface AssetTileBaseProps extends Pick<VariantProps<typeof assetTileVariants>, 'size'> {
  className?: string;
}

interface CategoryAssetTileProps extends AssetTileBaseProps {
  tone: CategoryTone;
  asset?: never;
}

interface FreeAssetTileProps extends AssetTileBaseProps {
  tone: FreeTone;
  asset: ComponentType<SvgProps>;
}

type AssetTileProps = CategoryAssetTileProps | FreeAssetTileProps;

export const AssetTile = (props: AssetTileProps) => {
  const { tone, size, className } = props;
  const Asset = props.asset === undefined ? categoryAssets[props.tone] : props.asset;

  return (
    <View className={cn(assetTileVariants({ tone, size }), className)}>
      <Asset className={assetVariants({ size })} />
    </View>
  );
};
