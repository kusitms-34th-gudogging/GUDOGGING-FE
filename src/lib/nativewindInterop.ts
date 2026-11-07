import { Canvas } from '@shopify/react-native-skia';
import { cssInterop } from 'nativewind';
import { TextInput } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Svg from 'react-native-svg';

// 서드파티 View라 className 매핑이 없어서 style로 연결
cssInterop(GestureHandlerRootView, { className: 'style' });

// placeholderClassName은 타입만 있고 런타임 매핑이 없어서 placeholderTextColor로 연결
cssInterop(TextInput, {
  className: { target: 'style', nativeStyleToProp: { textAlign: true } },
  placeholderClassName: { target: false, nativeStyleToProp: { color: 'placeholderTextColor' } },
});

cssInterop(Svg, {
  className: {
    target: 'style',
    nativeStyleToProp: { width: true, height: true, color: true },
  },
});

cssInterop(Canvas, { className: 'style' });
