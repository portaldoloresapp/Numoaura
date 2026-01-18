import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, User, ArrowLeft, Building2, Briefcase, Command, Link as LinkIcon, Check, X, Image as ImageIcon, Eye, EyeOff } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

type AccountType = 'personal' | 'business';

export default function SignUpScreen() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>('personal');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Refs para navegação entre inputs
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  // Estados para o Logo/Avatar via Link
  const [logoUrl, setLogoUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tempUrl, setTempUrl] = useState('');
  const [imageError, setImageError] = useState(false);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleApplyUrl = () => {
    const trimmedUrl = tempUrl.trim();

    // Fecha o teclado para melhor UX
    Keyboard.dismiss();

    if (!trimmedUrl) {
      setShowUrlInput(false);
      return;
    }

    // Validação simples de URL
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      Alert.alert('URL Inválida', 'O link da imagem deve começar com http:// ou https://');
      return;
    }

    setLogoUrl(trimmedUrl);
    setImageError(false);
    setShowUrlInput(false);
    setTempUrl('');
  };

  const handleToggleUrlInput = () => {
    if (!showUrlInput) {
      // Se estiver abrindo, limpa o tempUrl ou poderia preencher com o atual
      setTempUrl('');
    }
    setShowUrlInput(!showUrlInput);
  };

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);

    try {
      const initialMetadata: any = {
        full_name: name,
        account_type: accountType,
      };

      // Se for conta empresarial e tiver URL de logo, adiciona aos metadados
      if (accountType === 'business' && logoUrl.trim()) {
        initialMetadata.avatar_url = logoUrl.trim();
      }

      // 1. Criar Usuário
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: initialMetadata,
        },
      });

      if (error) throw error;

      setLoading(false);

      if (data.session) {
        Alert.alert('Sucesso', 'Conta criada com sucesso!');
        router.replace('/(tabs)');
      } else if (data.user && !data.session) {
        Alert.alert(
          'Verifique seu Email',
          'Sua conta foi criada! Enviamos um link de confirmação.'
        );
        router.replace('/auth/login');
      }

    } catch (error: any) {
      setLoading(false);
      Alert.alert('Erro ao cadastrar', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>

          <View style={styles.topNav}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={24} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.appLogoSmall}>
              <Command size={20} color={COLORS.black} />
            </View>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>Escolha o tipo de conta ideal para você</Text>
          </View>

          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeBtn, accountType === 'personal' && styles.activeTypeBtn]}
              onPress={() => setAccountType('personal')}
            >
              <User size={20} color={accountType === 'personal' ? COLORS.black : COLORS.textSecondary} />
              <Text style={[styles.typeText, accountType === 'personal' && styles.activeTypeText]}>Pessoal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeBtn, accountType === 'business' && styles.activeTypeBtn]}
              onPress={() => setAccountType('business')}
            >
              <Briefcase size={20} color={accountType === 'business' ? COLORS.black : COLORS.textSecondary} />
              <Text style={[styles.typeText, accountType === 'business' && styles.activeTypeText]}>Empresa</Text>
            </TouchableOpacity>
          </View>

          {/* Seção de Logo para Empresa */}
          {accountType === 'business' && (
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                {logoUrl && !imageError ? (
                  <Image
                    source={{ uri: logoUrl }}
                    style={styles.avatarImage}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <View style={styles.defaultAvatar}>
                    <Command size={40} color={COLORS.black} />
                  </View>
                )}

                {/* Botão de Link */}
                <View style={styles.imageActions}>
                  <TouchableOpacity
                    style={styles.actionBtnCircle}
                    onPress={handleToggleUrlInput}
                  >
                    <LinkIcon size={18} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Input de URL Condicional */}
              {showUrlInput && (
                <View style={styles.urlInputContainer}>
                  <View style={styles.urlInputWrapper}>
                    <ImageIcon size={16} color={COLORS.textSecondary} style={{ marginLeft: 8 }} />
                    <TextInput
                      style={styles.urlInput}
                      placeholder="Cole o link da imagem (https://...)"
                      placeholderTextColor={COLORS.textSecondary}
                      value={tempUrl}
                      onChangeText={setTempUrl}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="url"
                      autoFocus
                      returnKeyType="done"
                      onSubmitEditing={handleApplyUrl}
                    />
                  </View>
                  <TouchableOpacity style={styles.applyUrlBtn} onPress={handleApplyUrl}>
                    <Check size={18} color={COLORS.white} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelUrlBtn} onPress={() => setShowUrlInput(false)}>
                    <X size={18} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}

              {!showUrlInput && (
                <Text style={styles.avatarHint}>
                  {logoUrl ? 'Logo definido via link' : 'Defina o logo da sua empresa (Opcional)'}
                </Text>
              )}
            </View>
          )}

          <View style={styles.form}>

            <View style={styles.inputContainer}>
              {accountType === 'personal' ? (
                <User size={20} color={COLORS.textSecondary} />
              ) : (
                <Building2 size={20} color={COLORS.textSecondary} />
              )}
              <TextInput
                style={styles.input}
                placeholder={accountType === 'personal' ? "Nome Completo" : "Nome da Empresa"}
                placeholderTextColor={COLORS.textSecondary}
                value={name}
                onChangeText={setName}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail size={20} color={COLORS.textSecondary} />
              <TextInput
                ref={emailRef}
                style={styles.input}
                placeholder={accountType === 'personal' ? "Seu Email" : "Email Corporativo"}
                placeholderTextColor={COLORS.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color={COLORS.textSecondary} />
              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor={COLORS.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color={COLORS.textSecondary} />
                ) : (
                  <Eye size={20} color={COLORS.textSecondary} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.signupBtn} onPress={handleSignUp} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={COLORS.black} />
              ) : (
                <Text style={styles.signupBtnText}>
                  {accountType === 'personal' ? 'Criar Conta Pessoal' : 'Criar Conta Empresarial'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40
  },
  content: {
    padding: SPACING.l,
    paddingTop: 60
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.l
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  appLogoSmall: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    marginBottom: SPACING.l,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: COLORS.white,
    marginBottom: SPACING.s,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: COLORS.textSecondary,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: BORDER_RADIUS.l,
    padding: 4,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: '#333'
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.m,
    gap: 8
  },
  activeTypeBtn: {
    backgroundColor: COLORS.primary
  },
  typeText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.textSecondary
  },
  activeTypeText: {
    color: COLORS.black
  },
  // Avatar Styles
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.l
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.s
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary, // Fundo verde limão (Logo Numoaura)
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.primary
  },
  imageActions: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  actionBtnCircle: {
    backgroundColor: COLORS.black, // Botão preto para contraste
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.dark,
  },
  avatarHint: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'Inter_400Regular'
  },
  urlInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 8,
    marginBottom: SPACING.s
  },
  urlInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: BORDER_RADIUS.m,
    height: 44,
    borderWidth: 1,
    borderColor: '#333'
  },
  urlInput: {
    flex: 1,
    paddingHorizontal: SPACING.s,
    height: '100%',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: COLORS.white
  },
  applyUrlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cancelUrlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center'
  },
  form: {
    gap: SPACING.l,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.m,
    gap: SPACING.m,
    borderWidth: 1,
    borderColor: '#333',
  },
  input: {
    flex: 1,
    color: COLORS.white,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  signupBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: BORDER_RADIUS.l,
    alignItems: 'center',
    marginTop: SPACING.m,
  },
  signupBtnText: {
    color: COLORS.black,
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
});
