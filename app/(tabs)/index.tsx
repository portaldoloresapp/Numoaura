import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, SafeAreaView, Platform, TouchableOpacity, StatusBar as RNStatusBar, Alert } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { LayoutGrid, SlidersHorizontal, Plus, ChevronDown } from 'lucide-react-native';
import SummaryCard from '../../components/SummaryCard';
import CaixinhasList from '../../components/CaixinhasList';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  const handleFeatureNotImplemented = (feature: string) => {
    Alert.alert('Em Breve', `A funcionalidade ${feature} estará disponível na próxima atualização.`);
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="dark" />
      
      {/* Background Split */}
      <View style={styles.greenBackground} />
      <View style={styles.whiteBackground} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 130 }} // Padding extra para a NavBar flutuante
        >
          <View style={styles.contentContainer}>
            
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.leftHeader}>
                <TouchableOpacity 
                  style={styles.iconBtn} 
                  onPress={() => handleFeatureNotImplemented('Menu')}
                >
                  <LayoutGrid size={24} color={COLORS.black} />
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>New</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.iconBtn}
                  onPress={() => handleFeatureNotImplemented('Configurações')}
                >
                  <SlidersHorizontal size={24} color={COLORS.black} />
                </TouchableOpacity>
              </View>

              <View style={styles.rightHeader}>
                 <TouchableOpacity 
                    style={styles.profileContainer}
                    onPress={() => router.push('/(tabs)/profile')}
                 >
                    <Image 
                        source={{ uri: 'https://i.pravatar.cc/150?u=jacob' }} 
                        style={styles.avatar} 
                    />
                    <View style={styles.notificationDot}>
                        <Text style={styles.notifText}>4</Text>
                    </View>
                 </TouchableOpacity>
                 <TouchableOpacity 
                    style={styles.plusBtn}
                    onPress={() => router.push('/budget-modal')}
                 >
                    <Plus size={20} color={COLORS.white} />
                 </TouchableOpacity>
              </View>
            </View>

            {/* Sub Header Info */}
            <View style={styles.subHeader}>
                <TouchableOpacity 
                  style={styles.walletSelector}
                  onPress={() => handleFeatureNotImplemented('Trocar Conta')}
                >
                    <Text style={styles.walletText}>Conta Principal</Text>
                    <ChevronDown size={16} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.welcomeText}>Olá, Jacob</Text>
            </View>

            {/* Main Summary Card */}
            <SummaryCard />

          </View>

          {/* Caixinhas Section (Nubank Style) */}
          <CaixinhasList />

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  greenBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%', 
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  whiteBackground: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.s,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.l,
  },
  leftHeader: {
    flexDirection: 'row',
    gap: SPACING.m,
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.black,
    borderRadius: 30,
    padding: 4,
    paddingLeft: 4,
    gap: 8
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  newBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: '#6C5CE7', 
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newBadgeText: {
    color: COLORS.white,
    fontSize: 8,
    fontFamily: 'Inter_700Bold',
  },
  profileContainer: {
      position: 'relative'
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.primary
  },
  notificationDot: {
      position: 'absolute',
      top: -4,
      left: -4,
      backgroundColor: COLORS.black,
      width: 16,
      height: 16,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#555'
  },
  notifText: {
      color: COLORS.white,
      fontSize: 8,
      fontFamily: 'Inter_700Bold'
  },
  plusBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 2
  },
  subHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.s
  },
  walletSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      padding: 4
  },
  walletText: {
      fontFamily: 'Inter_400Regular',
      fontSize: 14,
      color: '#333'
  },
  welcomeText: {
      fontFamily: 'Inter_400Regular',
      fontSize: 14,
      color: '#333',
      fontStyle: 'italic'
  }
});
