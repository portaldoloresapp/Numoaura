import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

const assets = [
  { 
    id: 1, 
    name: 'Uniswap', 
    symbol: 'UNI', 
    amount: '321.1215', 
    value: '$1 756.86', 
    change: '+2.44%', 
    isPositive: true,
    color: '#FF007A',
  },
  { 
    id: 2, 
    name: 'Swipe', 
    symbol: 'SXP', 
    amount: '1120.193', 
    value: '$427.93', 
    change: '-1.39%', 
    isPositive: false,
    color: '#FF5722', 
  },
  { 
    id: 3, 
    name: 'Bitcoin', 
    symbol: 'BTC', 
    amount: '0.045', 
    value: '$2 890.00', 
    change: '+5.12%', 
    isPositive: true,
    color: '#F7931A',
  },
];

export default function PortfolioList() {
  const handleAssetPress = (assetName: string) => {
      Alert.alert(assetName, `Abrindo detalhes de ${assetName}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meu Portfólio</Text>
        <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => Alert.alert('Adicionar', 'Adicionar novo ativo')}
        >
          <Plus size={16} color={COLORS.white} />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {assets.map((asset) => (
          <TouchableOpacity 
            key={asset.id} 
            style={styles.card}
            onPress={() => handleAssetPress(asset.name)}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: asset.color }]}>
                   <Text style={{color: 'white', fontWeight: 'bold', fontSize: 10}}>{asset.symbol[0]}</Text>
                </View>
                
                {/* Mini Graph */}
                <Svg width="60" height="30" viewBox="0 0 60 30">
                    <Path
                        d={asset.isPositive ? "M0 25 Q 15 25, 30 10 T 60 5" : "M0 5 Q 15 5, 30 20 T 60 25"}
                        fill="none"
                        stroke={asset.isPositive ? COLORS.success : COLORS.danger}
                        strokeWidth="2"
                    />
                </Svg>
            </View>

            <View style={styles.assetInfo}>
                <Text style={styles.assetName}>{asset.name}</Text>
                <View style={[styles.badge, { backgroundColor: asset.isPositive ? '#E8F5E9' : '#FFEBEE' }]}>
                    {asset.isPositive ? <TrendingUp size={10} color={COLORS.success} /> : <TrendingDown size={10} color={COLORS.danger} />}
                    <Text style={[styles.badgeText, { color: asset.isPositive ? COLORS.success : COLORS.danger }]}>
                        {asset.change}
                    </Text>
                </View>
            </View>

            <View style={styles.balanceInfo}>
                <Text style={styles.amount}>{asset.amount} {asset.symbol}</Text>
                <Text style={styles.value}>{asset.value}</Text>
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
    width: 160,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.m,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  assetName: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#999',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  balanceInfo: {
    gap: 2,
  },
  amount: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: COLORS.text,
  },
  value: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: COLORS.textSecondary,
  },
});
