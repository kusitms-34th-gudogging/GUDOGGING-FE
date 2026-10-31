---
name: new-screen
description: 새 화면(페이지)을 만들 때 사용. "화면 만들어줘", "페이지 추가" 요청 시 screens 본체 + app 라우트 껍데기를 컨벤션대로 생성
---

# 새 화면 만들기

1. 화면 본체: `src/screens/{Name}Screen.tsx`

   ```tsx
   import { Text, View } from 'react-native';

   export const ProfileScreen = () => (
     <View className="flex-1 bg-bg-default">
       <Text className="text-text-primary text-body1-regular">Profile</Text>
     </View>
   );
   ```

2. 라우트 껍데기: `src/app/{route}.tsx` (동적 세그먼트는 `[id].tsx`, 그룹/중첩은 폴더 + `_layout.tsx`)

   ```tsx
   import { ProfileScreen } from '@/screens/ProfileScreen';

   export default function ProfileRoute() {
     return <ProfileScreen />;
   }
   ```

3. 라우트 파라미터는 라우트에서 `useLocalSearchParams`(expo-router)로 읽어 screen에 props로 넘김
4. 화면을 구성하는 컴포넌트는 `src/components/{도메인}/`에 (도메인 폴더가 없으면 새로 만듦). 여러 도메인에서 쓰면 `src/components/common/`
5. 스타일은 `className` + `cn`만, props는 `interface {Name}ScreenProps`
6. `pnpm lint && pnpm typecheck`
