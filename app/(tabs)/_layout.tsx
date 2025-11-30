import { Tabs, useRouter } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { House, Box, History, Plus, MoreHorizontal } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: COLORS.white,
        tabBarInactiveTintColor: '#666',
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      {/* 1. Home (Início) */}
       <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
                <House 
                size={26} 
                color={focused ? COLORS.white : '#666'} 
                strokeWidth={focused ? 2.5 : 2}
                />
            </View>
          ),
        }}
      />

      {/* 2. Caixinhas (Carteira) */}
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Caixinhas',
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
                <Box 
                size={26} 
                color={focused ? COLORS.white : '#666'} 
                strokeWidth={focused ? 2.5 : 2}
                />
            </View>
          ),
        }}
      />

      {/* 3. BOTÃO ADICIONAR (Centro) */}
      <Tabs.Screen
        name="add_placeholder"
        options={{
          title: 'Adicionar',
          tabBarButton: (props) => (
            <View style={styles.centerButtonContainer} pointerEvents="box-none">
                <TouchableOpacity
                  style={styles.centerButton}
                  onPress={(e) => {
                      e.preventDefault();
                      router.push('/add-transaction');
                  }}
                  activeOpacity={0.9}
                >
                  <Plus size={32} color={COLORS.black} strokeWidth={3} />
                </TouchableOpacity>
            </View>
          ),
        }}
      />

      {/* 4. Histórico */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
                <History 
                size={26} 
                color={focused ? COLORS.white : '#666'} 
                strokeWidth={focused ? 2.5 : 2}
                />
            </View>
          ),
        }}
      />

      {/* 5. Menu (Mais / 3 Pontos) */}
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
                <MoreHorizontal 
                size={26} 
                color={focused ? COLORS.white : '#666'} 
                strokeWidth={focused ? 2.5 : 2}
                />
            </View>
          ),
        }}
      />

      {/* -- ROTAS OCULTAS DA BARRA -- */}
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="statistics" options={{ href: null }} />

    </Tabs>
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
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    paddingBottom: 0, // Remove padding extra do iOS
    paddingHorizontal: 10, // Espaçamento lateral interno para afastar ícones das bordas
    alignItems: 'center',
    justifyContent: 'space-around', // Distribuição uniforme
  },
  tabBarItem: {
    height: 70, // Ocupa toda a altura da barra
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 0,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    // Removido 'top' para garantir centralização vertical pura
  },
  centerButtonContainer: {
    top: -25, // Eleva o botão para fora da barra
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 80,
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
