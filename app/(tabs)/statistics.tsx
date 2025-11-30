import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { ArrowLeft, MoreHorizontal, TrendingUp } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Transaction } from '../../types';
import { format, subMonths, isSameMonth, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function StatisticsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('Mensal');
  const [loading, setLoading] = useState(true);
  
  // Dados Reais
  const [totalBalance, setTotalBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [incomeGrowth, setIncomeGrowth] = useState(0);

  const filters = ['Hoje', 'Semanal', 'Mensal', 'Anual'];

  const fetchStatistics = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Buscar todas as transações
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        processData(data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const processData = (transactions: Transaction[]) => {
    let totalInc = 0;
    let totalExp = 0;
    
    // 1. Calcular Totais Gerais
    transactions.forEach(t => {
      if (t.type === 'income') totalInc += t.amount;
      else totalExp += t.amount;
    });

    setIncome(totalInc);
    setExpense(totalExp);
    setTotalBalance(totalInc - totalExp);

    // 2. Processar dados para o gráfico (Últimos 4 meses)
    const last4Months = Array.from({ length: 4 }, (_, i) => {
      const d = subMonths(new Date(), 3 - i);
      return {
        date: d,
        label: format(d, 'MMM', { locale: ptBR }).toUpperCase(),
        income: 0,
        expense: 0
      };
    });

    transactions.forEach(t => {
      const tDate = parseISO(t.created_at);
      const monthIndex = last4Months.findIndex(m => isSameMonth(m.date, tDate));
      
      if (monthIndex !== -1) {
        if (t.type === 'income') last4Months[monthIndex].income += t.amount;
        else last4Months[monthIndex].expense += t.amount;
      }
    });

    setMonthlyData(last4Months);

    // 3. Calcular Crescimento de Ganhos (Mês atual vs Mês anterior)
    const currentMonth = last4Months[3];
    const prevMonth = last4Months[2];
    
    if (prevMonth.income > 0) {
      const growth = ((currentMonth.income - prevMonth.income) / prevMonth.income) * 100;
      setIncomeGrowth(growth);
    } else if (currentMonth.income > 0) {
      setIncomeGrowth(100); // 100% se antes era 0
    } else {
      setIncomeGrowth(0);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStatistics();
    }, [user])
  );

  // Encontrar o valor máximo para escalar o gráfico (Considerando a soma para empilhamento)
  const maxChartValue = Math.max(
    ...monthlyData.map(d => d.income + d.expense), 
    100 // Valor mínimo padrão
  ) * 1.1; // 10% de folga no topo para estética

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.paddingWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Modo Avançado</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Filters */}
          <View style={styles.filters}>
            {filters.map((filter) => (
              <TouchableOpacity 
                key={filter} 
                style={[styles.filterItem, activeFilter === filter && styles.activeFilter]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
             <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
          ) : (
            <>
              {/* Widgets Row */}
              <View style={styles.widgetsRow}>
                <View style={styles.earningWidget}>
                  <View style={styles.widgetHeader}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                        <TrendingUp size={16} color={COLORS.black} />
                        <Text style={styles.widgetTitle}>Ganhos</Text>
                    </View>
                    <MoreHorizontal size={16} color={COLORS.textSecondary} />
                  </View>
                  
                  <Text style={styles.percentage}>
                    {incomeGrowth > 0 ? '+' : ''}{incomeGrowth.toFixed(1)}%
                  </Text>
                  
                  <Text style={styles.widgetDesc}>
                    {incomeGrowth >= 0 
                      ? 'Seus ganhos aumentaram comparado ao mês passado.' 
                      : 'Seus ganhos diminuíram comparado ao mês passado.'}
                  </Text>
                  
                  <View style={styles.goalContainer}>
                    <Text style={styles.goalLabel}>Total Mês</Text>
                    <Text style={styles.goalValue}>
                        {monthlyData[3]?.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </Text>
                  </View>
                  
                  {/* Barra de progresso visual baseada no crescimento (simbólica) */}
                  <View style={styles.progressBar}>
                    <View style={[
                        styles.progressFill, 
                        { width: `${Math.min(Math.max(50 + incomeGrowth, 10), 100)}%` }
                    ]} />
                  </View>
                </View>

                <View style={styles.chartWidget}>
                  {/* Gráfico Radar Visual Simplificado (Decorativo) */}
                  <View style={styles.radarChartPlaceholder}>
                      <View style={styles.radarLine1} />
                      <View style={styles.radarLine2} />
                      <View style={styles.radarLine3} />
                      <View style={styles.radarShape} />
                  </View>
                  <View style={styles.chartLabel}>
                      <View style={styles.dot} />
                      <Text style={styles.chartLabelText}>Análise</Text>
                  </View>
                </View>
              </View>

              {/* Overview Chart Section */}
              <Text style={styles.sectionTitle}>Visão Geral</Text>
              
              <View style={styles.overviewCard}>
                <View style={styles.overviewHeader}>
                    <View>
                        <Text style={styles.totalBalanceLabel}>Saldo Total</Text>
                        <Text style={[
                            styles.totalBalanceValue,
                            { color: totalBalance >= 0 ? COLORS.text : COLORS.danger }
                        ]}>
                            {totalBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </Text>
                    </View>
                    <View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: COLORS.black }]} />
                            <Text style={styles.legendText}>Débito (Gastos)</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
                            <Text style={styles.legendText}>Crédito (Ganhos)</Text>
                        </View>
                    </View>
                </View>

                {/* Bar Chart Implementation */}
                <View style={styles.barChartContainer}>
                    <View style={styles.yAxis}>
                        <Text style={styles.axisText}>{Math.round(maxChartValue).toLocaleString()}</Text>
                        <Text style={styles.axisText}>{Math.round(maxChartValue * 0.66).toLocaleString()}</Text>
                        <Text style={styles.axisText}>{Math.round(maxChartValue * 0.33).toLocaleString()}</Text>
                        <Text style={styles.axisText}>0</Text>
                    </View>
                    <View style={styles.barsArea}>
                        {monthlyData.map((data, index) => {
                            const incomeHeight = (data.income / maxChartValue) * 100;
                            const expenseHeight = (data.expense / maxChartValue) * 100;

                            return (
                                <View key={index} style={styles.barGroup}>
                                    <View style={styles.barWrapper}>
                                        {/* Barra de Ganhos (Verde) - Fica no topo */}
                                        <View style={[
                                            styles.barSegment, 
                                            { 
                                                height: `${Math.max(incomeHeight, 1)}%`, 
                                                backgroundColor: COLORS.primary,
                                                marginBottom: 4 // Espaço entre as barras
                                            }
                                        ]} />
                                        {/* Barra de Gastos (Preta) - Fica embaixo */}
                                        <View style={[
                                            styles.barSegment, 
                                            { 
                                                height: `${Math.max(expenseHeight, 1)}%`, 
                                                backgroundColor: COLORS.black, 
                                            }
                                        ]} />
                                    </View>
                                    <Text style={styles.monthText}>{data.label}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  container: {
    flex: 1,
  },
  paddingWrapper: {
    paddingHorizontal: SPACING.l,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.m,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: COLORS.text,
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.l,
  },
  filterItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.white,
  },
  activeFilter: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.textSecondary,
  },
  activeFilterText: {
    color: COLORS.black,
  },
  widgetsRow: {
    flexDirection: 'row',
    gap: SPACING.m,
    marginBottom: SPACING.l,
  },
  earningWidget: {
    flex: 1.5,
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: SPACING.m,
  },
  chartWidget: {
    flex: 1,
    backgroundColor: COLORS.dark,
    borderRadius: 24,
    padding: SPACING.m,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  widgetTitle: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  percentage: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  widgetDesc: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#444',
    marginBottom: 12,
    lineHeight: 14,
  },
  goalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  goalLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  goalValue: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.black,
    borderRadius: 3,
  },
  radarChartPlaceholder: {
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative'
  },
  radarLine1: {
      position: 'absolute',
      width: '100%',
      height: 1,
      backgroundColor: '#333',
      transform: [{rotate: '0deg'}]
  },
  radarLine2: {
      position: 'absolute',
      width: '100%',
      height: 1,
      backgroundColor: '#333',
      transform: [{rotate: '60deg'}]
  },
  radarLine3: {
      position: 'absolute',
      width: '100%',
      height: 1,
      backgroundColor: '#333',
      transform: [{rotate: '-60deg'}]
  },
  radarShape: {
      width: 30,
      height: 30,
      backgroundColor: 'rgba(193, 242, 176, 0.2)',
      borderWidth: 1,
      borderColor: COLORS.primary,
      transform: [{rotate: '45deg'}]
  },
  chartLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 8
  },
  dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: COLORS.primary
  },
  chartLabelText: {
      color: COLORS.white,
      fontSize: 10
  },
  sectionTitle: {
      fontSize: 18,
      fontFamily: 'Inter_700Bold',
      marginBottom: SPACING.m,
      color: COLORS.text
  },
  overviewCard: {
      backgroundColor: COLORS.white,
      borderRadius: 24,
      padding: SPACING.m
  },
  overviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: SPACING.l
  },
  totalBalanceLabel: {
      fontSize: 12,
      color: COLORS.textSecondary,
      fontFamily: 'Inter_400Regular'
  },
  totalBalanceValue: {
      fontSize: 20,
      fontFamily: 'Inter_700Bold',
      color: COLORS.text
  },
  legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 2
  },
  legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4
  },
  legendText: {
      fontSize: 10,
      color: COLORS.textSecondary
  },
  barChartContainer: {
      flexDirection: 'row',
      height: 200, 
      paddingTop: 10
  },
  yAxis: {
      justifyContent: 'space-between',
      paddingRight: 8,
      paddingBottom: 20,
      width: 50
  },
  axisText: {
      fontSize: 10,
      color: '#CCC',
      textAlign: 'right'
  },
  barsArea: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'flex-end',
      paddingBottom: 0
  },
  barGroup: {
      alignItems: 'center',
      gap: 8,
      height: '100%',
      justifyContent: 'flex-end'
  },
  barWrapper: {
      flexDirection: 'column',
      justifyContent: 'flex-end', // Alinha o conteúdo (barras) na base
      alignItems: 'center',
      height: '85%', 
      width: 20
  },
  barSegment: {
      width: 10, // Mais fino conforme imagem
      borderRadius: 4,
      minHeight: 2 
  },
  monthText: {
      fontSize: 10,
      color: COLORS.textSecondary,
      fontFamily: 'Inter_600SemiBold',
      marginTop: 4
  }
});
