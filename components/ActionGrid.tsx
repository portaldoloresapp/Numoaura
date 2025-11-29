import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Send, Receipt, Smartphone, Grid } from 'lucide-react-native';
import { COLORS, SPACING } from '../constants/theme';

const actions = [
  { id: 1, label: 'Enviar', icon: Send },
  { id: 2, label: 'Contas', icon: Receipt },
  { id: 3, label: 'Recarga', icon: Smartphone },
  { id: 4, label: 'Mais', icon: Grid },
];

export default function ActionGrid() {
  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <TouchableOpacity key={action.id} style={styles.actionItem}>
          <View style={styles.iconCircle}>
            <action.icon size={20} color={COLORS.black} />
          </View>
          <Text style={styles.label}>{action.label}</Text>
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
  },
  actionItem: {
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
});
