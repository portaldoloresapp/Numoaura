import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, User, ArrowLeft, Building2, Camera, Briefcase, Command } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';

type AccountType = 'personal' | 'business';

export default function SignUpScreen() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>('personal');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para escolher o logotipo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setLogoUri(result.assets[0].uri);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    
    try {
      const metadata = {
        full_name: name,
        account_type: accountType,
        avatar_url: logoUri || null 
      };

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;

      if (data.session) {
        Alert.alert('Sucesso', 'Conta criada com sucesso!');
        router.replace('/(tabs)');
      } else if (data.user && !data.session) {
        setLoading(false);
        Alert.alert(
          'Verifique seu Email',
          'Sua conta foi criada! Enviamos um link de confirmação para o seu email.'
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          <View style={styles.topNav}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <ArrowLeft size={24} color={COLORS.white} />
            </TouchableOpacity>
            
            {/* App Logo Small */}
            <View style={styles.appLogoSmall}>
                <Command size={20} color={COLORS.black} />
            </View>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>Escolha o tipo de conta ideal para você</Text>
          </View>

          {/* Account Type Selector */}
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

          <View style={styles.form}>
            
            {/* Business Logo Upload */}
            {accountType === 'business' && (
                <View style={styles.logoUploadContainer}>
                    <TouchableOpacity style={styles.logoButton} onPress={pickImage}>
                        {logoUri ? (
                            <Image source={{ uri: logoUri }} style={styles.logoImage} />
                        ) : (
                            <View style={styles.logoPlaceholder}>
                                <Camera size={24} color={COLORS.textSecondary} />
                                <Text style={styles.logoText}>Logo</Text>
                            </View>
                        )}
                        <View style={styles.editIconBadge}>
                            <Camera size={12} color={COLORS.black} />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.uploadHint}>Toque para adicionar o logo da empresa</Text>
                </View>
            )}

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
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder={accountType === 'personal' ? "Seu Email" : "Email Corporativo"}
                placeholderTextColor={COLORS.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor={COLORS.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
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
  logoUploadContainer: {
      alignItems: 'center',
      marginBottom: SPACING.l
  },
  logoButton: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: '#1E1E1E',
      borderWidth: 1,
      borderColor: '#333',
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden'
  },
  logoImage: {
      width: '100%',
      height: '100%'
  },
  logoPlaceholder: {
      alignItems: 'center',
      gap: 4
  },
  logoText: {
      fontSize: 12,
      color: COLORS.textSecondary,
      fontFamily: 'Inter_600SemiBold'
  },
  editIconBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: COLORS.primary,
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: COLORS.dark
  },
  uploadHint: {
      color: COLORS.textSecondary,
      fontSize: 12,
      marginTop: 8,
      fontFamily: 'Inter_400Regular'
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
