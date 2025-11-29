import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, ActivityIndicator, RefreshControl, SafeAreaView } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from 'expo-router';
import { ShoppingCart, Home, Car, Zap, Coffee, Gift, DollarSign, ArrowUpCircle, ArrowDownCircle, Calendar, Clock } from 'lucide-react-native';
import { Transaction } from '../../types';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function HistoryScreen() {
  const { user } = useAuth();
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Agrupar por data
        const grouped = data.reduce((acc: any, transaction: Transaction) => {
          const date = transaction.created_at.split('T')[0]; // YYYY-MM-DD
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(transaction);
          return acc;
        }, {});

        const sectionsData = Object.keys(grouped).map(date => ({
          title: date,
          data: grouped[date]
        }));

        setSections(sectionsData);
      }
    } catch (error: any) {
      console.log('Error fetching history:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
        case 'mercado': return ShoppingCart;
        case 'casa': return Home;
        case 'transporte': return Car;
        case 'contas': return Zap;
        case 'lazer': return Coffee;
        case 'presentes': return Gift;
        default: return DollarSign;
    }
  };

  const renderSectionHeader = ({ section: { title } }: any) => {
    const date = parseISO(title);
    let label = format(date, "dd 'de' MMMM, yyyy", { locale: ptBR });
    
    if (isToday(date)) label = 'Hoje';
    if (isYesterday(date)) label = 'Ontem';

    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{label}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    const Icon = getCategoryIcon(item.category);
    const isExpense = item.type === 'expense';

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <View style={styles.left}>
          <View style={[styles.iconBox, { backgroundColor: isExpense ? '#FFF0F0' : '#F0FFF4' }]}>
            <Icon size={20} color={isExpense ? COLORS.danger : COLORS.success} />
          </View>
          <View>
            <Text style={styles.description}>{item.description || item.category}</Text>
            <Text style={styles.time}>
              {format(parseISO(item.created_at), 'HH:mm')} • {item.category}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.amount, { color: isExpense ? COLORS.text : COLORS.success }]}>
          {isExpense ? '-' : '+'} {item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Histórico</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
            <Clock size={20} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Calendar size={48} color={COLORS.textLight} />
              <Text style={styles.emptyText}>Nenhuma transação encontrada.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: COLORS.text,
  },
  refreshBtn: {
      padding: 8,
      backgroundColor: COLORS.gray,
      borderRadius: 20
  },
  listContent: {
    paddingHorizontal: SPACING.l,
    paddingBottom: 100,
  },
  sectionHeader: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.m,
    marginTop: SPACING.s,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  time: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: COLORS.textSecondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  amount: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.textSecondary,
  },
});
