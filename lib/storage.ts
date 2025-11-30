import { Alert } from 'react-native';
import { supabase } from './supabase';

// Interface para a estrutura específica de erro do Storage
export interface StorageErrorResponse {
  statusCode: string;
  error: string;
  message: string;
}

/**
 * Serviço robusto para upload de imagens no Supabase Storage.
 * Trata erros específicos como 'Bucket not found' (404) e converte URIs locais para Blob.
 * 
 * @param userId ID do usuário para organizar a pasta
 * @param uri URI local da imagem (file://...)
 * @param bucket Nome do bucket (padrão: 'avatars')
 * @returns URL pública da imagem ou null em caso de erro
 */
export const uploadImageToSupabase = async (
  userId: string,
  uri: string,
  bucket: string = 'avatars'
): Promise<string | null> => {
  try {
    console.log(`[Storage] Iniciando upload para bucket: ${bucket}`);

    // 1. Converter URI para Blob (Binary Large Object)
    // Necessário para evitar erros de rede com URIs locais no React Native
    const response = await fetch(uri);
    const blob = await response.blob();

    // 2. Determinar metadados do arquivo
    const mimeType = blob.type || 'image/jpeg';
    const extension = mimeType.split('/')[1] || 'jpg';
    const fileName = `${userId}/${Date.now()}.${extension}`;

    console.log(`[Storage] Enviando arquivo: ${fileName} (${mimeType})`);

    // 3. Realizar Upload
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, blob, {
        contentType: mimeType,
        upsert: true,
      });

    // 4. Tratamento Robusto de Erros
    if (error) {
      // Cast para a interface de erro definida
      const storageError = error as unknown as StorageErrorResponse;
      
      console.error('[Storage] Erro retornado:', storageError);

      // Detecção específica do erro 404 / Bucket not found
      if (
        storageError.statusCode === '404' || 
        storageError.message?.includes('Bucket not found') ||
        storageError.error === 'Bucket not found'
      ) {
        Alert.alert(
          'Erro de Configuração',
          'O repositório de imagens (Bucket) não foi encontrado no servidor. Por favor, contate o suporte ou verifique se o bucket "avatars" está criado e público.'
        );
        return null; // Fallback seguro
      }

      throw error; // Lança outros erros para o catch genérico
    }

    // 5. Gerar URL Pública
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    console.log('[Storage] Upload concluído. URL:', urlData.publicUrl);
    
    return urlData.publicUrl;

  } catch (error: any) {
    console.error('[Storage] Exceção capturada:', error.message);
    
    // Evita spam de alertas se já foi tratado acima
    if (!error.message?.includes('Bucket not found')) {
        Alert.alert('Falha no Upload', 'Não foi possível enviar a imagem. Tente novamente mais tarde.');
    }
    
    return null; // Retorna nulo para não quebrar o fluxo da aplicação
  }
};
