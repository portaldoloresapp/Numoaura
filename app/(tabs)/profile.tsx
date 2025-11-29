import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, Alert } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { Settings, LogOut, ChevronRight, User } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { signOut, user } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: signOut }
      ]
    );
  };

  const menuItems = [
      { id: 1, label: 'Dados Pessoais', icon: User, action: () => {} },
      { id: 2, label: 'Configurações', icon: Settings, action: () => {} },
      { id: 3, label: 'Sair', icon: LogOut, color: COLORS.danger, action: handleLogout },
  ];

  return (
    <SafeAreaView style={styles.container}>
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
                >
                    <View style={styles.menuLeft}>
                        <View style={styles.iconBox}>
                            <item.icon size={20} color={item.color || COLORS.black} />
                        </View>
                        <Text style={[styles.menuText, item.color && { color: item.color }]}>{item.label}</Text>
                    </View>
                    <ChevronRight size={20} color={COLORS.textLight} />
                </TouchableOpacity>
            ))}
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: 40
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
