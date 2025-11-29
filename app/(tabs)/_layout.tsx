import { Tabs, useRouter } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { House, Box, User, BarChart2, Plus } from 'lucide-react-native';
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
        // Força o item a ocupar toda a altura e centralizar o conteúdo
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 0, 
          margin: 0,
        },
      }}
    >
      {/* 1. Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
                <House 
                size={26} 
                color={focused ? COLORS.white : '#888'} 
                strokeWidth={focused ? 2.5 : 2}
                />
            </View>
          ),
        }}
      />

      {/* 2. Caixinhas */}
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Caixinhas',
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
                <Box 
                size={26} 
                color={focused ? COLORS.white : '#888'} 
                strokeWidth={focused ? 2.5 : 2}
                />
            </View>
          ),
        }}
      />

      {/* 3. BOTÃO ADICIONAR (Centro - Destaque) */}
      <Tabs.Screen
        name="add_placeholder"
        options={{
          title: 'Adicionar',
          tabBarButton: (props) => (
            <View style={styles.centerButtonWrapper}>
                <TouchableOpacity
                  style={styles.centerButton}
                  onPress={(e) => {
                      e.preventDefault();
                      router.push('/add-transaction');
                  }}
                  activeOpacity={0.9}
                >
                  <Plus size={32} color={COLORS.black} strokeWidth={2.5} />
                </TouchableOpacity>
            </View>
          ),
        }}
      />

      {/* 4. Estatísticas */}
      <Tabs.Screen
        name="statistics"
        options={{
          title: 'Estatísticas',
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
                <BarChart2 
                size={26} 
                color={focused ? COLORS.white : '#888'} 
                strokeWidth={focused ? 2.5 : 2}
                />
            </View>
          ),
        }}
      />

      {/* 5. Perfil */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
                <User 
                size={26} 
                color={focused ? COLORS.white : '#888'} 
                strokeWidth={focused ? 2.5 : 2}
                />
            </View>
          ),
        }}
      />
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
    height: 70, // Altura ajustada para ficar mais compacto
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // Remove paddings padrão que empurram ícones para cima
    paddingTop: 0,
    paddingBottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%', // Garante que o container do ícone use todo espaço vertical disponível
    top: Platform.OS === 'ios' ? 10 : 0, // Pequeno ajuste no iOS se necessário, senão 0
  },
  centerButtonWrapper: {
    top: -30, // Faz o botão flutuar para fora da barra
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    height: 70, // Mantém a área de toque consistente
    width: 70,
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    // Sombra
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    // Borda grossa da mesma cor da barra para criar o efeito de recorte
    borderWidth: 5,
    borderColor: '#121212', 
  },
});
