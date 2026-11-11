import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { TopBar } from '@/components/common/TopBar';

// ponytail: 등록된 구독 없음(M-01)만. 구독 목록(M-02~)은 다음 작업에서 분기
export const ManageScreen = () => (
  <View className="pt-safe pb-safe flex-1 bg-bg-default">
    <TopBar title="구독 관리" showAction1={false} showAction2={false} />
    {/* 떠 있는 탭바(52 + 하단 4)를 빼고 남은 영역에서 세로 중앙 */}
    <View className="flex-1 items-center justify-center gap-stack-md px-screen-x pb-[56px]">
      <View className="items-center gap-s2">
        <Text className="text-center text-text-primary text-head3-bold">
          관리 중인 구독이 없어요
        </Text>
        <Text className="text-center text-text-secondary text-body3-regular">
          {'스크린샷, Gmail, 직접 입력으로\n구독을 등록할 수 있어요'}
        </Text>
      </View>
      <Button size="sm" label="구독 등록하기" onPress={() => router.push('/register')} />
    </View>
  </View>
);
