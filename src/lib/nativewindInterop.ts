import { Canvas } from '@shopify/react-native-skia';
import LottieView from 'lottie-react-native';
import { cssInterop } from 'nativewind';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg from 'react-native-svg';

// 서드파티 컴포넌트만 여기서 연결. RN 기본 컴포넌트(TextInput 등)는 NativeWind가 첫 렌더 때
// 기본 설정으로 다시 등록해 덮어씀 (react-native-css-interop wrap-jsx) → 여기서 바꿔도 적용 안 됨

// 서드파티 View라 className 매핑이 없어서 style로 연결
cssInterop(GestureHandlerRootView, { className: 'style' });

cssInterop(Svg, {
  className: {
    target: 'style',
    nativeStyleToProp: { width: true, height: true, color: true },
  },
});

// 서드파티 View라 className 매핑이 없어서 style로 연결
cssInterop(LottieView, { className: 'style' });

cssInterop(Canvas, { className: 'style' });

cssInterop(SafeAreaView, { className: 'style' });
