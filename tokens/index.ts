import tokens from './tailwind-token.json';

// className 으로 표현할 수 없는 토큰 (나머지는 Tailwind 클래스로 사용)
type Bezier = [number, number, number, number];

export const motion = tokens.motion as Omit<
  typeof tokens.motion,
  'easing' | 'ease-move' | 'ease-enter' | 'ease-exit'
> & {
  easing: Record<keyof typeof tokens.motion.easing, Bezier>;
  'ease-move': Bezier;
  'ease-enter': Bezier;
  'ease-exit': Bezier;
};

export const { gradient, grid } = tokens;
