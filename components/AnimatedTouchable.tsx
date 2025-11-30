import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming,
  Easing
} from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface AnimatedTouchableProps extends TouchableOpacityProps {
  scaleActive?: number;
  children: React.ReactNode;
}

export default function AnimatedTouchable({ 
  children, 
  style, 
  scaleActive = 0.96, 
  onPressIn,
  onPressOut,
  ...props 
}: AnimatedTouchableProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = (e: any) => {
    scale.value = withSpring(scaleActive, { damping: 10, stiffness: 300 });
    opacity.value = withTiming(0.8, { duration: 100 });
    if (onPressIn) onPressIn(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 100 });
    if (onPressOut) onPressOut(e);
  };

  return (
    <AnimatedTouchableOpacity
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1} // Controlado pelo Reanimated
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedTouchableOpacity>
  );
}
