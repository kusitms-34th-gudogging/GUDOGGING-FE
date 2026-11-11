import { Text, View } from 'react-native';

import { EditColorAsset } from '@/assets/graphics';
import { Button } from '@/components/common/Button';

interface CheckupPromptCardProps {
  onPress: () => void;
}
export const CheckupPromptCard = ({ onPress }: CheckupPromptCardProps) => (
  <View className="h-[148px] overflow-hidden rounded-card bg-bg-subtle">
    <View className="absolute bottom-0 right-0">
      <EditColorAsset className="size-[115px]" />
    </View>
    <View className="px-s20 pt-s20">
      <View className="w-[166px] items-start gap-[28px]">
        <Text className="text-text-primary text-body1-semibold">
          {'결제 전 30초 질문,\n잘 쓰는 구독을 가려 드려요'}
        </Text>
        <Button size="sm" label="점검하러 가기" onPress={onPress} />
      </View>
    </View>
  </View>
);
