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
  onActionPress?: () => void;
}

export default function SummaryCard({
  balance = 0,
  income = 0,
  expense = 0,
  label = "Saldo Atual",
  onPrevDay,
  onNextDay,
  onToday,
  onActionPress
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
            {/* Income Badge: White Background, Black Text */}
            <View style={[styles.badge, { backgroundColor: COLORS.white }]}>
              <TrendingUp size={12} color={COLORS.black} />
              <Text style={[styles.badgeText, { color: COLORS.black }]}>
                {income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </Text>
            </View>

            {/* Expense Badge: Black Background, White Text (with subtle border for contrast) */}
            <View style={[styles.badge, { backgroundColor: COLORS.black, borderWidth: 1, borderColor: '#333' }]}>
              <TrendingDown size={12} color={COLORS.white} />
              <Text style={[styles.badgeText, { color: COLORS.white }]}>
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
        {(() => {
          // Calcular proporção dinâmica: quanto do arco preencher
          let ratio = 0;
          let endX = 20;
          let endY = 140;

          if (income > 0) {
            // Proporção = (ganhos - perdas) / ganhos
            // Exemplo: ganhos=1000, perdas=100 → (1000-100)/1000 = 0.9 (90%)
            const netAmount = income - expense;
            ratio = Math.max(0, Math.min(1, netAmount / income));

            // Converter proporção em ângulo (0 a 180 graus para semicírculo)
            // O semicírculo vai de 180° (esquerda) até 0° (direita)
            const angle = ratio * 180; // 0 a 180 graus
            const radians = (Math.PI / 180) * angle;

            // Calcular posição final do arco
            // Centro do semicírculo: x=150, y=150
            // Raio: 120
            // Ângulo inicial: 180° (π radianos) - ponto esquerdo
            // Ângulo varia de 180° até 0° (sentido horário)
            const finalAngle = Math.PI - radians;
            endX = 150 + 120 * Math.cos(finalAngle);
            endY = 150 - 120 * Math.sin(finalAngle);
          }

          // Large arc flag: sempre 0 pois estamos desenhando um semicírculo (<= 180 graus)
          const largeArcFlag = 0;

          // Criar path SVG dinâmico
          return (
            <Svg height="180" width="300" viewBox="0 0 300 180">
              {/* Background Arc (cinza) */}
              <Path
                d="M 30 150 A 120 120 0 0 1 270 150"
                fill="none"
                stroke="#333"
                strokeWidth="24"
                strokeLinecap="round"
              />

              {/* Colored Arc (verde - proporção dinâmica) */}
              {ratio > 0 && (
                <Path
                  d={`M 30 150 A 120 120 0 ${largeArcFlag} 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`}
                  fill="none"
                  stroke={COLORS.primary}
                  strokeWidth="24"
                  strokeLinecap="round"
                />
              )}

              {/* Black Dot at the end of progress */}
              {ratio > 0 && (
                <Circle cx={endX} cy={endY} r="10" fill={COLORS.black} />
              )}

              {/* Black Dot at start */}
              <Circle cx="30" cy="150" r="10" fill={COLORS.black} />
            </Svg>
          );
        })()}

        {/* Botão Central */}
        <TouchableOpacity
          style={styles.yourAssetBtn}
          activeOpacity={0.8}
          onPress={onActionPress}
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
    justifyContent: 'center',
    height: 180,
    position: 'relative'
  },
  yourAssetBtn: {
    position: 'absolute',
    bottom: 45,
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
