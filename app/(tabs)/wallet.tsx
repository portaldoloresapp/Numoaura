import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { Box, Plus, Umbrella, Plane, Car, Smartphone } from 'lucide-react-native';

const caixinhas = [
  { 
    id: '1', 
    title: 'Reserva de Emergência', 
    amount: 'R$ 15.000,00', 
    goal: 'R$ 20.000', 
    progress: 0.75, 
    icon: Umbrella,
    color: '#E8F5E9', 
    iconColor: '#2E7D32'
  },
  { 
    id: '2', 
    title: 'Viagem Europa', 
    amount: 'R$ 5.250,00', 
    goal: 'R$ 15.000', 
    progress: 0.35, 
    icon: Plane,
    color: '#E3F2FD', 
    iconColor: '#1565C0'
  },
  { 
    id: '3', 
    title: 'Carro Novo', 
    amount: 'R$ 32.100,00', 
    goal: 'R$ 80.000', 
    progress: 0.40, 
    icon: Car,
    color: '#FFF3E0', 
    iconColor: '#EF6C00'
  },
  { 
    id: '4', 
    title: 'Celular Novo', 
    amount: 'R$ 2.800,00', 
    goal: 'R$ 5.000', 
    progress: 0.56, 
    icon: Smartphone,
    color: '#F3E5F5', 
    iconColor: '#7B1FA2'
  },
];

export default function WalletScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Caixinhas</Text>
        <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => Alert.alert('Nova Caixinha', 'Criar nova meta financeira')}
        >
            <Plus size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Total Guardado</Text>
          <Text style={styles.summaryValue}>R$ 55.150,00</Text>
      </View>

      <FlatList
        data={caixinhas}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} activeOpacity={0.9}>
                <View style={[styles.iconBox, { backgroundColor: item.color }]}>
                    <item.icon size={24} color={item.iconColor} />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <View style={styles.progressBg}>
                        <View style={[styles.progressFill, { width: `${item.progress * 100}%`, backgroundColor: item.iconColor }]} />
                    </View>
                    <Text style={styles.cardGoal}>Meta: {item.goal}</Text>
                </View>
                <View style={styles.amountInfo}>
                    <Text style={styles.cardAmount}>{item.amount}</Text>
                    <Text style={styles.percentage}>{(item.progress * 100).toFixed(0)}%</Text>
                </View>
            </TouchableOpacity>
        )}
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
  }
});
