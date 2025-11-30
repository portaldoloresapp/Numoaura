import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { ArrowDown, ArrowUp, RefreshCw, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import AnimatedTouchable from './AnimatedTouchable';

interface SummaryCardProps {
  balance: number;
  income: number;
  expense: number;
  label?: string;
  onPrevDay?: () => void;
  onNextDay?: () => void;
  onToday?: () => void;
}

export default function SummaryCard({ 
  balance = 0, 
  income = 0, 
  expense = 0,
  label = "Saldo Atual",
  onPrevDay,
  onNextDay,
  onToday
}: SummaryCardProps) {

  return (
    <View style={styles.container}>
      <View style={styles.contentRow}>
          {/* Left Side: Balance Info */}
          <View style={styles.leftColumn}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.balance} numberOfLines={1} adjustsFontSizeToFit>
                {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Text>
            
            <View style={styles.badgesRow}>
                <View style={[styles.badge, { backgroundColor: '#E8F5E9' }]}>
                    <TrendingUp size={12} color={COLORS.success} />
                    <Text style={[styles.badgeText, { color: COLORS.success }]}>
                        {income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: '#FFEBEE' }]}>
                    <TrendingDown size={12} color={COLORS.danger} />
                    <Text style={[styles.badgeText, { color: COLORS.danger }]}>
                        {expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </Text>
                </View>
            </View>
          </View>
          
          {/* Right Side: Date Navigation Buttons (Vertical Pill) */}
          <View style={styles.actionButtons}>
            <AnimatedTouchable 
                style={styles.navBtn} 
                onPress={onPrevDay}
            >
                <ArrowDown size={20} color={COLORS.white} />
            </AnimatedTouchable>
            
            <AnimatedTouchable 
                style={[styles.navBtn, styles.todayBtn]}
                onPress={onToday}
            >
                <RefreshCw size={18} color={COLORS.black} />
            </AnimatedTouchable>
            
            <AnimatedTouchable 
                style={styles.navBtn}
                onPress={onNextDay}
            >
                <ArrowUp size={20} color={COLORS.white} />
            </AnimatedTouchable>
          </View>
      </View>

      {/* Gráfico Gauge (Arco) */}
      <View style={styles.chartSection}>
        <Svg height="140" width="280" viewBox="0 0 280 140">
            {/* Background Arc */}
            <Path
                d="M 20 140 A 120 120 0 0 1 260 140"
                fill="none"
                stroke="#333"
                strokeWidth="24"
                strokeLinecap="round"
            />
            {/* Colored Segments */}
            <Path
                d="M 20 140 A 120 120 0 0 1 140 20"
                fill="none"
                stroke={COLORS.primary} 
                strokeWidth="24"
                strokeLinecap="round"
            />
            
            {/* Black Dot at the end of progress */}
            <Circle cx="140" cy="20" r="10" fill={COLORS.black} />
            
            {/* Black Dot at start */}
            <Circle cx="20" cy="140" r="10" fill={COLORS.black} />

        </Svg>
        
        {/* Botão Central */}
        <TouchableOpacity 
            style={styles.yourAssetBtn}
            activeOpacity={0.8}
        >
            <Text style={styles.yourAssetText}>Meus Gastos</Text>
            <ChevronRight size={16} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A', // Fundo escuro suave
    borderRadius: 32,
    padding: SPACING.l,
    paddingRight: SPACING.m, // Menos padding na direita para acomodar a pílula
    marginTop: SPACING.m,
    overflow: 'hidden',
  },
  contentRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: SPACING.s
  },
  leftColumn: {
      flex: 1,
      paddingRight: SPACING.m
  },
  label: {
    color: COLORS.textSecondary,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    marginBottom: 4,
  },
  balance: {
    color: COLORS.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    marginBottom: 12,
    lineHeight: 34
  },
  badgesRow: {
      flexDirection: 'column',
      gap: 6,
      alignItems: 'flex-start'
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  badgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  // Estilos da Pílula Vertical de Navegação
  actionButtons: {
    backgroundColor: '#2A2A2A',
    borderRadius: 30,
    paddingVertical: 6,
    paddingHorizontal: 4,
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexDirection: 'column', // Vertical
    width: 48,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayBtn: {
    backgroundColor: COLORS.white, // Botão do meio branco
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  chartSection: {
      marginTop: SPACING.m,
      alignItems: 'center',
      justifyContent: 'flex-end',
      height: 140,
      position: 'relative'
  },
  yourAssetBtn: {
      position: 'absolute',
      bottom: 10,
      backgroundColor: '#2A2A2A',
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: '#333',
      gap: 8
  },
  yourAssetText: {
      color: COLORS.textLight,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 12
  }
});
