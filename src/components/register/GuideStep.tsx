import type { ComponentType } from 'react';
import { Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { cn } from '@/utils/cn';

interface GuideStepProps {
  icon: ComponentType<SvgProps>;
  /** 아이콘 색 클래스 (text-icon-*) */
  iconClassName: string;
  label: string;
}

// 가이드 화면의 아이콘 + 안내 문구 한 줄
export const GuideStep = ({ icon: Icon, iconClassName, label }: GuideStepProps) => (
  <View className="flex-row items-start gap-inset-sm">
    <View className="py-px">
      <Icon className={cn('size-icon-list', iconClassName)} />
    </View>
    <Text className="shrink text-text-primary text-body2-semibold">{label}</Text>
  </View>
);
