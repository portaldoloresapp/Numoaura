import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, SafeAreaView, Platform, TouchableOpacity, RefreshControl } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { LayoutGrid, SlidersHorizontal, Plus, ChevronDown } from 'lucide-react-native';
import SummaryCard from '../../components/SummaryCard';
import RecentActivity from '../../components/RecentActivity';
import ActionGrid from '../../components/ActionGrid';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import { Transaction } from '../../types';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import AnimatedTouchable from '../../components/AnimatedTouchable';
import Skeleton from '../../components/Skeleton';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { visibleWidgets } = usePreferences();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
            setTransactions(data);

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
    } finally {
        setLoading(false);
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

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="dark" />
      
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
            <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.header}>
              <View style={styles.leftHeader}>
                <AnimatedTouchable 
                  style={styles.iconBtn} 
                  onPress={() => router.push('/(tabs)/menu')}
                >
                  <LayoutGrid size={24} color={COLORS.black} />
                </AnimatedTouchable>
                <AnimatedTouchable 
                  style={styles.iconBtn}
                  onPress={() => router.push('/settings/home-config')}
                >
                  <SlidersHorizontal size={24} color={COLORS.black} />
                </AnimatedTouchable>
              </View>

              <View style={styles.rightHeader}>
                 <AnimatedTouchable 
                    style={styles.profileContainer}
                    onPress={() => router.push('/(tabs)/profile')}
                 >
                    <Image 
                        source={{ uri: user?.user_metadata?.avatar_url || 'https://i.pravatar.cc/150?u=default' }} 
                        style={styles.avatar} 
                    />
                 </AnimatedTouchable>
                 <AnimatedTouchable 
                    style={styles.plusBtn}
                    onPress={() => router.push('/add-transaction')}
                 >
                    <Plus size={20} color={COLORS.white} />
                 </AnimatedTouchable>
              </View>
            </Animated.View>

            {/* Sub Header Info */}
            <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} style={styles.subHeader}>
                <AnimatedTouchable 
                  style={styles.walletSelector}
                  onPress={() => {}}
                >
                    <Text style={styles.walletText}>Conta Principal</Text>
                    <ChevronDown size={16} color={COLORS.black} />
                </AnimatedTouchable>
                <Text style={styles.welcomeText}>Olá, {user?.user_metadata?.full_name?.split(' ')[0] || 'Usuário'}</Text>
            </Animated.View>

            {/* Main Summary Card */}
            {loading ? (
              <View style={{ marginTop: SPACING.s }}>
                 <Skeleton height={200} borderRadius={32} />
              </View>
            ) : (
              visibleWidgets.summary && (
                  <Animated.View entering={FadeInDown.delay(200).duration(600).springify()}>
                    <SummaryCard balance={balance} income={income} expense={expense} />
                  </Animated.View>
              )
            )}
            
            {/* Action Grid */}
            {visibleWidgets.actions && (
                <Animated.View 
                  entering={FadeInDown.delay(300).duration(600).springify()}
                  style={{ marginTop: SPACING.l }}
                >
                    <ActionGrid />
                </Animated.View>
            )}

          </View>

          {/* Recent Activity Section */}
          {visibleWidgets.recent_activity && (
              <Animated.View 
                entering={FadeInUp.delay(400).duration(600).springify()}
                style={{ paddingHorizontal: SPACING.l }}
              >
                {loading ? (
                  <View style={{ gap: 16, marginTop: 16 }}>
                    <Skeleton height={60} borderRadius={16} />
                    <Skeleton height={60} borderRadius={16} />
                    <Skeleton height={60} borderRadius={16} />
                  </View>
                ) : (
                  <RecentActivity transactions={transactions} />
                )}
              </Animated.View>
          )}

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
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
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
    backgroundColor: COLORS.white, // Fundo branco
    borderRadius: 20,
    // Sombras para destaque
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
      padding: 4,
      backgroundColor: COLORS.white, // Fundo branco
      borderRadius: 12,
      paddingHorizontal: 8,
      // Sombras para destaque
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
  },
  walletText: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 14,
      color: COLORS.black
  },
  welcomeText: {
      fontFamily: 'Inter_400Regular',
      fontSize: 14,
      color: COLORS.black,
  },
  emptyState: {
      alignItems: 'center',
      marginTop: 50,
      gap: 8
  },
  emptyStateText: {
      fontFamily: 'Inter_600SemiBold',
      color: COLORS.black
  },
  emptyStateLink: {
      fontFamily: 'Inter_700Bold',
      color: COLORS.black,
      textDecorationLine: 'underline'
  }
});
