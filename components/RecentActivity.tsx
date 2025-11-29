import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { ShoppingCart, Home, Car, Zap, Utensils } from 'lucide-react-native';

const activities = [
  { id: 1, title: 'Supermercado', date: 'Segunda, 25 Jan', amount: '-R$ 20,00', icon: ShoppingCart, color: '#000' },
  { id: 2, title: 'Aluguel', date: 'Domingo, 24 Jan', amount: '-R$ 500,00', icon: Home, color: '#000' },
  { id: 3, title: 'Uber', date: 'Sábado, 23 Jan', amount: '-R$ 35,00', icon: Car, color: '#000' },
  { id: 4, title: 'Conta de Luz', date: 'Quinta, 21 Jan', amount: '-R$ 40,00', icon: Zap, color: '#000' },
  { id: 5, title: 'Restaurante', date: 'Quarta, 20 Jan', amount: '-R$ 85,00', icon: Utensils, color: '#000' },
];

export default function RecentActivity() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Atividade Recente</Text>
        <Text style={styles.seeAll}>Ver tudo</Text>
      </View>

      <View style={styles.listContainer}>
        {activities.map((item) => (
          <View key={item.id} style={styles.item}>
            <View style={styles.left}>
              <View style={styles.iconContainer}>
                <item.icon size={20} color={COLORS.white} />
              </View>
              <View>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDate}>{item.date}</Text>
              </View>
            </View>
            <Text style={styles.amount}>{item.amount}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: SPACING.l,
    paddingBottom: 100, // Space for bottom tabs
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.l,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.textSecondary,
  },
  listContainer: {
    gap: SPACING.l,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.text,
  },
  itemDate: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  amount: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: COLORS.text,
  },
});
