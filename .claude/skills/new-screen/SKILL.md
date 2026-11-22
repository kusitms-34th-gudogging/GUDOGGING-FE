---
name: new-screen
description: 새 화면(페이지)을 만들 때 사용. "화면 만들어줘", "페이지 추가" 요청 시 screens 본체 + app 라우트 껍데기를 컨벤션대로 생성
---

# 새 화면 만들기

먼저 읽기: `.claude/rules/routing.md` · `.claude/rules/components.md` · `.claude/rules/styling.md`

1. 화면 본체: `src/screens/{도메인}/{Name}Screen.tsx` (도메인 폴더가 없으면 만듦. 이름은 `components/{도메인}/`과 맞춤)

   ```tsx
   import { View } from 'react-native';

   import { Text } from '@/components/common/Text';
   import { ToastOutlet } from '@/components/common/ToastProvider';

   export const ProfileScreen = () => (
     <View className="flex-1 bg-bg-default">
       <Text className="text-text-primary text-body1-regular">Profile</Text>
       <ToastOutlet placement="bottom" />
     </View>
   );
   ```

   - `Text`는 공통 컴포넌트 (글자 크기 고정·한글 단어 단위 줄바꿈 기본값)
   - 모든 화면에 `ToastOutlet` 하나 (인터넷 연결 안내가 어느 화면에서든 떠야 함). 하단 CTA가 있으면 CTA 영역 바로 앞에 `placement="aboveCta"` → `.claude/docs/components/toast-modal.md`

2. 라우트 껍데기: `src/app/{route}.tsx` (동적 세그먼트는 `[id].tsx`, 그룹/중첩은 폴더 + `_layout.tsx`)

   ```tsx
   import { ProfileScreen } from '@/screens/profile/ProfileScreen';

   export default function ProfileRoute() {
     return <ProfileScreen />;
   }
   ```

3. 라우트 파라미터는 라우트에서 `useLocalSearchParams`(expo-router)로 읽어 screen에 props로 넘김
4. 화면을 구성하는 컴포넌트 위치는 `.claude/docs/architecture.md` "어디에 둘까"
5. `pnpm check`
