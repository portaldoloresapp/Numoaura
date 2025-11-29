import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, SafeAreaView, Platform, TouchableOpacity, StatusBar as RNStatusBar, Alert, RefreshControl } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { LayoutGrid, SlidersHorizontal, Plus, ChevronDown } from 'lucide-react-native';
import SummaryCard from '../../components/SummaryCard';
import RecentActivity from '../../components/RecentActivity';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Transaction } from '../../types';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    
    try {
        // Fetch transactions
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
            setTransactions(data);

            // Calculate totals
            let totalIncome = 0;
            let totalExpense = 0;

            data.forEach((t: Transaction) => {
                if (t.type === 'income') totalIncome += t.amount;
                else totalExpense += t.amount;
            });

            setIncome(totalIncome);
            setExpense(totalExpense);
            setBalance(totalIncome - totalExpense);
        }

    } catch (error: any) {
        console.error('Error fetching data:', error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [user])
  );

  const onRefresh = async () => {
      setRefreshing(true);
      await fetchData();
      setRefreshing(false);
  };

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
          contentContainerStyle={{ paddingBottom: 130 }}
          refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.black} />
          }
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
                        source={{ uri: user?.user_metadata?.avatar_url || 'https://i.pravatar.cc/150?u=default' }} 
                        style={styles.avatar} 
                    />
                 </TouchableOpacity>
                 <TouchableOpacity 
                    style={styles.plusBtn}
                    onPress={() => router.push('/add-transaction')}
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
                <Text style={styles.welcomeText}>Olá, {user?.user_metadata?.full_name?.split(' ')[0] || 'Usuário'}</Text>
            </View>

            {/* Main Summary Card */}
            <SummaryCard balance={balance} income={income} expense={expense} />

          </View>

          {/* Recent Activity Section */}
          <View style={{ paddingHorizontal: SPACING.l }}>
            <RecentActivity transactions={transactions} />
          </View>

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
