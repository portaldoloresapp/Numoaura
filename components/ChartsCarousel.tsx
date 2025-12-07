import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import Svg, { Path, Circle, Rect, Text as SvgText } from 'react-native-svg';
import { COLORS, SPACING } from '../constants/theme';
import { Transaction } from '../types';
import { PieChart, BarChart, Activity } from 'lucide-react-native';
import { subDays, isSameDay, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CHART_SIZE = 80;
const RADIUS = CHART_SIZE / 2;
const SLIDE_WIDTH = 130; // Largura fixa do slide para o cálculo do snap

interface ChartsCarouselProps {
  transactions: Transaction[];
}

export default function ChartsCarousel({ transactions }: ChartsCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // --- 1. Gráfico de Pizza (Gastos por Categoria - REAL) ---
  const pieData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);
    
    if (totalExpense === 0) return [];

    const byCategory = expenses.reduce((acc: any, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

    // Top 3 categorias + Outros
    let sorted = Object.entries(byCategory)
      .map(([cat, amount]: any) => ({ category: cat, amount, percent: amount / totalExpense }))
      .sort((a, b) => b.amount - a.amount);

    const top3 = sorted.slice(0, 3);
    const others = sorted.slice(3).reduce((acc, curr) => acc + curr.amount, 0);
    
    if (others > 0) {
      top3.push({ category: 'outros', amount: others, percent: others / totalExpense });
    }

    // Cores para as fatias
    const colors = [COLORS.primary, '#BD00FF', '#00F0FF', '#FFFFFF'];

    // Gerar Paths do SVG
    let startAngle = 0;
    return top3.map((item, index) => {
      const angle = item.percent * 360;
      // Evitar erros de precisão em círculos completos
      const safeAngle = angle >= 360 ? 359.99 : angle;
      const endAngle = startAngle + safeAngle;
      
      const x1 = RADIUS + RADIUS * Math.cos((Math.PI * startAngle) / 180);
      const y1 = RADIUS + RADIUS * Math.sin((Math.PI * startAngle) / 180);
      const x2 = RADIUS + RADIUS * Math.cos((Math.PI * endAngle) / 180);
      const y2 = RADIUS + RADIUS * Math.sin((Math.PI * endAngle) / 180);

      const largeArcFlag = safeAngle > 180 ? 1 : 0;

      const pathData = [
        `M ${RADIUS} ${RADIUS}`,
        `L ${x1} ${y1}`,
        `A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `Z`
      ].join(' ');

      startAngle = endAngle;

      return { ...item, path: pathData, color: colors[index % colors.length] };
    });
  }, [transactions]);

  // --- 2. Gráfico de Barras (Gastos dos Últimos 5 dias - REAL) ---
  const barData = useMemo(() => {
     const last5Days = Array.from({ length: 5 }, (_, i) => subDays(new Date(), 4 - i));
     
     const dailyExpenses = last5Days.map(date => {
         const dayExpenses = transactions
            .filter(t => t.type === 'expense' && isSameDay(parseISO(t.created_at), date))
            .reduce((acc, t) => acc + t.amount, 0);
         return { date, amount: dayExpenses };
     });

     const maxAmount = Math.max(...dailyExpenses.map(d => d.amount));
     // Se não houver gastos, evita divisão por zero
     const scale = maxAmount > 0 ? maxAmount : 1; 

     return dailyExpenses.map(d => ({
         ...d,
         normalized: d.amount / scale, // Valor entre 0 e 1
         label: format(d.date, 'dd')
     }));
  }, [transactions]);

  // --- 3. Gráfico Donut (Taxa de Economia - REAL) ---
  const donutData = useMemo(() => {
      const income = transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
      const expense = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
      
      const saved = income > 0 ? Math.max(0, income - expense) : 0;
      const percent = income > 0 ? saved / income : 0;
      
      // Limitar visualmente a 100%
      const safePercent = Math.min(percent, 1);
      
      const angle = safePercent * 360;
      const largeArc = angle > 180 ? 1 : 0;
      const r = RADIUS - 10; // Raio interno
      
      // Coordenadas (começando do topo -90deg)
      const startX = RADIUS + r * Math.cos((Math.PI * -90) / 180);
      const startY = RADIUS + r * Math.sin((Math.PI * -90) / 180);
      const endX = RADIUS + r * Math.cos((Math.PI * (angle - 90)) / 180);
      const endY = RADIUS + r * Math.sin((Math.PI * (angle - 90)) / 180);

      // Se for 100% ou 0%, tratamos diferente para não quebrar o SVG path
      let path = '';
      if (safePercent >= 0.999) {
          path = `M ${RADIUS} ${RADIUS-r} A ${r} ${r} 0 1 1 ${RADIUS} ${RADIUS+r} A ${r} ${r} 0 1 1 ${RADIUS} ${RADIUS-r}`;
      } else if (safePercent > 0) {
          path = `M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY}`;
      }

      return { percent, path };
  }, [transactions]);

  const slides = [
    { id: 'pie', title: 'Categorias', icon: PieChart },
    { id: 'bar', title: 'Últimos 5 Dias', icon: BarChart },
    { id: 'donut', title: 'Economia', icon: Activity },
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Calcula o índice baseado na largura fixa do slide (SLIDE_WIDTH)
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / SLIDE_WIDTH);
    
    if (index !== activeIndex && index >= 0 && index < slides.length) {
      setActiveIndex(index);
    }
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.chartContainer}>
            {item.id === 'pie' && (
                pieData.length > 0 ? (
                    <Svg height={CHART_SIZE} width={CHART_SIZE} viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}>
                        {pieData.map((slice, i) => (
                            <Path key={i} d={slice.path} fill={slice.color} stroke={COLORS.dark} strokeWidth="2" />
                        ))}
                        <Circle cx={RADIUS} cy={RADIUS} r={RADIUS * 0.4} fill={COLORS.dark} />
                    </Svg>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Sem dados</Text>
                    </View>
                )
            )}

            {item.id === 'bar' && (
                <Svg height={CHART_SIZE} width={CHART_SIZE}>
                    {barData.map((data, i) => {
                        const barWidth = (CHART_SIZE / barData.length) - 4;
                        // Altura mínima de 2px para visualização
                        const barHeight = Math.max(data.normalized * CHART_SIZE, 2); 
                        const x = i * (barWidth + 4) + 2;
                        const y = CHART_SIZE - barHeight;
                        
                        // Destacar o dia atual (último)
                        const isToday = i === 4; 
                        
                        return (
                            <React.Fragment key={i}>
                                <Rect 
                                    x={x} 
                                    y={y} 
                                    width={barWidth} 
                                    height={barHeight} 
                                    fill={isToday ? COLORS.primary : '#444'} 
                                    rx={2}
                                />
                            </React.Fragment>
                        );
                    })}
                </Svg>
            )}

            {item.id === 'donut' && (
                <Svg height={CHART_SIZE} width={CHART_SIZE}>
                    <Circle cx={RADIUS} cy={RADIUS} r={RADIUS - 10} stroke="#333" strokeWidth="6" fill="none" />
                    {donutData.percent > 0 && (
                        <Path 
                            d={donutData.path} 
                            stroke={COLORS.primary} 
                            strokeWidth="6" 
                            fill="none" 
                            strokeLinecap="round" 
                        />
                    )}
                    <SvgText
                        x={RADIUS}
                        y={RADIUS + 4}
                        fill={COLORS.white}
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                    >
                        {(donutData.percent * 100).toFixed(0)}%
                    </SvgText>
                </Svg>
            )}
        </View>

        <View style={styles.labelContainer}>
            <View style={[styles.dot, { backgroundColor: item.id === 'pie' ? COLORS.primary : (item.id === 'bar' ? '#00F0FF' : '#BD00FF') }]} />
            <Text style={styles.labelText}>{item.title}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        // CORREÇÃO DO SWIPE:
        snapToInterval={SLIDE_WIDTH} // Pula exatamente a largura de um item
        decelerationRate="fast"      // Para rapidamente no item
        snapToAlignment="center"     // Centraliza o item
        pagingEnabled={false}        // Desativa a paginação padrão que estava causando o erro
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: 10 }} // Pequeno padding para centralizar melhor
      />
      
      <View style={styles.pagination}>
        {slides.map((_, i) => (
            <View 
                key={i} 
                style={[
                    styles.paginationDot, 
                    activeIndex === i ? styles.activeDot : styles.inactiveDot
                ]} 
            />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark,
    borderRadius: 24,
    paddingVertical: SPACING.m,
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden'
  },
  slide: {
    width: SLIDE_WIDTH, // Usando a constante para garantir consistência
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  chartContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4
  },
  emptyState: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 40,
    borderStyle: 'dashed'
  },
  emptyText: {
    color: '#666',
    fontSize: 10,
    fontFamily: 'Inter_400Regular'
  },
  labelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6
  },
  dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
  },
  labelText: {
      color: COLORS.white,
      fontSize: 12,
      fontFamily: 'Inter_600SemiBold'
  },
  pagination: {
      flexDirection: 'row',
      gap: 4,
      marginTop: 8
  },
  paginationDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
  },
  activeDot: {
      backgroundColor: COLORS.primary,
      width: 12
  },
  inactiveDot: {
      backgroundColor: '#333'
  }
});
