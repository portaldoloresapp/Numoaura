import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { X, ArrowUpCircle, ArrowDownCircle, ShoppingCart, Home, Car, Zap, Coffee, Gift, Camera } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { analyzeReceipt } from '../lib/gemini';

const categories = [
  { id: 1, name: 'Mercado', icon: ShoppingCart, slug: 'mercado' },
  { id: 2, name: 'Casa', icon: Home, slug: 'casa' },
  { id: 3, name: 'Transporte', icon: Car, slug: 'transporte' },
  { id: 4, name: 'Contas', icon: Zap, slug: 'contas' },
  { id: 5, name: 'Lazer', icon: Coffee, slug: 'lazer' },
  { id: 6, name: 'Presentes', icon: Gift, slug: 'presentes' },
];

export default function AddTransactionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Função para limpar input e aceitar apenas números e vírgula/ponto
  const handleAmountChange = (text: string) => {
    // Remove tudo que não for número, vírgula ou ponto
    const numericValue = text.replace(/[^0-9.,]/g, '');
    setAmount(numericValue);
  };

  const handleSave = async () => {
    if (!amount || !user) {
      Alert.alert('Atenção', 'Preencha o valor.');
      return;
    }

    setLoading(true);

    try {
      // Converter valor para número (substituindo vírgula por ponto)
      const numericAmount = parseFloat(amount.replace(',', '.'));

      if (isNaN(numericAmount)) {
        throw new Error('Valor inválido');
      }

      const categorySlug = categories.find(c => c.id === selectedCategory)?.slug || 'outros';

      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        amount: numericAmount,
        type: type,
        category: categorySlug,
        description: categories.find(c => c.id === selectedCategory)?.name || 'Outros',
      });

      if (error) throw error;

      Alert.alert('Sucesso', 'Transação registrada!');
      router.back();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert("Permissão necessária", "Precisamos de acesso à câmera para escanear recibos.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4], // Opcional, remove se quiser foto inteira
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setAnalyzing(true);
        try {
          const data = await analyzeReceipt(result.assets[0].base64);

          if (data) {
            if (data.amount) setAmount(data.amount.toString().replace('.', ','));
            if (data.description) {
              // Não temos campo description na UI atual, mas vamos tentar mapear a categoria
              // Opcional: Poderiamos ter um state description se existisse campo
            }
            if (data.category_slug) {
              const cat = categories.find(c => c.slug === data.category_slug);
              if (cat) setSelectedCategory(cat.id);
            }
            Alert.alert("Sucesso", `Recibo lido!\nValor: R$ ${data.amount}\nLocal: ${data.description}`);
          } else {
            Alert.alert("Erro", "Não foi possível ler os dados do recibo.");
          }
        } catch (e: any) {
          Alert.alert("Erro na IA", e.message);
        } finally {
          setAnalyzing(false);
        }
      }
    } catch (e) {
      setAnalyzing(false);
      console.log(e);
    }
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

        {/* AI Scan Button */}
        <TouchableOpacity style={styles.scanBtn} onPress={handleScan} disabled={loading || analyzing}>
          {analyzing ? <ActivityIndicator color={COLORS.primary} size="small" /> : <Camera size={20} color={COLORS.primary} />}
          <Text style={styles.scanText}>{analyzing ? 'Analisando...' : 'Escanear Recibo com IA'}</Text>
        </TouchableOpacity>

        {/* Amount Input */}
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>R$</Text>
          <TextInput
            style={[styles.amountInput, { color: type === 'expense' ? COLORS.danger : COLORS.success }]}
            placeholder="0,00"
            placeholderTextColor={COLORS.textLight}
            keyboardType="numeric" // Teclado numérico
            value={amount}
            onChangeText={handleAmountChange}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
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
          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.saveBtnText}>Adicionar {type === 'expense' ? 'Gasto' : 'Ganho'}</Text>
            )}
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
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: SPACING.l,
    backgroundColor: 'rgba(163, 255, 0, 0.1)',
    borderRadius: BORDER_RADIUS.m,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(163, 255, 0, 0.3)',
  },
  scanText: {
    color: COLORS.primary,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
});
