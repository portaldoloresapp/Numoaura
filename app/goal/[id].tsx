import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Edit2, Plus, Minus, Target, Trash2, Check, X } from 'lucide-react-native';
import { Goal } from '../../types';
import { useAuth } from '../../context/AuthContext';
import DeleteModal from '../../components/DeleteModal';

export default function GoalDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para o Modal de Exclusão
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Edit Name State
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Edit Target State
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [newTargetAmount, setNewTargetAmount] = useState('');

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
      setNewTargetAmount(data.target_amount.toString());
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível carregar a caixinha.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // Helper para input numérico
  const handleNumericInput = (text: string, setter: (val: string) => void) => {
      const numericValue = text.replace(/[^0-9.,]/g, '');
      setter(numericValue);
  };

  // Atualizar Título
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
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar o nome.');
    }
  };

  // Atualizar Meta
  const handleUpdateTarget = async () => {
    const targetValue = parseFloat(newTargetAmount.replace(',', '.'));
    
    if (isNaN(targetValue) || targetValue <= 0) {
        Alert.alert('Valor Inválido', 'A meta deve ser maior que zero.');
        return;
    }

    try {
        const { error } = await supabase
            .from('goals')
            .update({ target_amount: targetValue })
            .eq('id', id);

        if (error) throw error;

        setGoal(prev => prev ? { ...prev, target_amount: targetValue } : null);
        setIsEditingTarget(false);
        Alert.alert('Sucesso', 'Meta atualizada!');
    } catch (error) {
        Alert.alert('Erro', 'Falha ao atualizar a meta.');
    }
  };

  const handleTransaction = async () => {
    if (!amount || !goal || !transactionMode || !user) return;
    
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
      // VERIFICAÇÃO DE RESGATE TOTAL
      // Se for saque e o valor for igual (ou muito próximo) ao saldo total
      const isFullWithdrawal = transactionMode === 'withdraw' && Math.abs(value - goal.current_amount) < 0.01;

      if (isFullWithdrawal) {
          // 1. Registrar Transação de Entrada (Reembolso para conta principal)
          const { error: transError } = await supabase
            .from('transactions')
            .insert({
                user_id: user.id,
                amount: value,
                type: 'income', // Entra como dinheiro na conta
                category: 'investimento',
                description: `Resgate Final: ${goal.title}`,
                created_at: new Date().toISOString()
            });

          if (transError) throw transError;

          // 2. Excluir a Caixinha Automaticamente
          const { error: deleteError } = await supabase
            .from('goals')
            .delete()
            .eq('id', id);

          if (deleteError) throw deleteError;

          // UX Melhorada: Navegar apenas após o usuário confirmar a leitura do alerta
          Alert.alert(
              'Caixinha Encerrada', 
              `Você resgatou todo o valor (R$ ${value.toFixed(2)}). A caixinha foi encerrada com sucesso.`,
              [
                  { 
                      text: 'OK', 
                      onPress: () => router.back() 
                  }
              ]
          );
          return;
      }

      // LÓGICA PADRÃO (Depósito ou Resgate Parcial)
      const newAmount = transactionMode === 'deposit' 
        ? goal.current_amount + value 
        : goal.current_amount - value;

      // 1. Atualizar Saldo da Caixinha
      const { error: goalError } = await supabase
        .from('goals')
        .update({ current_amount: newAmount })
        .eq('id', id);

      if (goalError) throw goalError;

      // 2. Criar registro na tabela de Transações
      const transactionType = transactionMode === 'deposit' ? 'expense' : 'income';
      const description = transactionMode === 'deposit' 
        ? `Depósito: ${goal.title}` 
        : `Resgate Parcial: ${goal.title}`;

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
            user_id: user.id,
            amount: value,
            type: transactionType,
            category: 'investimento',
            description: description,
            created_at: new Date().toISOString()
        });

      if (transactionError) {
          console.error('Erro ao criar transação de espelho:', transactionError);
      }

      setGoal({ ...goal, current_amount: newAmount });
      setAmount('');
      setTransactionMode(null);
      
      Alert.alert(
          'Sucesso', 
          transactionMode === 'deposit' 
            ? `R$ ${value.toFixed(2)} guardados!`
            : `R$ ${value.toFixed(2)} resgatados!`
      );

    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao processar transação.');
    } finally {
      setProcessing(false);
    }
  };

  // Função chamada ao clicar no botão de lixeira (Exclusão Manual)
  const handleDeletePress = () => {
      if (!goal) return;
      setDeleteModalVisible(true);
  }

  // Função chamada ao confirmar no modal de exclusão manual
  const confirmDelete = async () => {
      if (!goal || !user) return;

      setDeleting(true);
      try {
          // 1. RESGATE AUTOMÁTICO (Se houver saldo)
          if (goal.current_amount > 0) {
              const { error: refundError } = await supabase
                .from('transactions')
                .insert({
                    user_id: user.id,
                    amount: goal.current_amount,
                    type: 'income',
                    category: 'investimento',
                    description: `Resgate: ${goal.title}`,
                    created_at: new Date().toISOString()
                });

              if (refundError) throw refundError;
          }

          // 2. EXCLUIR A CAIXINHA
          const { error } = await supabase.from('goals').delete().eq('id', id);
          
          if (error) throw error;
          
          setDeleteModalVisible(false);
          
          setTimeout(() => {
             Alert.alert(
                 'Caixinha Excluída', 
                 'Item removido com sucesso.',
                 [{ text: 'OK', onPress: () => router.back() }]
             );
          }, 300);

      } catch (error: any) {
          console.error(error);
          Alert.alert('Erro', 'Não foi possível excluir a caixinha.');
      } finally {
          setDeleting(false);
      }
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

  const deleteMessage = goal.current_amount > 0
    ? `Esta caixinha possui R$ ${goal.current_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. \n\nAo excluir, este valor será resgatado automaticamente para o seu saldo principal.`
    : "Tem certeza que deseja excluir esta meta? Todo o histórico dela será perdido.";

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <ArrowLeft size={24} color={COLORS.black} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Detalhes</Text>
          
          <TouchableOpacity 
            onPress={handleDeletePress} 
            style={[styles.iconBtn, { backgroundColor: '#FFF0F0', borderColor: '#FFEBEE', borderWidth: 1 }]}
          >
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
                  <Check size={18} color={COLORS.white} />
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
                
                {/* EDITAR META */}
                {isEditingTarget ? (
                    <View style={styles.editTargetContainer}>
                        <Text style={[styles.progressText, { marginRight: 4 }]}>Meta: R$</Text>
                        <TextInput 
                            style={styles.targetInput}
                            value={newTargetAmount}
                            onChangeText={(t) => handleNumericInput(t, setNewTargetAmount)}
                            keyboardType="numeric"
                            autoFocus
                        />
                        <TouchableOpacity onPress={handleUpdateTarget} style={styles.smallActionBtn}>
                            <Check size={14} color={COLORS.success} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsEditingTarget(false)} style={styles.smallActionBtn}>
                            <X size={14} color={COLORS.danger} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity 
                        style={styles.targetDisplay} 
                        onPress={() => {
                            setNewTargetAmount(goal.target_amount.toString());
                            setIsEditingTarget(true);
                        }}
                    >
                        <Text style={styles.progressText}>
                            Meta: {goal.target_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </Text>
                        <Edit2 size={12} color={COLORS.textSecondary} style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                )}
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
              <Text style={styles.actionText}>Guardar</Text>
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
                {transactionMode === 'deposit' 
                    ? 'Quanto deseja guardar? (Sai do Saldo Principal)' 
                    : 'Quanto deseja resgatar? (Vai para o Saldo Principal)'}
              </Text>
              
              <View style={styles.inputWrapper}>
                <Text style={styles.currencyPrefix}>R$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={(t) => handleNumericInput(t, setAmount)}
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
                  ]}>
                    {transactionMode === 'withdraw' && parseFloat(amount.replace(',', '.') || '0') >= goal.current_amount 
                        ? 'Resgatar Tudo e Encerrar' 
                        : 'Confirmar'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>

        {/* Modal de Exclusão */}
        <DeleteModal 
            visible={deleteModalVisible}
            onClose={() => setDeleteModalVisible(false)}
            onConfirm={confirmDelete}
            loading={deleting}
            title="Excluir Caixinha"
            message={deleteMessage}
        />
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
    fontFamily: 'Inter_700Bold',
    color: COLORS.text,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    alignItems: 'center',
    marginBottom: 8,
    height: 30,
  },
  progressText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  targetDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  editTargetContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#333',
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 2
  },
  targetInput: {
      color: COLORS.white,
      fontSize: 12,
      fontFamily: 'Inter_600SemiBold',
      minWidth: 50,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.primary,
      padding: 0,
      marginRight: 8
  },
  smallActionBtn: {
      padding: 4,
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
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: SPACING.m,
    textAlign: 'center',
    color: COLORS.text
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
