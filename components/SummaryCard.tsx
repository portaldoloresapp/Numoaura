import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { ArrowDown, ArrowUp, RefreshCw, ChevronRight } from 'lucide-react-native';
import Svg, { Path, Circle, G, Text as SvgText } from 'react-native-svg';

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
      {/* Header do Card */}
      <View style={styles.topSection}>
        <View>
          <Text style={styles.label}>Saldo Atual</Text>
          <Text style={styles.balance}>
            {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </Text>
          <View style={styles.changeContainer}>
            <View style={styles.badge}>
              <ArrowUp size={12} color={COLORS.black} />
              <Text style={styles.badgeText}>Entradas: {income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
            </View>
          </View>
        </View>
        
        {/* Botões de Ação Verticais */}
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
        <Svg height="160" width="300" viewBox="0 0 300 160">
            {/* Background Arc */}
            <Path
                d="M 30 150 A 120 120 0 0 1 270 150"
                fill="none"
                stroke="#333"
                strokeWidth="25"
                strokeLinecap="round"
            />
            {/* Colored Segments - Simulated based on balance health */}
            <Path
                d="M 30 150 A 120 120 0 0 1 150 30"
                fill="none"
                stroke={balance > 0 ? COLORS.primary : COLORS.danger} 
                strokeWidth="25"
                strokeLinecap="round"
            />
            
            {/* Icons on Chart */}
            <Circle cx="50" cy="130" r="12" fill={COLORS.black} />
            <G x="44" y="124">
                <SvgText fill="white" fontSize="10" fontWeight="bold" x="50" y="134" textAnchor="middle">$</SvgText>
            </G>
            
            <Circle cx="150" cy="35" r="12" fill={COLORS.black} />
             <G x="145" y="29">
                 <SvgText fill="white" fontSize="10" fontWeight="bold" x="150" y="39" textAnchor="middle">%</SvgText>
            </G>
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
    backgroundColor: COLORS.cardBlack,
    borderRadius: 40,
    padding: SPACING.l,
    marginTop: SPACING.m,
    overflow: 'hidden',
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: COLORS.textSecondary,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    marginBottom: 8,
  },
  balance: {
    color: COLORS.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: COLORS.black,
  },
  actionButtons: {
    backgroundColor: '#2A2A2A',
    borderRadius: 30,
    padding: 6,
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  refreshBtn: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.white,
  },
  chartSection: {
      marginTop: SPACING.m,
      alignItems: 'center',
      justifyContent: 'flex-end',
      height: 150,
      position: 'relative'
  },
  yourAssetBtn: {
      position: 'absolute',
      bottom: 20,
      backgroundColor: '#2A2A2A',
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: '#444',
      gap: 8
  },
  yourAssetText: {
      color: COLORS.textLight,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 12
  }
});
