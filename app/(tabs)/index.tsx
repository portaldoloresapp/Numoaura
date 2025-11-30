import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, SafeAreaView, Platform, TouchableOpacity, RefreshControl, Modal } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { LayoutGrid, SlidersHorizontal, Plus, CalendarDays, ChevronDown } from 'lucide-react-native';
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
import { format, parseISO, addDays, subDays, isSameDay, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// Configuração do Calendário para Português
LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { visibleWidgets } = usePreferences();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estado da Data
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  // Formatação abreviada: "21/02"
  const formattedDate = format(selectedDate, 'dd/MM', { locale: ptBR });

  // Lógica para o título do card
  const dateLabel = useMemo(() => {
    if (isToday(selectedDate)) return 'Balanço de Hoje';
    if (isYesterday(selectedDate)) return 'Balanço de Ontem';
    return `Balanço de ${format(selectedDate, 'dd/MM')}`;
  }, [selectedDate]);

  // --- Funções de Navegação de Data ---
  const handlePrevDay = () => {
      setSelectedDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
      setSelectedDate(prev => addDays(prev, 1));
  };

  const handleToday = () => {
      setSelectedDate(new Date());
  };
  // ------------------------------------

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

  // CÁLCULO DINÂMICO DO SALDO DIÁRIO
  const dailyStats = useMemo(() => {
    return transactions.reduce(
        (acc, transaction) => {
            const transactionDate = parseISO(transaction.created_at);
            
            if (isSameDay(transactionDate, selectedDate)) {
                if (transaction.type === 'income') {
                    acc.income += transaction.amount;
                } else {
                    acc.expense += transaction.amount;
                }
            }
            return acc;
        },
        { income: 0, expense: 0 }
    );
  }, [transactions, selectedDate]);

  const dailyBalance = dailyStats.income - dailyStats.expense;

  const onRefresh = async () => {
      setRefreshing(true);
      await fetchData();
      setRefreshing(false);
  };

  const handleDayPress = (day: any) => {
      const date = new Date(day.timestamp); 
      const correctedDate = addDays(date, 1); 
      
      setSelectedDate(correctedDate);
      setShowCalendar(false);
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
                    style={styles.dateDisplay}
                    onPress={() => setShowCalendar(true)}
                >
                    <CalendarDays size={18} color={COLORS.black} />
                    <Text style={styles.dateText}>{formattedDate}</Text>
                    <ChevronDown size={14} color={COLORS.textSecondary} style={{ marginLeft: -4 }} />
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
                    <SummaryCard 
                        balance={dailyBalance} 
                        income={dailyStats.income} 
                        expense={dailyStats.expense}
                        label={dateLabel}
                        onPrevDay={handlePrevDay}
                        onNextDay={handleNextDay}
                        onToday={handleToday}
                    />
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

      {/* Modal de Calendário */}
      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
      >
          <View style={styles.modalOverlay}>
              <TouchableOpacity 
                style={styles.modalBackdrop} 
                activeOpacity={1} 
                onPress={() => setShowCalendar(false)}
              />
              <View style={styles.calendarContainer}>
                  <Calendar
                    current={format(selectedDate, 'yyyy-MM-dd')}
                    onDayPress={handleDayPress}
                    theme={{
                        backgroundColor: COLORS.white,
                        calendarBackground: COLORS.white,
                        textSectionTitleColor: COLORS.textSecondary,
                        selectedDayBackgroundColor: COLORS.primary,
                        selectedDayTextColor: COLORS.black,
                        todayTextColor: COLORS.primary,
                        dayTextColor: COLORS.text,
                        textDisabledColor: '#d9e1e8',
                        dotColor: COLORS.primary,
                        selectedDotColor: COLORS.black,
                        arrowColor: COLORS.black,
                        monthTextColor: COLORS.black,
                        indicatorColor: COLORS.black,
                        textDayFontFamily: 'Inter_400Regular',
                        textMonthFontFamily: 'Inter_700Bold',
                        textDayHeaderFontFamily: 'Inter_600SemiBold',
                    }}
                    markedDates={{
                        [format(selectedDate, 'yyyy-MM-dd')]: { selected: true, disableTouchEvent: true }
                    }}
                  />
              </View>
          </View>
      </Modal>

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
    backgroundColor: COLORS.white,
    borderRadius: 20,
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
  dateDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 8,
      paddingHorizontal: 16,
      backgroundColor: COLORS.white,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: '#F0F0F0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
  },
  dateText: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 14,
      color: COLORS.black,
  },
  welcomeText: {
      fontFamily: 'Inter_400Regular',
      fontSize: 14,
      color: COLORS.black,
  },
  // Modal Styles
  modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
  },
  calendarContainer: {
      width: '90%',
      backgroundColor: COLORS.white,
      borderRadius: 24,
      padding: SPACING.m,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
  }
});
