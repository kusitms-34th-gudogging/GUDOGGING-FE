import { View } from 'react-native';

import { Text } from '@/components/common/Text';

interface ScreenTitleProps {
  title: string;
  description: string;
}

export const ScreenTitle = ({ title, description }: ScreenTitleProps) => (
  <View className="gap-inline-sm">
    <Text className="text-text-primary text-head1-bold">{title}</Text>
    <Text className="text-text-primary text-body2-regular">{description}</Text>
  </View>
);
