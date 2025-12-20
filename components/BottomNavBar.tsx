import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { House, Box, History, Plus, MoreHorizontal, MessageCircle } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

// Componente para animar o ícone individualmente
const TabIcon = ({ isFocused, icon: Icon, name }: { isFocused: boolean; icon: any, name: string }) => {

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(isFocused ? 1.1 : 1) }],
      opacity: withTiming(isFocused ? 1 : 0.5),
    };
  });

  return (
    <View style={styles.iconWrapper}>
      <Animated.View style={animatedIconStyle}>
        <Icon
          size={26}
          color={isFocused ? COLORS.white : '#888'}
          strokeWidth={isFocused ? 2.5 : 2}
        />
      </Animated.View>
    </View>
  );
};

export default function BottomNavBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const router = useRouter();

  const ALLOWED_ROUTES = ['index', 'wallet', 'add_placeholder', 'history', 'menu'];
  const visibleRoutes = state.routes.filter(route => ALLOWED_ROUTES.includes(route.name));

  return (
    <View style={styles.tabBar}>
      {visibleRoutes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === state.routes.indexOf(route);

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (route.name === 'add_placeholder') {
            router.push('/add-transaction');
            return;
          }

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        let IconComponent = House;
        if (route.name === 'index') IconComponent = House;
        else if (route.name === 'wallet') IconComponent = Box;
        else if (route.name === 'history') IconComponent = History;
        else if (route.name === 'menu') IconComponent = MoreHorizontal;
        else if (route.name === 'chatbot') IconComponent = MessageCircle;
        else if (route.name === 'add_placeholder') IconComponent = Plus;

        if (route.name === 'add_placeholder') {
          return (
            <View key={route.key} style={styles.centerButtonContainer} pointerEvents="box-none">
              <TouchableOpacity
                style={styles.centerButton}
                onPress={onPress}
                activeOpacity={0.9}
              >
                <Plus size={32} color={COLORS.black} strokeWidth={3} />
              </TouchableOpacity>
            </View>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.tabBarItem}
            activeOpacity={0.7}
          >
            <TabIcon isFocused={isFocused} icon={IconComponent} name={route.name} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#121212',
    borderRadius: 40,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tabBarItem: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    width: 50,
  },
  centerButtonContainer: {
    top: -25,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 80,
    zIndex: 10,
  },
  centerButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 6,
    borderColor: '#121212',
  },
});
