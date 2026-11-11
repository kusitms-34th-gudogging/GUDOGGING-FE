import type { ComponentType } from 'react';
import { Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { cn } from '@/utils/cn';

interface GuideItemProps {
  icon: ComponentType<SvgProps>;
  /** 아이콘 색 클래스 (text-icon-*) */
  iconClassName: string;
  label: string;
}

export const GuideItem = ({ icon: Icon, iconClassName, label }: GuideItemProps) => (
  <View className="flex-row items-start gap-inline-sm">
    <View className="py-px">
      <Icon className={cn('size-icon-sm', iconClassName)} />
    </View>
    <Text className="shrink text-text-primary text-body2-semibold">{label}</Text>
  </View>
);
