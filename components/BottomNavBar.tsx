import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { House, Box, History, Plus, MoreHorizontal } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { useRouter } from 'expo-router';

export default function BottomNavBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const router = useRouter();

  // Lista explícita das rotas que devem aparecer na barra, na ordem correta
  const ALLOWED_ROUTES = ['index', 'wallet', 'add_placeholder', 'history', 'menu'];

  // Filtra apenas as rotas permitidas e mantém a ordem definida no _layout ou array acima
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

          // Lógica especial para o botão central
          if (route.name === 'add_placeholder') {
             router.push('/add-transaction');
             return;
          }

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        // Mapeamento de Ícones
        let IconComponent = House;
        if (route.name === 'index') IconComponent = House;
        else if (route.name === 'wallet') IconComponent = Box;
        else if (route.name === 'history') IconComponent = History;
        else if (route.name === 'menu') IconComponent = MoreHorizontal;
        else if (route.name === 'add_placeholder') IconComponent = Plus;

        // Renderização Especial para o Botão Central (Adicionar)
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

        // Renderização dos Botões Normais
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
            <View style={styles.iconContainer}>
                <IconComponent 
                    size={26} 
                    color={isFocused ? COLORS.white : '#666'} 
                    strokeWidth={isFocused ? 2.5 : 2}
                />
            </View>
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
    backgroundColor: '#121212', // Preto profundo
    borderRadius: 40, // Pílula
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
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
  },
  centerButtonContainer: {
    top: -25, // Eleva o botão para fora da barra
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
    // Sombras
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    // Borda grossa da mesma cor da barra para criar o efeito de recorte
    borderWidth: 6,
    borderColor: '#121212', 
  },
});
