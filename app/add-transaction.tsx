import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { X, ArrowUpCircle, ArrowDownCircle, ShoppingCart, Home, Car, Zap, Coffee, Gift, DollarSign } from 'lucide-react-native';

const categories = [
  { id: 1, name: 'Mercado', icon: ShoppingCart },
  { id: 2, name: 'Casa', icon: Home },
  { id: 3, name: 'Transporte', icon: Car },
  { id: 4, name: 'Contas', icon: Zap },
  { id: 5, name: 'Lazer', icon: Coffee },
  { id: 6, name: 'Presentes', icon: Gift },
];

export default function AddTransactionScreen() {
  const router = useRouter();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const handleSave = () => {
    // Aqui entraria a lógica para salvar no banco de dados
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nova Transação</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <X size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Type Selector */}
        <View style={styles.typeSelector}>
          <TouchableOpacity 
            style={[styles.typeBtn, type === 'expense' && styles.activeExpense]} 
            onPress={() => setType('expense')}
          >
            <ArrowDownCircle size={20} color={type === 'expense' ? COLORS.white : COLORS.textSecondary} />
            <Text style={[styles.typeText, type === 'expense' && styles.activeTypeText]}>Gasto</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.typeBtn, type === 'income' && styles.activeIncome]} 
            onPress={() => setType('income')}
          >
            <ArrowUpCircle size={20} color={type === 'income' ? COLORS.black : COLORS.textSecondary} />
            <Text style={[styles.typeText, type === 'income' && { color: COLORS.black }]}>Ganho</Text>
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>R$</Text>
          <TextInput
            style={[styles.amountInput, { color: type === 'expense' ? COLORS.danger : COLORS.success }]}
            placeholder="0,00"
            placeholderTextColor={COLORS.textLight}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            autoFocus
          />
        </View>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Categoria</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat.id} 
              style={[
                styles.categoryItem, 
                selectedCategory === cat.id && { backgroundColor: COLORS.black }
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <View style={[
                styles.iconCircle,
                selectedCategory === cat.id && { backgroundColor: COLORS.primary }
              ]}>
                <cat.icon size={20} color={COLORS.black} />
              </View>
              <Text style={[
                styles.categoryName,
                selectedCategory === cat.id && { color: COLORS.white }
              ]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Adicionar {type === 'expense' ? 'Gasto' : 'Ganho'}</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contentContainer: {
    flex: 1,
    padding: SPACING.l,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.s,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: COLORS.text,
  },
  closeBtn: {
    padding: 4,
    backgroundColor: COLORS.gray,
    borderRadius: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray,
    borderRadius: BORDER_RADIUS.xl,
    padding: 4,
    marginBottom: SPACING.xl,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.l,
    gap: 8,
  },
  activeExpense: {
    backgroundColor: COLORS.black,
  },
  activeIncome: {
    backgroundColor: COLORS.primary,
  },
  typeText: {
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.textSecondary,
  },
  activeTypeText: {
    color: COLORS.white,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxl,
  },
  currencySymbol: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  amountInput: {
    fontSize: 48,
    fontFamily: 'Inter_700Bold',
    minWidth: 100,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.text,
    marginBottom: SPACING.m,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.m,
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '30%',
    alignItems: 'center',
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    backgroundColor: COLORS.gray,
    gap: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.text,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: SPACING.l,
  },
  saveBtn: {
    backgroundColor: COLORS.black,
    paddingVertical: 18,
    borderRadius: BORDER_RADIUS.l,
    alignItems: 'center',
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
});
