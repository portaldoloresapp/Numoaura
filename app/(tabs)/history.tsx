import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, RefreshControl, SafeAreaView, ScrollView } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from 'expo-router';
import { ShoppingCart, Home, Car, Zap, Coffee, Gift, DollarSign, Target } from 'lucide-react-native';
import { Transaction } from '../../types';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Animated, { FadeInDown, FadeInRight, Layout } from 'react-native-reanimated';
import AnimatedTouchable from '../../components/AnimatedTouchable';
import Skeleton from '../../components/Skeleton';

const FILTER_CATEGORIES = [
    { id: 'all', label: 'Todos' },
    { id: 'mercado', label: 'Mercado' },
    { id: 'casa', label: 'Casa' },
    { id: 'transporte', label: 'Transporte' },
    { id: 'contas', label: 'Contas' },
    { id: 'lazer', label: 'Lazer' },
    { id: 'presentes', label: 'Presentes' },
    { id: 'investimento', label: 'Investimento' },
    { id: 'outros', label: 'Outros' },
];

export default function HistoryScreen() {
  const { user } = useAuth();
  const [rawTransactions, setRawTransactions] = useState<Transaction[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

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
        setRawTransactions(data);
      }
    } catch (error: any) {
      console.log('Error fetching history:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      if (rawTransactions.length === 0) {
          setSections([]);
          return;
      }

      const filteredData = selectedCategory === 'all' 
        ? rawTransactions 
        : rawTransactions.filter(t => t.category === selectedCategory);

      const grouped = filteredData.reduce((acc: any, transaction: Transaction) => {
        const date = transaction.created_at.split('T')[0];
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

  }, [rawTransactions, selectedCategory]);

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
        case 'investimento': return Target;
        default: return DollarSign;
    }
  };

  const renderSectionHeader = ({ section: { title } }: any) => {
    const date = parseISO(title);
    let label = format(date, "dd 'de' MMMM, yyyy", { locale: ptBR });
    
    if (isToday(date)) label = 'Hoje';
    if (isYesterday(date)) label = 'Ontem';

    return (
      <Animated.View 
        entering={FadeInDown.duration(400)}
        style={styles.sectionHeader}
      >
        <Text style={styles.sectionTitle}>{label}</Text>
      </Animated.View>
    );
  };

  const renderItem = ({ item, index }: { item: Transaction, index: number }) => {
    const Icon = getCategoryIcon(item.category);
    const isExpense = item.type === 'expense';

    return (
      <Animated.View 
        entering={FadeInRight.delay(index * 50).springify()} 
        layout={Layout.springify()}
      >
          <AnimatedTouchable style={styles.card}>
            <View style={styles.left}>
              <View style={styles.iconBox}>
                <Icon size={20} color={COLORS.white} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
                    {item.description || item.category}
                </Text>
                <Text style={styles.time}>
                  {format(parseISO(item.created_at), 'HH:mm')} • {item.category}
                </Text>
              </View>
            </View>
            
            <Text style={[styles.amount, { color: isExpense ? COLORS.text : COLORS.success }]}>
              {isExpense ? '-' : '+'} {item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Text>
          </AnimatedTouchable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Histórico</Text>
      </View>

      {/* Filtros de Categoria */}
      <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.filterContent}
          >
              {FILTER_CATEGORIES.map((cat) => (
                  <AnimatedTouchable 
                    key={cat.id}
                    style={[
                        styles.filterChip,
                        selectedCategory === cat.id && styles.activeFilterChip
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                      <Text style={[
                          styles.filterText,
                          selectedCategory === cat.id && styles.activeFilterText
                      ]}>
                          {cat.label}
                      </Text>
                  </AnimatedTouchable>
              ))}
          </ScrollView>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
            {[1,2,3,4,5].map(i => (
                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 }}>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <Skeleton width={40} height={40} borderRadius={20} />
                        <View style={{ gap: 4 }}>
                            <Skeleton width={120} height={14} />
                            <Skeleton width={80} height={12} />
                        </View>
                    </View>
                    <Skeleton width={80} height={14} />
                </View>
            ))}
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
              <Text style={styles.emptyText}>
                  {selectedCategory === 'all' 
                    ? 'Nenhuma transação encontrada.' 
                    : `Nenhuma transação de ${FILTER_CATEGORIES.find(c => c.id === selectedCategory)?.label}.`}
              </Text>
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
    paddingBottom: SPACING.s,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: COLORS.text,
  },
  filterContainer: {
      paddingBottom: SPACING.m,
      borderBottomWidth: 1,
      borderBottomColor: '#F5F5F5',
  },
  filterContent: {
      paddingHorizontal: SPACING.l,
      gap: 8
  },
  filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: COLORS.gray,
      borderWidth: 1,
      borderColor: 'transparent'
  },
  activeFilterChip: {
      backgroundColor: COLORS.black,
      borderColor: COLORS.black
  },
  filterText: {
      fontSize: 12,
      fontFamily: 'Inter_600SemiBold',
      color: COLORS.textSecondary
  },
  activeFilterText: {
      color: COLORS.white
  },
  listContent: {
    paddingHorizontal: SPACING.l,
    paddingBottom: 150, 
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
    width: '100%',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.dark,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
  },
  description: {
    fontSize: 14,
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
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    flexShrink: 0,
    textAlign: 'right',
  },
  loadingContainer: {
    paddingHorizontal: SPACING.l,
    marginTop: 20
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
    textAlign: 'center'
  },
});
