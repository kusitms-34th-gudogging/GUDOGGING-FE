import { Text, View } from 'react-native';

interface ScreenTitleProps {
  title: string;
  description: string;
}

export const ScreenTitle = ({ title, description }: ScreenTitleProps) => (
  // Figma head 프레임: 좌우 2, 내용(106)보다 높이(108)가 2 커서 설명 아래 2
  <View className="gap-inline-sm px-s2 pb-s2">
    <Text className="text-text-primary text-head1-bold">{title}</Text>
    <Text className="text-text-primary text-body2-regular">{description}</Text>
  </View>
);
