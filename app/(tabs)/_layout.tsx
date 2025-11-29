import { Tabs, useRouter } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { House, Box, User, History, Plus } from 'lucide-react-native';
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
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 0, 
          margin: 0,
        },
      }}
    >
      {/* 1. Caixinhas (Esquerda) */}
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Caixinhas',
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
                <Box 
                size={30} 
                color={focused ? COLORS.white : '#666'} 
                strokeWidth={focused ? 2.5 : 2}
                />
            </View>
          ),
        }}
      />

      {/* 2. Home (Centro-Esquerda) - Ajuste de ordem se necessário, mas mantendo a lógica anterior */}
       <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
                <House 
                size={30} 
                color={focused ? COLORS.white : '#666'} 
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

      {/* 4. Histórico (Antigo Estatísticas) */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
                <History 
                size={30} 
                color={focused ? COLORS.white : '#666'} 
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
                size={30} 
                color={focused ? COLORS.white : '#666'} 
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
    height: 70, // Altura ajustada
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    paddingTop: 0,
    paddingBottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    top: Platform.OS === 'ios' ? 10 : 0,
  },
  centerButtonWrapper: {
    top: -35, // Flutua para fora da barra
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    height: 70,
    width: 70,
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
