import { Text as RNText, type TextProps } from 'react-native';

// iOS 시스템 글자 크기(Dynamic Type)를 따르지 않고 디자인 크기 그대로 (팀 결정, 모든 기기에서 같은 px)
// 한글은 단어 단위로 줄바꿈 (기본은 글자 단위라 '삭제 / 할까요?'처럼 잘림). Android는 무시
// React 19에선 함수 컴포넌트 defaultProps가 없어 RN Text에 기본값을 못 걸어서 감쌈
export const Text = (props: TextProps) => (
  <RNText allowFontScaling={false} lineBreakStrategyIOS="hangul-word" {...props} />
);
