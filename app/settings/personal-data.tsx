import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  Alert, 
  ScrollView, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { ArrowLeft, Camera, User, Lock, Save, Mail, Link as LinkIcon, Check, X } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { uploadImageToSupabase } from '../../lib/storage';
import { useAuth } from '../../context/AuthContext';

export default function PersonalDataScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Estados para Link de Imagem
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tempUrl, setTempUrl] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || '');
      setAvatarUrl(user.user_metadata?.avatar_url || null);
    }
  }, [user]);

  // --- Lógica de Upload (Galeria) ---
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para alterar sua foto.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        handleImageUpload(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const handleImageUpload = async (imageAsset: ImagePicker.ImagePickerAsset) => {
    if (!user) return;
    setUploadingImage(true);
    setShowUrlInput(false); // Esconde o input de link se estiver aberto

    try {
      const publicUrl = await uploadImageToSupabase(user.id, imageAsset.uri);
      
      if (publicUrl) {
        setAvatarUrl(publicUrl);
        // Atualiza imediatamente no Supabase para uploads
        const { error } = await supabase.auth.updateUser({
            data: { avatar_url: publicUrl }
        });
        
        if (error) throw error;
        Alert.alert('Sucesso', 'Foto de perfil atualizada!');
      }
    } catch (error: any) {
      console.log('Erro ao salvar metadados:', error);
      Alert.alert('Erro', 'A imagem foi enviada, mas falhou ao atualizar seu perfil.');
    } finally {
      setUploadingImage(false);
    }
  };

  // --- Lógica de Link Direto ---
  const handleApplyUrl = () => {
    if (!tempUrl.trim()) {
        setShowUrlInput(false);
        return;
    }
    // Atualiza o preview visualmente
    setAvatarUrl(tempUrl);
    setShowUrlInput(false);
    setTempUrl('');
    Alert.alert('Preview Atualizado', 'A imagem foi carregada. Clique em "Salvar Alterações" para confirmar.');
  };

  // --- Salvar Geral (Nome + Avatar Link) ---
  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Atenção', 'O nome não pode ficar vazio.');
      return;
    }

    setLoadingProfile(true);
    try {
      // Atualiza tanto o nome quanto a URL (caso tenha sido alterada via Link)
      const { error } = await supabase.auth.updateUser({
        data: { 
            full_name: name,
            avatar_url: avatarUrl 
        }
      });
      
      if (error) throw error;
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Atenção', 'Preencha os campos de senha.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoadingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!user?.email) return;
    
    Alert.alert(
      'Redefinir Senha',
      `Enviaremos um e-mail para ${user.email} com instruções.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Enviar', 
          onPress: async () => {
            const { error } = await supabase.auth.resetPasswordForEmail(user.email!);
            if (error) Alert.alert('Erro', error.message);
            else Alert.alert('E-mail enviado', 'Verifique sua caixa de entrada.');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dados Pessoais</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Image 
                key={avatarUrl} // Força re-render se URL mudar
                source={{ uri: avatarUrl || 'https://i.pravatar.cc/150?u=default' }} 
                style={styles.avatar} 
              />
              
              {/* Botões de Ação da Imagem */}
              <View style={styles.imageActions}>
                  {/* Botão Galeria */}
                  <TouchableOpacity 
                    style={styles.actionBtnCircle} 
                    onPress={pickImage}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Camera size={18} color={COLORS.white} />
                    )}
                  </TouchableOpacity>

                  {/* Botão Link */}
                  <TouchableOpacity 
                    style={[styles.actionBtnCircle, { backgroundColor: COLORS.primary }]} 
                    onPress={() => setShowUrlInput(!showUrlInput)}
                    disabled={uploadingImage}
                  >
                    <LinkIcon size={18} color={COLORS.black} />
                  </TouchableOpacity>
              </View>
            </View>
            
            {/* Input de URL Condicional */}
            {showUrlInput && (
                <View style={styles.urlInputContainer}>
                    <TextInput 
                        style={styles.urlInput}
                        placeholder="Cole o link da imagem aqui..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={tempUrl}
                        onChangeText={setTempUrl}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity style={styles.applyUrlBtn} onPress={handleApplyUrl}>
                        <Check size={18} color={COLORS.white} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelUrlBtn} onPress={() => setShowUrlInput(false)}>
                        <X size={18} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>
            )}

            <Text style={styles.emailText}>{user?.email}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações Básicas</Text>
            
            <View style={styles.inputContainer}>
              <User size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nome Completo"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            <TouchableOpacity 
              style={styles.saveBtn} 
              onPress={handleUpdateProfile}
              disabled={loadingProfile}
            >
              {loadingProfile ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Save size={20} color={COLORS.white} />
                  <Text style={styles.saveBtnText}>Salvar Alterações</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Segurança</Text>
            <Text style={styles.sectionSubtitle}>Alterar Senha</Text>

            <View style={styles.inputContainer}>
              <Lock size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nova Senha"
                placeholderTextColor={COLORS.textLight}
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirmar Nova Senha"
                placeholderTextColor={COLORS.textLight}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={[styles.saveBtn, styles.passwordBtn]} 
              onPress={handleChangePassword}
              disabled={loadingPassword}
            >
              {loadingPassword ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.saveBtnText}>Atualizar Senha</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.forgotBtn} onPress={handleForgotPassword}>
              <Mail size={16} color={COLORS.primary} />
              <Text style={styles.forgotText}>Esqueci minha senha</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: COLORS.text,
  },
  content: {
    padding: SPACING.l,
    paddingBottom: 100,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.s,
    alignItems: 'center'
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.gray,
    backgroundColor: '#EEE'
  },
  imageActions: {
      position: 'absolute',
      bottom: 0,
      flexDirection: 'row',
      gap: 8
  },
  actionBtnCircle: {
    backgroundColor: COLORS.black,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  urlInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      marginTop: SPACING.m,
      marginBottom: SPACING.s,
      gap: 8
  },
  urlInput: {
      flex: 1,
      backgroundColor: COLORS.gray,
      borderRadius: BORDER_RADIUS.m,
      paddingHorizontal: SPACING.m,
      height: 40,
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      color: COLORS.text
  },
  applyUrlBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.success,
      justifyContent: 'center',
      alignItems: 'center'
  },
  cancelUrlBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.gray,
      justifyContent: 'center',
      alignItems: 'center'
  },
  emailText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: COLORS.textSecondary,
    marginTop: SPACING.s
  },
  section: {
    marginBottom: SPACING.l,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: COLORS.text,
    marginBottom: SPACING.m,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.textSecondary,
    marginBottom: SPACING.s,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    borderRadius: BORDER_RADIUS.m,
    paddingHorizontal: SPACING.m,
    paddingVertical: Platform.OS === 'ios' ? 16 : 4,
    marginBottom: SPACING.m,
    gap: SPACING.s,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.text,
    fontSize: 16,
    height: 40,
  },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.black,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.m,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  passwordBtn: {
    backgroundColor: COLORS.textSecondary,
  },
  saveBtnText: {
    color: COLORS.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray,
    marginVertical: SPACING.l,
  },
  forgotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.m,
    gap: 8,
  },
  forgotText: {
    color: COLORS.primary,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    textDecorationLine: 'underline',
    textDecorationColor: COLORS.primary
  },
});
