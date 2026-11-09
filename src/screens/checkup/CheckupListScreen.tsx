import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { CHECKUP_SAMPLE } from '@/constants/checkup';

// TODO(삭제 예정): 구독 점검 진입 확인용 임시 화면 (/checkup)
// 홈·구독 상세에서 점검으로 들어가는 진입이 생기면 이 파일과 src/app/checkup/index.tsx를 함께 삭제
export const CheckupListScreen = () => (
  <View className="pt-safe flex-1 gap-stack-md bg-bg-default px-screen-x">
    <Text className="pt-stack-md text-text-primary text-head2-bold">구독 점검 (임시)</Text>
    {CHECKUP_SAMPLE.map((s) => (
      <Button
        key={s.id}
        variant="tonal"
        label={`${s.name} · ${s.category ?? '카테고리 미지정'}`}
        onPress={() => router.push(`/checkup/${s.id}`)}
      />
    ))}
  </View>
);
