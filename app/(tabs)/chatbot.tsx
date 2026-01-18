import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle, Send, Sparkles, Trash2 } from 'lucide-react-native';
import ChatMessage from '../../components/ChatMessage';
import { sendMessageToGemini, formatMessageForGemini, ChatMessage as GeminiMessage } from '../../lib/gemini';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Transaction } from '../../types';
import { COLORS } from '../../constants/theme';

export default function ChatBot() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    // Carregar histórico ao iniciar
    React.useEffect(() => {
        loadHistory();
    }, []);

    // Salvar histórico sempre que mudar
    React.useEffect(() => {
        if (messages.length > 0) {
            saveHistory(messages);
        }
    }, [messages]);

    const loadHistory = async () => {
        try {
            const saved = await AsyncStorage.getItem('@chat_history');
            if (saved) {
                setMessages(JSON.parse(saved));
            }
        } catch (error) {
            console.log('Erro ao carregar histórico', error);
        }
    };

    const saveHistory = async (msgs: any[]) => {
        try {
            await AsyncStorage.setItem('@chat_history', JSON.stringify(msgs));
        } catch (error) {
            console.log('Erro ao salvar histórico', error);
        }
    };

    const clearHistory = async () => {
        try {
            await AsyncStorage.removeItem('@chat_history');
            setMessages([]);
        } catch (error) {
            console.log('Erro ao limpar', error);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage: ChatMessageType = {
            role: 'user',
            content: inputText.trim(),
        };

        // Adiciona mensagem do usuário
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInputText('');
        setIsLoading(true);

        try {
            // Prepara o histórico para o Gemini (converte o formato das mensagens)
            const history = updatedMessages.slice(0, -1).map(msg => formatMessageForGemini(msg.role, msg.content));

            // Envia para a API
            const response = await sendMessageToGemini(history, inputText.trim());

            // Adiciona resposta do assistente
            const assistantMessage = {
                role: 'assistant',
                content: response,
            };

            setMessages([...updatedMessages, assistantMessage]);

            // Scroll para o final
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (error: any) {
            console.error('Erro ao enviar mensagem:', error);
            let errorMsg = 'Ocorreu um erro ao processar sua mensagem.';

            if (error.message.includes('Chave de API')) {
                errorMsg = '⚠️ Configuração Necessária: Adicione sua chave do Google Gemini no arquivo .env (EXPO_PUBLIC_GEMINI_API_KEY).\n\nPegue sua chave grátis em: aistudio.google.com/app/apikey';
            }

            const errorMessage = {
                role: 'assistant',
                content: errorMsg,
            };
            setMessages([...updatedMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnalyzeFinances = async () => {
        if (!user) return;

        setIsLoading(true);

        // Adicionar mensagem do usuário solicitando análise
        const userRequest: ChatMessageType = { role: 'user', content: '🔍 Analisar meus gastos recentes' };
        const updatedMessages = [...messages, userRequest];
        setMessages(updatedMessages);

        try {
            // 1. Buscar últimas 20 transações
            const { data: transactions, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            // 2. Gerar prompt de análise
            const summary = transactions?.map((t: any) =>
                `- ${new Date(t.created_at).toLocaleDateString()}: ${t.description || t.category} (R$ ${t.amount}) [${t.type}]`
            ).join('\n') || "Sem transações recentes.";

            const analysisPrompt = `Analise estas transações financeiras e me dê 3 dicas de economia:\n${summary}`;

            const history = messages.map(msg => formatMessageForGemini(msg.role, msg.content));
            const response = await sendMessageToGemini(history, analysisPrompt);


            // 3. Adicionar resposta da IA
            const aiResponse = {
                role: 'assistant',
                content: response
            };

            setMessages([...updatedMessages, aiResponse]);

            // Scroll para o final
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);

        } catch (error: any) {
            console.error('Erro na análise:', error);
            const errorMessage: ChatMessageType = {
                role: 'assistant',
                content: `Não consegui analisar seus gastos no momento. Erro: ${error.message}`
            };
            setMessages([...updatedMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Filtra mensagens de sistema (não exibir na UI)
    const displayMessages = messages.filter((msg) => msg.role !== 'system');

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <MessageCircle size={24} color={COLORS.primary} />
                        <Text style={styles.headerTitle}>Numo AI</Text>
                    </View>
                    <View style={styles.statusBadge}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>Online</Text>
                    </View>
                    <TouchableOpacity onPress={clearHistory} style={styles.clearBtn}>
                        <Trash2 size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Messages */}
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.messagesContainer}
                    contentContainerStyle={styles.messagesContent}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                    showsVerticalScrollIndicator={false}
                >
                    {displayMessages.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MessageCircle size={64} color="#C7C7CC" />
                            <Text style={styles.emptyText}>Comece uma conversa!</Text>
                            <Text style={styles.emptySubtext}>
                                Faça uma pergunta ou diga olá
                            </Text>
                        </View>
                    ) : (
                        displayMessages.map((msg, index) => (
                            <ChatMessage key={index} role={msg.role} content={msg.content} />
                        ))
                    )}
                    {isLoading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#007AFF" />
                            <Text style={styles.loadingText}>Pensando...</Text>
                        </View>
                    )}
                </ScrollView>

                {/* Input Area */}
                <View style={styles.footerContainer}>
                    {messages.length === 1 && (
                        <TouchableOpacity
                            style={styles.suggestionBtn}
                            onPress={handleAnalyzeFinances}
                            disabled={isLoading}
                        >
                            <Sparkles size={16} color={COLORS.primary} />
                            <Text style={styles.suggestionText}>Analisar meus gastos</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Pergunte qualquer coisa..."
                            placeholderTextColor={COLORS.textSecondary}
                            multiline
                            maxLength={1000}
                            editable={!isLoading}
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
                            onPress={handleSend}
                            disabled={!inputText.trim() || isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Send size={20} color="#FFFFFF" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.dark,
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#1E1E1E',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Inter_700Bold',
        color: COLORS.white,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#4ADE80',
    },
    statusText: {
        fontSize: 12,
        color: '#4ADE80',
        fontFamily: 'Inter_600SemiBold',
    },
    clearBtn: {
        padding: 4,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        paddingVertical: 20,
        paddingBottom: 140, // Aumentei o padding inferior da lista para compensar a área de input flutuante
        flexGrow: 1,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 20,
        fontFamily: 'Inter_700Bold',
        color: COLORS.white,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginTop: 8,
        textAlign: 'center',
        fontFamily: 'Inter_400Regular',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    loadingText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontFamily: 'Inter_400Regular',
    },
    footerContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 120 : 110, // Aumentei para subir mais (afastar da bottom bar)
        backgroundColor: 'transparent', // Removido o fundo cinza
        // borderTopWidth: 1, // Removido a borda
        // borderTopColor: '#333',
        gap: 12,
        position: 'absolute', // Para garantir que fique sobre o conteúdo se necessário, ou flex se preferir fluxo normal. Mantendo fluxo normal por enquanto mas sem BG.
        bottom: 0,
        left: 0,
        right: 0,
    },
    suggestionBtn: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(163, 255, 0, 0.1)',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(163, 255, 0, 0.3)',
        gap: 8,
    },
    suggestionText: {
        fontSize: 13,
        fontFamily: 'Inter_600SemiBold',
        color: COLORS.primary
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        width: '100%',
    },
    input: {
        flex: 1,
        minHeight: 46,
        maxHeight: 120,
        paddingHorizontal: 18,
        paddingVertical: 12,
        backgroundColor: 'rgba(30, 30, 30, 0.9)', // Fundo translúcido escuro para o próprio input
        borderRadius: 30,
        fontSize: 16,
        color: COLORS.white,
        fontFamily: 'Inter_400Regular',
        borderWidth: 1,
        borderColor: '#444',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    sendButton: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    sendButtonDisabled: {
        backgroundColor: '#333',
        shadowOpacity: 0,
    },
});
