import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { Plus, Target } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect, useRouter } from 'expo-router';
import { Goal } from '../../types';
import Animated, { FadeInDown, Layout, FadeOut } from 'react-native-reanimated';
import AnimatedTouchable from '../../components/AnimatedTouchable';
import Skeleton from '../../components/Skeleton';

export default function WalletScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
      if (!user) return;
      try {
          const { data, error } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
            
          if (error) throw error;
          if (data) setGoals(data);
      } catch (error: any) {
          console.log('Error fetching goals:', error.message);
      } finally {
          setLoading(false);
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
      if (!user) return;
      
      const newGoal = {
          user_id: user.id,
          title: 'Nova Meta',
          target_amount: 1000,
          current_amount: 0,
          icon: 'target',
          color: '#E0F7FA'
      };

      const { data, error } = await supabase
        .from('goals')
        .insert(newGoal)
        .select()
        .single();

      if (!error && data) {
          setGoals([data, ...goals]);
          router.push(`/goal/${data.id}`);
      } else {
          Alert.alert('Erro', 'Não foi possível criar a caixinha.');
      }
  };

  const totalSaved = goals.reduce((acc, curr) => acc + curr.current_amount, 0);

  const renderItem = ({ item, index }: { item: Goal, index: number }) => {
    const progress = item.target_amount > 0 ? item.current_amount / item.target_amount : 0;
    
    return (
        <Animated.View 
            entering={FadeInDown.delay(index * 50).springify()} 
            exiting={FadeOut}
            layout={Layout.springify()}
        >
            <AnimatedTouchable 
                style={styles.itemContainer} 
                onPress={() => router.push(`/goal/${item.id}`)}
            >
                <View style={styles.left}>
                    {/* Ícone padronizado com fundo preto igual ao Histórico */}
                    <View style={styles.iconBox}>
                        <Target size={20} color={COLORS.white} />
                    </View>
                    
                    <View style={styles.textContainer}>
                        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                        
                        {/* Barra de Progresso Compacta */}
                        <View style={styles.progressWrapper}>
                            <View style={styles.progressBg}>
                                <View style={[
                                    styles.progressFill, 
                                    { width: `${Math.min(progress * 100, 100)}%` }
                                ]} />
                            </View>
                            <Text style={styles.metaText}>
                                Meta: {item.target_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.right}>
                    <Text style={styles.amountText}>
                        {item.current_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </Text>
                    <Text style={styles.percentageText}>{(progress * 100).toFixed(0)}%</Text>
                </View>
            </AnimatedTouchable>
        </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Caixinhas</Text>
        <AnimatedTouchable 
            style={styles.addBtn}
            onPress={handleAddGoal}
        >
            <Plus size={20} color={COLORS.white} />
        </AnimatedTouchable>
      </View>
      
      <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Total Guardado</Text>
          {loading ? (
              <Skeleton width={150} height={40} style={{ marginTop: 4 }} />
          ) : (
              <Animated.Text 
                entering={FadeInDown.duration(500)}
                style={styles.summaryValue}
              >
                {totalSaved.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </Animated.Text>
          )}
      </View>

      {loading ? (
          <View style={styles.listContent}>
              {[1,2,3].map(i => (
                  <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 }}>
                      <View style={{ flexDirection: 'row', gap: 12 }}>
                          <Skeleton width={40} height={40} borderRadius={20} />
                          <View style={{ gap: 4 }}>
                              <Skeleton width={120} height={14} />
                              <Skeleton width={80} height={12} />
                          </View>
                      </View>
                      <Skeleton width={80} height={14} />
                  </View>
              ))}
          </View>
      ) : (
        <Animated.FlatList
            data={goals}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={renderItem}
            itemLayoutAnimation={Layout.springify()}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Você ainda não tem caixinhas.</Text>
                    <Text style={styles.emptySubText}>Toque no + para criar uma meta.</Text>
                </View>
            }
        />
      )}
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
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2
  },
  summary: {
      paddingHorizontal: SPACING.l,
      marginBottom: SPACING.l,
      paddingBottom: SPACING.m,
      borderBottomWidth: 1,
      borderBottomColor: '#F5F5F5'
  },
  summaryLabel: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: COLORS.textSecondary
  },
  summaryValue: {
      fontSize: 32,
      fontFamily: 'Inter_700Bold',
      color: COLORS.primary, // Mantendo o verde vibrante para o total
      marginTop: 4
  },
  listContent: {
      paddingHorizontal: SPACING.l,
      paddingBottom: 100
  },
  // Estilo de Lista (Igual ao Histórico)
  itemContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: SPACING.m,
      borderBottomWidth: 1,
      borderBottomColor: '#F5F5F5',
      width: '100%',
  },
  left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
      marginRight: 8,
  },
  iconBox: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.dark, // Fundo preto consistente
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
  },
  textContainer: {
      flex: 1,
      gap: 4
  },
  itemTitle: {
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
      color: COLORS.text,
  },
  progressWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8
  },
  progressBg: {
      height: 4,
      backgroundColor: '#F0F0F0',
      borderRadius: 2,
      width: 60
  },
  progressFill: {
      height: '100%',
      backgroundColor: COLORS.primary,
      borderRadius: 2
  },
  metaText: {
      fontSize: 10,
      fontFamily: 'Inter_400Regular',
      color: COLORS.textSecondary
  },
  right: {
      alignItems: 'flex-end',
      gap: 2
  },
  amountText: {
      fontSize: 14,
      fontFamily: 'Inter_700Bold',
      color: COLORS.text,
  },
  percentageText: {
      fontSize: 12,
      fontFamily: 'Inter_600SemiBold',
      color: COLORS.success
  },
  emptyContainer: {
      alignItems: 'center',
      marginTop: 60,
      gap: 8
  },
  emptyText: {
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      color: COLORS.textSecondary
  },
  emptySubText: {
      fontSize: 14,
      color: COLORS.textLight,
  }
});
