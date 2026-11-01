import { motion } from '@tokens';
import { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/utils/cn';

const KNOB_TRAVEL = 20;

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel?: string;
  className?: string;
}

export const Toggle = ({ value, onValueChange, accessibilityLabel, className }: ToggleProps) => {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, {
      duration: motion.transition,
      easing: Easing.bezier(...motion['ease-move']),
    });
  }, [value, progress]);

  const activeTrackStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * KNOB_TRAVEL }],
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={() => onValueChange(!value)}
      className={cn('h-[31px] w-[51px] rounded-full bg-border-default p-s2', className)}
    >
      <Animated.View
        style={activeTrackStyle}
        className="absolute inset-0 rounded-full bg-action-primary"
      />
      <Animated.View
        style={knobStyle}
        className="size-[27px] rounded-full bg-surface-default shadow-[0_2px_6px_0_rgba(0,0,0,0.15)]"
      />
    </Pressable>
  );
};
