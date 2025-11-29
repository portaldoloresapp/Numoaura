import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { ShoppingCart, Home, Car, Zap, Utensils, DollarSign, Coffee, Gift } from 'lucide-react-native';
import { Transaction } from '../types';

interface RecentActivityProps {
  transactions: Transaction[];
}

const getIcon = (category: string) => {
    switch(category) {
        case 'mercado': return ShoppingCart;
        case 'casa': return Home;
        case 'transporte': return Car;
        case 'contas': return Zap;
        case 'lazer': return Coffee;
        case 'presentes': return Gift;
        default: return DollarSign;
    }
}

export default function RecentActivity({ transactions }: RecentActivityProps) {
  if (!transactions || transactions.length === 0) {
      return (
          <View style={styles.container}>
              <Text style={styles.emptyText}>Nenhuma atividade recente.</Text>
          </View>
      )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Atividade Recente</Text>
        <Text style={styles.seeAll}>Ver tudo</Text>
      </View>

      <View style={styles.listContainer}>
        {transactions.map((item) => {
          const Icon = getIcon(item.category);
          const isExpense = item.type === 'expense';
          
          return (
            <View key={item.id} style={styles.item}>
                <View style={styles.left}>
                <View style={styles.iconContainer}>
                    <Icon size={20} color={COLORS.white} />
                </View>
                <View>
                    <Text style={styles.itemTitle}>{item.description || item.category}</Text>
                    <Text style={styles.itemDate}>
                        {new Date(item.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </Text>
                </View>
                </View>
                <Text style={[styles.amount, { color: isExpense ? COLORS.text : COLORS.success }]}>
                    {isExpense ? '-' : '+'} {item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.l,
    marginBottom: SPACING.l,
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
    textTransform: 'capitalize'
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
  emptyText: {
      textAlign: 'center',
      color: COLORS.textSecondary,
      marginTop: SPACING.m,
      fontStyle: 'italic'
  }
});
