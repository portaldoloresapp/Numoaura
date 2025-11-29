import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { Plus, Umbrella, Plane, Car, Smartphone } from 'lucide-react-native';

const caixinhas = [
  { 
    id: 1, 
    title: 'Reserva de Emergência', 
    amount: 'R$ 15.000,00', 
    goal: 'R$ 20.000', 
    progress: 0.75, 
    icon: Umbrella,
    color: '#E8F5E9', // Light Green
    iconColor: '#2E7D32'
  },
  { 
    id: 2, 
    title: 'Viagem Europa', 
    amount: 'R$ 5.250,00', 
    goal: 'R$ 15.000', 
    progress: 0.35, 
    icon: Plane,
    color: '#E3F2FD', // Light Blue
    iconColor: '#1565C0'
  },
  { 
    id: 3, 
    title: 'Carro Novo', 
    amount: 'R$ 32.100,00', 
    goal: 'R$ 80.000', 
    progress: 0.40, 
    icon: Car,
    color: '#FFF3E0', // Light Orange
    iconColor: '#EF6C00'
  },
  { 
    id: 4, 
    title: 'Celular Novo', 
    amount: 'R$ 2.800,00', 
    goal: 'R$ 5.000', 
    progress: 0.56, 
    icon: Smartphone,
    color: '#F3E5F5', // Light Purple
    iconColor: '#7B1FA2'
  },
];

export default function CaixinhasList() {
  const handlePress = (title: string) => {
      Alert.alert(title, `Gerenciar caixinha: ${title}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Caixinhas</Text>
        <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => Alert.alert('Nova Caixinha', 'Criar nova meta financeira')}
        >
          <Plus size={16} color={COLORS.white} />
          <Text style={styles.addBtnText}>Criar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {caixinhas.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.card}
            onPress={() => handlePress(item.title)}
            activeOpacity={0.9}
          >
            <View style={styles.cardTop}>
                <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                    <item.icon size={20} color={item.iconColor} />
                </View>
                <Text style={styles.percentage}>{(item.progress * 100).toFixed(0)}%</Text>
            </View>

            <View style={styles.info}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.itemAmount}>{item.amount}</Text>
                <Text style={styles.itemGoal}>Meta: {item.goal}</Text>
            </View>

            <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${item.progress * 100}%`, backgroundColor: item.iconColor }]} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.l,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.m,
    paddingHorizontal: SPACING.l,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: COLORS.text,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.black,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
  },
  addBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  scrollContent: {
    paddingHorizontal: SPACING.l,
    gap: SPACING.m,
    paddingRight: SPACING.l,
  },
  card: {
    width: 150,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    justifyContent: 'space-between',
    height: 160
  },
  cardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.s
  },
  iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center'
  },
  percentage: {
      fontSize: 12,
      fontFamily: 'Inter_700Bold',
      color: COLORS.textSecondary
  },
  info: {
      marginBottom: SPACING.s
  },
  itemTitle: {
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
      color: COLORS.text,
      marginBottom: 4
  },
  itemAmount: {
      fontSize: 16,
      fontFamily: 'Inter_700Bold',
      color: COLORS.text
  },
  itemGoal: {
      fontSize: 10,
      fontFamily: 'Inter_400Regular',
      color: COLORS.textSecondary
  },
  progressBg: {
      height: 6,
      backgroundColor: '#F0F0F0',
      borderRadius: 3,
      overflow: 'hidden'
  },
  progressFill: {
      height: '100%',
      borderRadius: 3
  }
});
