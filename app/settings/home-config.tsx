import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import { ArrowLeft, LayoutDashboard, Activity, Grid } from 'lucide-react-native';
import { usePreferences, HomeWidgetType } from '../../context/PreferencesContext';

export default function HomeConfigScreen() {
  const router = useRouter();
  const { visibleWidgets, toggleWidget } = usePreferences();

  const renderToggleItem = (
    id: HomeWidgetType, 
    label: string, 
    description: string, 
    Icon: any
  ) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemLeft}>
        <View style={styles.iconBox}>
          <Icon size={20} color={COLORS.black} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.itemLabel}>{label}</Text>
          <Text style={styles.itemDescription}>{description}</Text>
        </View>
      </View>
      
      <Switch
        trackColor={{ false: '#E0E0E0', true: COLORS.primary }}
        thumbColor={COLORS.white}
        ios_backgroundColor="#E0E0E0"
        onValueChange={() => toggleWidget(id)}
        value={visibleWidgets[id]}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurar Início</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Visualização</Text>
        <Text style={styles.sectionSubtitle}>
          Escolha quais seções você deseja ver na sua tela inicial.
        </Text>

        <View style={styles.card}>
          {renderToggleItem(
            'summary',
            'Resumo do Saldo',
            'Mostra seu saldo total e gráfico',
            LayoutDashboard
          )}
          
          <View style={styles.divider} />

          {renderToggleItem(
            'actions',
            'Ações Rápidas',
            'Botões de atalho para pagamentos',
            Grid
          )}

          <View style={styles.divider} />

          {renderToggleItem(
            'recent_activity',
            'Atividade Recente',
            'Lista das suas últimas transações',
            Activity
          )}
        </View>

        <View style={styles.infoBox}>
            <Text style={styles.infoText}>
                As alterações são salvas automaticamente e refletidas na tela inicial imediatamente.
            </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m, // Ajustado para espaçamento vertical simétrico
    backgroundColor: '#F8F9FA',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  content: {
    padding: SPACING.l,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: COLORS.textSecondary,
    marginBottom: SPACING.l,
    lineHeight: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.s,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  itemLabel: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.text,
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray,
    marginVertical: SPACING.m,
  },
  infoBox: {
      marginTop: SPACING.xl,
      padding: SPACING.m,
      backgroundColor: 'rgba(212, 252, 121, 0.2)', // Primary color with opacity
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(212, 252, 121, 0.5)'
  },
  infoText: {
      fontSize: 12,
      color: '#555',
      textAlign: 'center',
      fontFamily: 'Inter_400Regular'
  }
});
