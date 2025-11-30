import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { ArrowDown, ArrowUp, RefreshCw, ChevronRight } from 'lucide-react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface SummaryCardProps {
  balance: number;
  income: number;
  expense: number;
}

export default function SummaryCard({ balance = 0, income = 0, expense = 0 }: SummaryCardProps) {
  const handleAction = (action: string) => {
    Alert.alert(action, `Você clicou em ${action}`);
  };

  return (
    <TouchableOpacity 
        activeOpacity={0.95}
        onPress={() => handleAction('Detalhes do Saldo')}
        style={styles.container}
    >
      <View style={styles.contentRow}>
          {/* Left Side: Balance Info */}
          <View style={styles.leftColumn}>
            <Text style={styles.label}>Saldo Atual</Text>
            <Text style={styles.balance} numberOfLines={1} adjustsFontSizeToFit>
                {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Text>
            
            <View style={styles.badgeContainer}>
                <View style={styles.badge}>
                <ArrowUp size={14} color={COLORS.black} />
                <Text style={styles.badgeText}>Entradas: {income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
                </View>
            </View>
          </View>
          
          {/* Right Side: Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
                style={styles.actionBtn} 
                onPress={() => handleAction('Depositar')}
            >
                <ArrowDown size={20} color={COLORS.white} />
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={[styles.actionBtn, styles.refreshBtn]}
                onPress={() => handleAction('Trocar / Swap')}
            >
                <RefreshCw size={20} color={COLORS.black} />
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={styles.actionBtn}
                onPress={() => handleAction('Sacar')}
            >
                <ArrowUp size={20} color={COLORS.white} />
            </TouchableOpacity>
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
            
            {/* Black Dot at the end of progress (approximate position for 50%) */}
            <Circle cx="140" cy="20" r="10" fill={COLORS.black} />
            
            {/* Black Dot at start */}
            <Circle cx="20" cy="140" r="10" fill={COLORS.black} />

        </Svg>
        
        {/* Botão Central */}
        <TouchableOpacity 
            style={styles.yourAssetBtn}
            onPress={() => handleAction('Ver Todos os Ativos')}
        >
            <Text style={styles.yourAssetText}>Meus Gastos</Text>
            <ChevronRight size={16} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A', // Fundo escuro suave
    borderRadius: 32,
    padding: SPACING.l,
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
  badgeContainer: {
      flexDirection: 'row',
      alignItems: 'center'
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: COLORS.black,
  },
  actionButtons: {
    backgroundColor: '#2A2A2A',
    borderRadius: 30,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshBtn: {
    backgroundColor: COLORS.white,
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
