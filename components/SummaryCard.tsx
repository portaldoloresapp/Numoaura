import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { ArrowDown, ArrowUp, RefreshCw, ChevronRight } from 'lucide-react-native';
import Svg, { Path, Circle, G, Text as SvgText } from 'react-native-svg';

export default function SummaryCard() {
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
          <Text style={styles.label}>Resumo de Ativos</Text>
          <Text style={styles.balance}>$23.521,32</Text>
          <View style={styles.changeContainer}>
            <Text style={styles.smallBalance}>≈23.521,32</Text>
            <View style={styles.badge}>
              <ArrowUp size={12} color={COLORS.black} />
              <Text style={styles.badgeText}>16.5%</Text>
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
            {/* Colored Segments - Simulated */}
            <Path
                d="M 30 150 A 120 120 0 0 1 90 65"
                fill="none"
                stroke={COLORS.primary} 
                strokeWidth="25"
                strokeLinecap="round"
            />
            <Path
                d="M 95 60 A 120 120 0 0 1 180 40"
                fill="none"
                stroke={COLORS.chartCyan}
                strokeWidth="25"
                strokeLinecap="round"
            />
            <Path
                d="M 185 40 A 120 120 0 0 1 240 80"
                fill="none"
                stroke={COLORS.chartPurple}
                strokeWidth="25"
                strokeLinecap="round"
            />

            {/* Icons on Chart */}
            <Circle cx="50" cy="130" r="12" fill={COLORS.black} />
            <G x="44" y="124">
                <SvgText fill="white" fontSize="10" fontWeight="bold" x="50" y="134" textAnchor="middle">T</SvgText>
            </G>
            
            <Circle cx="150" cy="35" r="12" fill={COLORS.black} />
             <G x="145" y="29">
                 <SvgText fill="white" fontSize="10" fontWeight="bold" x="150" y="39" textAnchor="middle">B</SvgText>
            </G>

            <Circle cx="250" cy="110" r="12" fill={COLORS.black} />
        </Svg>
        
        {/* Botão Central */}
        <TouchableOpacity 
            style={styles.yourAssetBtn}
            onPress={() => handleAction('Ver Todos os Ativos')}
        >
            <Text style={styles.yourAssetText}>Seus Ativos</Text>
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
    fontSize: 36,
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  smallBalance: {
    color: COLORS.textSecondary,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
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
    fontSize: 12,
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
