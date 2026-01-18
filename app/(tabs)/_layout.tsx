import { Tabs } from 'expo-router';
import React from 'react';
import BottomNavBar from '../../components/BottomNavBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomNavBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      {/* 1. Home (Início) */}
      <Tabs.Screen
        name="index"
        options={{ title: 'Início' }}
      />

      {/* 2. Caixinhas (Carteira) */}
      <Tabs.Screen
        name="wallet"
        options={{ title: 'Caixinhas' }}
      />

      {/* 3. BOTÃO ADICIONAR (Centro) */}
      <Tabs.Screen
        name="add_placeholder"
        options={{ title: 'Adicionar' }}
      />

      {/* 4. Histórico */}
      <Tabs.Screen
        name="history"
        options={{ title: 'Histórico' }}
      />

      {/* 5. Menu (Mais / 3 Pontos) */}
      <Tabs.Screen
        name="menu"
        options={{ title: 'Menu' }}
      />

      {/* -- ROTAS OCULTAS DA BARRA -- */}
      <Tabs.Screen name="chatbot" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />


    </Tabs>
  );
}
