import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { ArrowLeft, MoreHorizontal, TrendingUp } from 'lucide-react-native';
import { Link, useRouter } from 'expo-router';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';

export default function StatisticsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = React.useState('Mensal');

  const filters = ['Hoje', 'Semanal', 'Mensal', 'Anual'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.paddingWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Estatísticas</Text>
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
              <Text style={styles.percentage}>24%</Text>
              <Text style={styles.widgetDesc}>
                Seus ganhos aumentaram 24% comparado ao mês passado.
              </Text>
              <View style={styles.goalContainer}>
                <Text style={styles.goalLabel}>Meta</Text>
                <Text style={styles.goalValue}>$2675/5000</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '54%' }]} />
              </View>
            </View>

            <View style={styles.chartWidget}>
               {/* Simplified Chart Visual */}
               <View style={styles.radarChartPlaceholder}>
                  <View style={styles.radarLine1} />
                  <View style={styles.radarLine2} />
                  <View style={styles.radarLine3} />
                  <View style={styles.radarShape} />
               </View>
               <View style={styles.chartLabel}>
                   <View style={styles.dot} />
                   <Text style={styles.chartLabelText}>Débito</Text>
               </View>
            </View>
          </View>

          {/* Overview Chart Section */}
          <Text style={styles.sectionTitle}>Visão Geral</Text>
          
          <View style={styles.overviewCard}>
             <View style={styles.overviewHeader}>
                <View>
                    <Text style={styles.totalBalanceLabel}>Saldo Total</Text>
                    <Text style={styles.totalBalanceValue}>$27.453,00</Text>
                </View>
                <View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: COLORS.black }]} />
                        <Text style={styles.legendText}>Débito</Text>
                    </View>
                     <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
                        <Text style={styles.legendText}>Crédito</Text>
                    </View>
                </View>
             </View>

             {/* Bar Chart Implementation */}
             <View style={styles.barChartContainer}>
                <View style={styles.yAxis}>
                    <Text style={styles.axisText}>$3500</Text>
                    <Text style={styles.axisText}>$3000</Text>
                    <Text style={styles.axisText}>$2500</Text>
                    <Text style={styles.axisText}>$2000</Text>
                </View>
                <View style={styles.barsArea}>
                    {['JAN', 'FEV', 'MAR', 'ABR'].map((month, index) => (
                        <View key={month} style={styles.barGroup}>
                            <View style={styles.barWrapper}>
                                <View style={[styles.barSegment, { height: 30 + (index * 10), backgroundColor: COLORS.primary }]} />
                                <View style={[styles.barSegment, { height: 20 + (index * 15), backgroundColor: COLORS.black, marginTop: 4 }]} />
                            </View>
                            <Text style={styles.monthText}>{month}</Text>
                        </View>
                    ))}
                </View>
             </View>

          </View>
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
      height: 150
  },
  yAxis: {
      justifyContent: 'space-between',
      paddingRight: 8,
      paddingBottom: 20
  },
  axisText: {
      fontSize: 10,
      color: '#CCC'
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
      gap: 8
  },
  barWrapper: {
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'center'
  },
  barSegment: {
      width: 12,
      borderRadius: 4
  },
  monthText: {
      fontSize: 10,
      color: COLORS.textSecondary,
      fontFamily: 'Inter_600SemiBold'
  }
});
