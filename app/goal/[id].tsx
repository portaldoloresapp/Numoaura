import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Edit2, Plus, Minus, Target, Trash2 } from 'lucide-react-native';
import { Goal } from '../../types';

export default function GoalDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit Name State
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Transaction State
  const [transactionMode, setTransactionMode] = useState<'deposit' | 'withdraw' | null>(null);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchGoalDetails();
  }, [id]);

  const fetchGoalDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setGoal(data);
      setNewTitle(data.title);
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível carregar a caixinha.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTitle = async () => {
    if (!newTitle.trim()) return;
    
    try {
      const { error } = await supabase
        .from('goals')
        .update({ title: newTitle })
        .eq('id', id);

      if (error) throw error;
      
      setGoal(prev => prev ? { ...prev, title: newTitle } : null);
      setIsEditing(false);
      Alert.alert('Sucesso', 'Nome atualizado!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar o nome.');
    }
  };

  const handleTransaction = async () => {
    if (!amount || !goal || !transactionMode) return;
    
    const value = parseFloat(amount.replace(',', '.'));
    if (isNaN(value) || value <= 0) {
      Alert.alert('Valor inválido', 'Insira um valor maior que zero.');
      return;
    }

    if (transactionMode === 'withdraw' && value > goal.current_amount) {
      Alert.alert('Saldo insuficiente', 'Você não tem esse valor disponível nesta caixinha.');
      return;
    }

    setProcessing(true);
    try {
      const newAmount = transactionMode === 'deposit' 
        ? goal.current_amount + value 
        : goal.current_amount - value;

      const { error } = await supabase
        .from('goals')
        .update({ current_amount: newAmount })
        .eq('id', id);

      if (error) throw error;

      setGoal({ ...goal, current_amount: newAmount });
      setAmount('');
      setTransactionMode(null);
      Alert.alert('Sucesso', `Transação de ${transactionMode === 'deposit' ? 'depósito' : 'resgate'} realizada!`);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao processar transação.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = () => {
      Alert.alert(
          'Excluir Caixinha',
          'Tem certeza que deseja excluir esta meta? O saldo será perdido se não for resgatado antes.',
          [
              { text: 'Cancelar', style: 'cancel' },
              { 
                  text: 'Excluir', 
                  style: 'destructive', 
                  onPress: async () => {
                      const { error } = await supabase.from('goals').delete().eq('id', id);
                      if (!error) {
                          router.back();
                      } else {
                          Alert.alert('Erro', 'Não foi possível excluir.');
                      }
                  }
              }
          ]
      )
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!goal) return null;

  const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) : 0;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <ArrowLeft size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes da Caixinha</Text>
          <TouchableOpacity onPress={handleDelete} style={[styles.iconBtn, { backgroundColor: '#FFF0F0' }]}>
            <Trash2 size={20} color={COLORS.danger} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Title Section */}
          <View style={styles.titleSection}>
            <View style={[styles.iconBox, { backgroundColor: goal.color || '#EEE' }]}>
                <Target size={32} color={COLORS.black} />
            </View>
            
            {isEditing ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.titleInput}
                  value={newTitle}
                  onChangeText={setNewTitle}
                  autoFocus
                />
                <TouchableOpacity onPress={handleUpdateTitle} style={styles.saveBtn}>
                  <Save size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.titleDisplay} onPress={() => setIsEditing(true)}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Edit2 size={16} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo Atual</Text>
            <Text style={styles.balanceValue}>
              {goal.current_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Text>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressLabels}>
                <Text style={styles.progressText}>{(progress * 100).toFixed(1)}% da meta</Text>
                <Text style={styles.progressText}>Meta: {goal.target_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.depositBtn, transactionMode === 'deposit' && styles.activeAction]}
              onPress={() => setTransactionMode(transactionMode === 'deposit' ? null : 'deposit')}
            >
              <Plus size={24} color={COLORS.black} />
              <Text style={styles.actionText}>Adicionar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, styles.withdrawBtn, transactionMode === 'withdraw' && styles.activeAction]}
              onPress={() => setTransactionMode(transactionMode === 'withdraw' ? null : 'withdraw')}
            >
              <Minus size={24} color={COLORS.black} />
              <Text style={styles.actionText}>Resgatar</Text>
            </TouchableOpacity>
          </View>

          {/* Transaction Input Area */}
          {transactionMode && (
            <View style={styles.transactionArea}>
              <Text style={styles.transactionTitle}>
                {transactionMode === 'deposit' ? 'Quanto deseja guardar?' : 'Quanto deseja retirar?'}
              </Text>
              
              <View style={styles.inputWrapper}>
                <Text style={styles.currencyPrefix}>R$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="0,00"
                  placeholderTextColor="#CCC"
                  autoFocus
                />
              </View>

              <TouchableOpacity 
                style={[
                  styles.confirmBtn, 
                  { backgroundColor: transactionMode === 'deposit' ? COLORS.primary : COLORS.black }
                ]}
                onPress={handleTransaction}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={[
                    styles.confirmText,
                    { color: transactionMode === 'deposit' ? COLORS.black : COLORS.white }
                  ]}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? 50 : 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.l,
    marginTop: SPACING.s,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.text,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white, // Fundo branco
    justifyContent: 'center',
    alignItems: 'center',
    // Sombras
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: SPACING.l,
    paddingBottom: 100,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.m,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  titleDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: COLORS.text,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleInput: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: COLORS.text,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    minWidth: 150,
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: COLORS.black,
    padding: 8,
    borderRadius: 20,
  },
  balanceCard: {
    backgroundColor: COLORS.black,
    borderRadius: 32,
    padding: SPACING.l,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginBottom: 8,
  },
  balanceValue: {
    color: COLORS.white,
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    marginBottom: SPACING.l,
  },
  progressContainer: {
    width: '100%',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.m,
    marginBottom: SPACING.xl,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 24,
    gap: 8,
    borderWidth: 1,
  },
  depositBtn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  withdrawBtn: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.gray,
  },
  activeAction: {
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  actionText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: COLORS.black,
  },
  transactionArea: {
    backgroundColor: COLORS.gray,
    borderRadius: 24,
    padding: SPACING.l,
    alignItems: 'center',
    width: '100%',
  },
  transactionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: SPACING.m,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.l,
    width: '100%',
  },
  currencyPrefix: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  amountInput: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: COLORS.text,
    minWidth: 60,
    textAlign: 'left',
    paddingVertical: 0,
  },
  confirmBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  confirmText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
});
