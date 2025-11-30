import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { LogOut } from 'lucide-react-native';

interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const { width } = Dimensions.get('window');

export default function LogoutModal({ visible, onClose, onConfirm, loading }: LogoutModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Fundo escurecido */}
        <TouchableOpacity 
            style={styles.backdrop} 
            activeOpacity={1} 
            onPress={onClose}
        />

        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <LogOut size={32} color={COLORS.danger} />
          </View>
          
          <Text style={styles.title}>Sair da Conta</Text>
          <Text style={styles.message}>
            Tem certeza que deseja desconectar?{'\n'}Você precisará fazer login novamente.
          </Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.confirmButton} 
              onPress={onConfirm}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.confirmText}>Sair</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    width: width * 0.9, 
    maxWidth: 360, // Limite máximo para tablets/desktop
    backgroundColor: COLORS.white,
    borderRadius: 28,
    paddingHorizontal: SPACING.l, 
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: COLORS.text,
    marginBottom: SPACING.s,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.l,
    lineHeight: 20,
    paddingHorizontal: SPACING.s,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.m,
    width: '100%',
    marginTop: SPACING.s,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: COLORS.gray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.text,
    fontSize: 16,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmText: {
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.white,
    fontSize: 16,
  },
});
