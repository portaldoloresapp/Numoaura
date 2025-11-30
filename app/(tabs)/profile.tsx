import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { Settings, LogOut, ChevronRight, User, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import LogoutModal from '../../components/LogoutModal';

export default function ProfileScreen() {
  const { signOut, user } = useAuth();
  const router = useRouter();
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
      { id: 1, label: 'Dados Pessoais', icon: User, action: () => {} },
      { id: 2, label: 'Configurações', icon: Settings, action: () => {} },
      { id: 3, label: 'Sair', icon: LogOut, color: COLORS.danger, action: handleLogoutPress },
  ];

  return (
    <SafeAreaView style={styles.container}>
        {/* Barra Superior com Botão Voltar */}
        <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Meu Perfil</Text>
            <View style={{ width: 40 }} /> 
        </View>

        <View style={styles.header}>
            <Image 
                source={{ uri: user?.user_metadata?.avatar_url || 'https://i.pravatar.cc/150?u=default' }} 
                style={styles.avatar} 
            />
            <Text style={styles.name}>{user?.user_metadata?.full_name || 'Usuário'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.menu}>
            {menuItems.map((item) => (
                <TouchableOpacity 
                    key={item.id} 
                    style={styles.menuItem}
                    onPress={item.action}
                    activeOpacity={0.7}
                >
                    <View style={styles.menuLeft}>
                        <View style={[styles.iconBox, item.color ? { backgroundColor: '#FFF0F0' } : {}]}>
                            <item.icon size={20} color={item.color || COLORS.black} />
                        </View>
                        <Text style={[styles.menuText, item.color && { color: item.color }]}>{item.label}</Text>
                    </View>
                    <ChevronRight size={20} color={COLORS.textLight} />
                </TouchableOpacity>
            ))}
        </View>

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
    backgroundColor: COLORS.white,
    paddingTop: 40
  },
  topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING.l,
      marginBottom: SPACING.m
  },
  backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.white, // Fundo branco
      justifyContent: 'center',
      alignItems: 'center',
      // Sombras
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
  },
  screenTitle: {
      fontSize: 18,
      fontFamily: 'Inter_700Bold',
      color: COLORS.text
  },
  header: {
      alignItems: 'center',
      marginBottom: SPACING.xl,
      paddingHorizontal: SPACING.l
  },
  avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: SPACING.m,
      borderWidth: 3,
      borderColor: COLORS.primary,
      backgroundColor: '#EEE'
  },
  name: {
      fontSize: 20,
      fontFamily: 'Inter_700Bold',
      color: COLORS.text
  },
  email: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: COLORS.textSecondary
  },
  menu: {
      paddingHorizontal: SPACING.l
  },
  menuItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: SPACING.m,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.gray
  },
  menuLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12
  },
  iconBox: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.gray,
      justifyContent: 'center',
      alignItems: 'center'
  },
  menuText: {
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      color: COLORS.text
  }
});
