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
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle, Send, Sparkles } from 'lucide-react-native';
import ChatMessage from '../../components/ChatMessage';
import { sendMessageToQwen, getSystemMessage, ChatMessage as ChatMessageType, generateFinancialInsights } from '../../lib/openrouter';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Transaction } from '../../types';
import { COLORS } from '../../constants/theme';

export default function ChatBot() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessageType[]>([getSystemMessage()]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

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
            // Envia para a API
            const response = await sendMessageToQwen(updatedMessages);

            // Adiciona resposta do assistente
            const assistantMessage: ChatMessageType = {
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
            const errorMessage: ChatMessageType = {
                role: 'assistant',
                content: `Erro: ${error.message || 'Ocorreu um erro ao processar sua mensagem.'}`,
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

            // 2. Gerar insights
            const insights = await generateFinancialInsights(transactions as Transaction[]);

            // 3. Adicionar resposta da IA
            const aiResponse: ChatMessageType = {
                role: 'assistant',
                content: insights
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
                    <MessageCircle size={24} color="#007AFF" />
                    <Text style={styles.headerTitle}>Chat AI</Text>
                </View>

                {/* Messages */}
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.messagesContainer}
                    contentContainerStyle={styles.messagesContent}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
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

                {/* Input */}
                <View style={styles.inputContainer}>
                    {messages.length === 1 && (
                        <TouchableOpacity
                            style={styles.suggestionBtn}
                            onPress={handleAnalyzeFinances}
                            disabled={isLoading}
                        >
                            <Sparkles size={16} color={COLORS.primary} />
                            <Text style={styles.suggestionText}>Analisar Gastos</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Digite sua mensagem..."
                            placeholderTextColor="#8E8E93"
                            multiline
                            maxLength={1000}
                            editable={!isLoading}
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
                            onPress={handleSend}
                            disabled={!inputText.trim() || isLoading}
                        >
                            <Send size={20} color={!inputText.trim() || isLoading ? '#C7C7CC' : '#FFFFFF'} />
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
        backgroundColor: '#F2F2F7',
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
        gap: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        paddingVertical: 16,
        paddingBottom: 32, // Espaço extra no final das mensagens
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
        fontWeight: '600',
        color: '#000000',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 16,
        color: '#8E8E93',
        marginTop: 8,
        textAlign: 'center',
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
        color: '#8E8E93',
    },
    inputContainer: {
        flexDirection: 'column',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 120 : 110, // Espaço para a BottomNavBar (70px + margens)
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
        gap: 12,
    },
    suggestionBtn: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F9FF',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.primary,
        gap: 6,
    },
    suggestionText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.primary
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
        width: '100%',
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#F2F2F7',
        borderRadius: 20,
        fontSize: 16,
        color: '#000000',
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#E5E5EA',
    },
});
