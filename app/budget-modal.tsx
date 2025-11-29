import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../constants/theme';
import { X, Receipt } from 'lucide-react-native';
import Slider from '@react-native-community/slider';

export default function BudgetModal() {
  const router = useRouter();
  const [budget, setBudget] = useState(14000);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                <X size={16} color={COLORS.white} />
                <Text style={styles.closeText}>Fechar</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
            <View style={styles.iconWrapper}>
                <Receipt size={40} color={COLORS.textSecondary} />
            </View>
            
            <Text style={styles.title}>Definir Orçamento Mensal</Text>
            <Text style={styles.subtitle}>ORÇAMENTO MENSAL</Text>
            
            <Text style={styles.amount}>R$ {budget.toFixed(0)}</Text>

            <View style={styles.sliderContainer}>
                <Slider
                    style={{width: '100%', height: 40}}
                    minimumValue={0}
                    maximumValue={50000}
                    minimumTrackTintColor={COLORS.black}
                    maximumTrackTintColor="#E0E0E0"
                    thumbTintColor={COLORS.primary}
                    value={budget}
                    onValueChange={setBudget}
                />
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.clearBtn} onPress={() => setBudget(0)}>
                    <Text style={styles.clearText}>Limpar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.setBtn} onPress={() => router.back()}>
                    <Text style={styles.setText}>Definir</Text>
                </TouchableOpacity>
            </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: SPACING.l,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 32,
    padding: SPACING.l,
    minHeight: 450,
  },
  header: {
    alignItems: 'flex-end',
  },
  closeBtn: {
    backgroundColor: COLORS.black,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  closeText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  content: {
      alignItems: 'center',
      marginTop: SPACING.m
  },
  iconWrapper: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: COLORS.black,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.l,
      borderWidth: 4,
      borderColor: COLORS.white,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5
  },
  title: {
      fontSize: 20,
      fontFamily: 'Inter_700Bold',
      color: COLORS.text,
      marginBottom: 8,
      textAlign: 'center'
  },
  subtitle: {
      fontSize: 10,
      fontFamily: 'Inter_600SemiBold',
      color: COLORS.textSecondary,
      letterSpacing: 1,
      marginBottom: SPACING.l
  },
  amount: {
      fontSize: 32,
      fontFamily: 'Inter_700Bold',
      color: COLORS.primary,
      marginBottom: SPACING.l
  },
  sliderContainer: {
      width: '100%',
      marginBottom: SPACING.xl
  },
  actions: {
      flexDirection: 'row',
      width: '100%',
      gap: SPACING.m
  },
  clearBtn: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 16,
      backgroundColor: COLORS.dark,
      alignItems: 'center'
  },
  clearText: {
      color: COLORS.white,
      fontFamily: 'Inter_600SemiBold'
  },
  setBtn: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 16,
      backgroundColor: COLORS.primary,
      alignItems: 'center'
  },
  setText: {
      color: COLORS.black,
      fontFamily: 'Inter_600SemiBold'
  }
});
