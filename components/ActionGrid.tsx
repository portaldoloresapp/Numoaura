import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { History, Box, TrendingUp, MoreHorizontal } from 'lucide-react-native';
import { COLORS, SPACING } from '../constants/theme';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import AnimatedTouchable from './AnimatedTouchable';

const actions = [
  { id: 1, label: 'Histórico', icon: History, route: '/(tabs)/history' },
  { id: 2, label: 'Caixinhas', icon: Box, route: '/(tabs)/wallet' },
  { id: 4, label: 'Menu', icon: MoreHorizontal, route: '/(tabs)/menu' },
];

export default function ActionGrid() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {actions.map((action, index) => (
        <Animated.View
          key={action.id}
          entering={FadeInDown.delay(index * 100).springify()}
          layout={Layout.springify()}
        >
          <AnimatedTouchable
            style={styles.actionItem}
            onPress={() => router.push(action.route as any)}
          >
            <View style={styles.iconCircle}>
              <action.icon size={24} color={COLORS.black} />
            </View>
            <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>
              {action.label}
            </Text>
          </AnimatedTouchable>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.l,
    paddingHorizontal: 4,
  },
  actionItem: {
    alignItems: 'center',
    gap: 8,
    width: 70,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
