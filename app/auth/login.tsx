import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, ArrowRight, Command } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import AnimatedTouchable from '../../components/AnimatedTouchable';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        if (error.message.includes('Email not confirmed')) {
            Alert.alert(
                'Email não confirmado', 
                'Verifique sua caixa de entrada (e spam) e clique no link de confirmação antes de entrar.'
            );
        } else if (error.message.includes('Invalid login credentials')) {
            Alert.alert('Acesso Negado', 'Email ou senha incorretos.');
        } else {
            Alert.alert('Erro ao entrar', error.message);
        }
      } else {
        if (data.session) {
            router.replace('/(tabs)');
        }
      }
    } catch (e: any) {
        setLoading(false);
        Alert.alert('Erro', e.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
            
            {/* App Logo Section */}
            <Animated.View entering={FadeInDown.duration(800).springify()} style={styles.logoContainer}>
                <View style={styles.logoBox}>
                    <Command size={40} color={COLORS.black} />
                </View>
                <Text style={styles.appName}>Numoaura</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(100).duration(800).springify()} style={styles.header}>
                <Text style={styles.title}>Bem-vindo de volta</Text>
                <Text style={styles.subtitle}>Entre para gerenciar suas finanças</Text>
            </Animated.View>

            <View style={styles.form}>
            <Animated.View entering={FadeInDown.delay(200).duration(800).springify()} style={styles.inputContainer}>
                <Mail size={20} color={COLORS.textSecondary} />
                <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).duration(800).springify()} style={styles.inputContainer}>
                <Lock size={20} color={COLORS.textSecondary} />
                <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor={COLORS.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).duration(800).springify()}>
                <AnimatedTouchable style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
                    {loading ? (
                    <ActivityIndicator color={COLORS.black} />
                    ) : (
                    <View style={styles.btnContent}>
                        <Text style={styles.loginBtnText}>Entrar</Text>
                        <ArrowRight size={20} color={COLORS.black} />
                    </View>
                    )}
                </AnimatedTouchable>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(500).duration(800).springify()} style={styles.footer}>
                <Text style={styles.footerText}>Não tem uma conta? </Text>
                <Link href="/auth/signup" asChild>
                <TouchableOpacity>
                    <Text style={styles.linkText}>Cadastre-se</Text>
                </TouchableOpacity>
                </Link>
            </Animated.View>
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
    justifyContent: 'center',
  },
  content: {
    padding: SPACING.l,
  },
  logoContainer: {
      alignItems: 'center',
      marginBottom: SPACING.xl
  },
  logoBox: {
      width: 80,
      height: 80,
      backgroundColor: COLORS.primary,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.m,
      transform: [{ rotate: '-10deg' }]
  },
  appName: {
      fontSize: 24,
      fontFamily: 'Inter_700Bold',
      color: COLORS.white,
      letterSpacing: 1
  },
  header: {
    marginBottom: SPACING.xl,
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
  loginBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: BORDER_RADIUS.l,
    alignItems: 'center',
    marginTop: SPACING.m,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginBtnText: {
    color: COLORS.black,
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.l,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontFamily: 'Inter_400Regular',
  },
  linkText: {
    color: COLORS.primary,
    fontFamily: 'Inter_700Bold',
  },
});
