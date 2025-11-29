import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { Wifi, Plus } from 'lucide-react-native';
import { Link } from 'expo-router';

export default function CreditCard() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.dark, '#2C2C2E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.header}>
          <Text style={styles.cardType}>VISA</Text>
          <Link href="/budget-modal" asChild>
            <TouchableOpacity style={styles.budgetButton}>
              <Plus size={14} color={COLORS.black} />
              <Text style={styles.budgetButtonText}>Orçamento</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Saldo Total</Text>
          <Text style={styles.balance}>R$ 27.453,00</Text>
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.cardNumber}>**** **** **** 5452</Text>
            <Text style={styles.cardHolder}>Daved Shawn</Text>
          </View>
          <View style={styles.rightFooter}>
             <Text style={styles.expiry}>Exp 07/26</Text>
             <View style={styles.contactless}>
                <Wifi size={24} color={COLORS.dark} style={{ transform: [{ rotate: '90deg' }] }} />
             </View>
          </View>
        </View>
        
        {/* Decorative Elements */}
        <View style={styles.star1}>
           <Text style={{color: COLORS.primary, fontSize: 20}}>✦</Text>
        </View>
         <View style={styles.star2}>
           <Text style={{color: COLORS.primary, fontSize: 14}}>✦</Text>
        </View>

      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.l,
  },
  card: {
    padding: SPACING.l,
    borderRadius: 32,
    height: 220,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  cardType: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    fontStyle: 'italic',
  },
  budgetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
  },
  budgetButtonText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.black,
  },
  balanceContainer: {
    marginTop: SPACING.s,
    zIndex: 2,
  },
  balanceLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  balance: {
    color: COLORS.white,
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    zIndex: 2,
  },
  cardNumber: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginBottom: 4,
  },
  cardHolder: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  expiry: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginBottom: 8,
    textAlign: 'right',
  },
  rightFooter: {
      alignItems: 'flex-end',
      justifyContent: 'flex-end'
  },
  contactless: {
      backgroundColor: COLORS.primary,
      height: 40,
      width: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center'
  },
  star1: {
      position: 'absolute',
      top: 50,
      right: 80,
      opacity: 0.8
  },
  star2: {
      position: 'absolute',
      bottom: 80,
      right: 120,
      opacity: 0.6
  }
});
