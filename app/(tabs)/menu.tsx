import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import { User, TrendingUp, SlidersHorizontal, LogOut, ChevronRight, CreditCard, Shield, HelpCircle } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import LogoutModal from '../../components/LogoutModal';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import AnimatedTouchable from '../../components/AnimatedTouchable';

export default function MenuScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);

  const handleLogoutPress = () => {
    setLogoutVisible(true);
  };

  const confirmLogout = async () => {
    setLoadingLogout(true);
    await signOut();
    setLoadingLogout(false);
    setLogoutVisible(false);
  };

  const menuItems = [
    { 
      section: 'Geral',
      items: [
        { id: 'profile', label: 'Perfil', icon: User, route: '/(tabs)/profile' },
        { id: 'stats', label: 'Modo Avançado', icon: TrendingUp, route: '/(tabs)/statistics' },
      ]
    },
    {
      section: 'Configurações',
      items: [
        { 
            id: 'home-config', 
            label: 'Configurar Início', 
            icon: SlidersHorizontal,
            route: '/settings/home-config' 
        },
        { id: 'cards', label: 'Meus Cartões', icon: CreditCard, action: () => Alert.alert('Em breve', 'Gerenciamento de cartões') },
        { id: 'security', label: 'Segurança', icon: Shield, action: () => Alert.alert('Em breve', 'Configurações de segurança') },
        { id: 'help', label: 'Ajuda e Suporte', icon: HelpCircle, action: () => Alert.alert('Em breve', 'Central de ajuda') },
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Simplificado */}
        <Animated.View 
            entering={FadeInDown.duration(600).springify()} 
            style={styles.header}
        >
            <Image 
                source={{ uri: user?.user_metadata?.avatar_url || 'https://i.pravatar.cc/150?u=default' }} 
                style={styles.avatar} 
            />
            <View>
                <Text style={styles.name}>{user?.user_metadata?.full_name || 'Usuário'}</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>
        </Animated.View>

        {/* Menu Sections */}
        {menuItems.map((section, index) => (
          <Animated.View 
            key={index} 
            style={styles.section}
            entering={FadeInDown.delay((index + 1) * 150).duration(600).springify()}
            layout={Layout.springify()}
          >
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item: any, idx) => (
                <AnimatedTouchable 
                  key={item.id} 
                  style={[
                    styles.menuItem, 
                    idx === section.items.length - 1 && styles.lastMenuItem
                  ]}
                  onPress={() => {
                    if (item.route) {
                      router.push(item.route);
                    } else if (item.action) {
                      item.action();
                    }
                  }}
                >
                  <View style={styles.menuLeft}>
                    <View style={styles.iconBox}>
                      <item.icon size={20} color={COLORS.black} />
                    </View>
                    <Text style={styles.menuText}>{item.label}</Text>
                  </View>
                  <ChevronRight size={20} color={COLORS.textLight} />
                </AnimatedTouchable>
              ))}
            </View>
          </Animated.View>
        ))}

        {/* Logout Button */}
        <Animated.View 
            entering={FadeInDown.delay(500).duration(600).springify()}
        >
            <AnimatedTouchable 
                style={styles.logoutBtn} 
                onPress={handleLogoutPress}
            >
                <LogOut size={20} color={COLORS.danger} />
                <Text style={styles.logoutText}>Sair da Conta</Text>
            </AnimatedTouchable>
        </Animated.View>

        <Animated.Text 
            entering={FadeInDown.delay(600).duration(600)}
            style={styles.version}
        >
            Versão 1.2.1
        </Animated.Text>

      </ScrollView>

      {/* Modal de Logout */}
      <LogoutModal 
        visible={logoutVisible}
        onClose={() => setLogoutVisible(false)}
        onConfirm={confirmLogout}
        loading={loadingLogout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 40
  },
  scrollContent: {
    padding: SPACING.l,
    paddingBottom: 100
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    gap: SPACING.m,
    backgroundColor: COLORS.white,
    padding: SPACING.m,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.primary
  },
  name: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: COLORS.text
  },
  email: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: COLORS.textSecondary
  },
  section: {
    marginBottom: SPACING.l
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.textSecondary,
    marginBottom: SPACING.s,
    marginLeft: SPACING.s
  },
  sectionContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray
  },
  lastMenuItem: {
    borderBottomWidth: 0
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.gray,
    justifyContent: 'center',
    alignItems: 'center'
  },
  menuText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.text
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F0',
    padding: SPACING.m,
    borderRadius: 20,
    gap: 8,
    marginTop: SPACING.s,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.1)'
  },
  logoutText: {
    color: COLORS.danger,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16
  },
  version: {
    textAlign: 'center',
    marginTop: SPACING.l,
    color: COLORS.textLight,
    fontSize: 12,
    fontFamily: 'Inter_400Regular'
  }
});
