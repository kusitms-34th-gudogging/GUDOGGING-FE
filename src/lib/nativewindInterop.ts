import { cssInterop } from 'nativewind';
import { TextInput } from 'react-native';
import Svg from 'react-native-svg';

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
