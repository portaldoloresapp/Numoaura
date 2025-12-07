import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { History, Box, TrendingUp, MoreHorizontal } from 'lucide-react-native';
import { COLORS, SPACING } from '../constants/theme';
import { useRouter } from 'expo-router';

// Definindo as novas ações solicitadas com suas rotas
const actions = [
  { id: 1, label: 'Histórico', icon: History, route: '/(tabs)/history' },
  { id: 2, label: 'Caixinhas', icon: Box, route: '/(tabs)/wallet' },
  { id: 3, label: 'Avançado', icon: TrendingUp, route: '/(tabs)/statistics' }, // "Modo Avançado" abreviado para caber melhor
  { id: 4, label: 'Menu', icon: MoreHorizontal, route: '/(tabs)/menu' },
];

export default function ActionGrid() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <TouchableOpacity 
          key={action.id} 
          style={styles.actionItem}
          onPress={() => router.push(action.route as any)}
          activeOpacity={0.7}
        >
          <View style={styles.iconCircle}>
            <action.icon size={24} color={COLORS.black} />
          </View>
          <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.l,
    paddingHorizontal: 4, // Pequeno ajuste para garantir alinhamento visual
  },
  actionItem: {
    alignItems: 'center',
    gap: 8,
    width: 70, // Largura fixa para garantir alinhamento centralizado do texto
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    // Sombras suaves
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
