import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Alert, RefreshControl } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { Box, Plus, Umbrella, Plane, Car, Smartphone, Target } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from 'expo-router';
import { Goal } from '../../types';

export default function WalletScreen() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGoals = async () => {
      if (!user) return;
      try {
          const { data, error } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', user.id);
            
          if (error) throw error;
          if (data) setGoals(data);
      } catch (error: any) {
          console.log('Error fetching goals:', error.message);
      }
  };

  useFocusEffect(
      useCallback(() => {
          fetchGoals();
      }, [user])
  );

  const onRefresh = async () => {
      setRefreshing(true);
      await fetchGoals();
      setRefreshing(false);
  };

  const handleAddGoal = async () => {
      // Simulação rápida de criação para teste
      if (!user) return;
      const newGoal = {
          user_id: user.id,
          title: 'Nova Meta',
          target_amount: 5000,
          current_amount: 0,
          icon: 'target',
          color: '#E0F7FA'
      };

      const { error } = await supabase.from('goals').insert(newGoal);
      if (!error) {
          fetchGoals();
          Alert.alert('Sucesso', 'Nova caixinha criada!');
      } else {
          Alert.alert('Erro', 'Não foi possível criar a caixinha.');
      }
  };

  const totalSaved = goals.reduce((acc, curr) => acc + curr.current_amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Caixinhas</Text>
        <TouchableOpacity 
            style={styles.addBtn}
            onPress={handleAddGoal}
        >
            <Plus size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Total Guardado</Text>
          <Text style={styles.summaryValue}>
            {totalSaved.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </Text>
      </View>

      <FlatList
        data={goals}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Você ainda não tem caixinhas.</Text>
                <Text style={styles.emptySubText}>Toque no + para criar uma meta.</Text>
            </View>
        }
        renderItem={({ item }) => {
            const progress = item.target_amount > 0 ? item.current_amount / item.target_amount : 0;
            return (
                <TouchableOpacity style={styles.card} activeOpacity={0.9}>
                    <View style={[styles.iconBox, { backgroundColor: item.color || '#EEE' }]}>
                        <Target size={24} color={COLORS.black} />
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <View style={styles.progressBg}>
                            <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: COLORS.primary }]} />
                        </View>
                        <Text style={styles.cardGoal}>Meta: {item.target_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
                    </View>
                    <View style={styles.amountInfo}>
                        <Text style={styles.cardAmount}>{item.current_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
                        <Text style={styles.percentage}>{(progress * 100).toFixed(0)}%</Text>
                    </View>
                </TouchableOpacity>
            );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: 40
  },
  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING.l,
      marginBottom: SPACING.l
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: COLORS.text,
  },
  addBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.black,
      justifyContent: 'center',
      alignItems: 'center'
  },
  summary: {
      paddingHorizontal: SPACING.l,
      marginBottom: SPACING.l
  },
  summaryLabel: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: COLORS.textSecondary
  },
  summaryValue: {
      fontSize: 32,
      fontFamily: 'Inter_700Bold',
      color: COLORS.primary,
      marginTop: 4
  },
  listContent: {
      paddingHorizontal: SPACING.l,
      gap: SPACING.m,
      paddingBottom: 100
  },
  card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING.m,
      backgroundColor: COLORS.white,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: COLORS.gray,
      gap: SPACING.m,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 2
  },
  iconBox: {
      width: 50,
      height: 50,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center'
  },
  cardInfo: {
      flex: 1,
      gap: 6
  },
  cardTitle: {
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
      color: COLORS.text
  },
  progressBg: {
      height: 4,
      backgroundColor: '#F0F0F0',
      borderRadius: 2,
      width: '100%'
  },
  progressFill: {
      height: '100%',
      borderRadius: 2
  },
  cardGoal: {
      fontSize: 10,
      color: COLORS.textSecondary
  },
  amountInfo: {
      alignItems: 'flex-end',
      gap: 4
  },
  cardAmount: {
      fontSize: 14,
      fontFamily: 'Inter_700Bold',
      color: COLORS.text
  },
  percentage: {
      fontSize: 12,
      fontFamily: 'Inter_600SemiBold',
      color: COLORS.success
  },
  emptyContainer: {
      alignItems: 'center',
      marginTop: 40
  },
  emptyText: {
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      color: COLORS.textSecondary
  },
  emptySubText: {
      fontSize: 14,
      color: COLORS.textLight,
      marginTop: 8
  }
});
