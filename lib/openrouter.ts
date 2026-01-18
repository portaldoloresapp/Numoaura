import Constants from 'expo-constants';
import { Transaction } from '../types';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

// Usando a chave de API fornecida
const OPENROUTER_API_KEY = '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';

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Envia uma mensagem para o Qwen AI através do OpenRouter
 * @param messages - Array de mensagens do histórico da conversa
 * @returns Resposta do AI
 */
export async function sendMessageToQwen(messages: ChatMessage[]): Promise<string> {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-3.1-8b-instruct:free', // Modelo Llama 3.1 gratuito
                messages: messages,
            }),
        });

        if (!response.ok) {
            let errorMessage = `API Error: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                console.log('--- OPENROUTER ERROR DETAIL ---');
                console.log(JSON.stringify(errorData, null, 2));
                errorMessage = `API Error: ${errorData.error?.message || JSON.stringify(errorData)}`;
            } catch (e) {
                // Se não for JSON, usa o statusText
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';
    } catch (error) {
        console.error('Erro ao enviar mensagem para Qwen (Usando Fallback):', error);
        // Fallback: Se a API falhar, usa a resposta local
        const userLastMessage = messages[messages.length - 1]?.content || '';
        return generateLocalResponse(userLastMessage);
    }
}

/**
 * Gera uma resposta local simulada quando a API está offline ou com erro de chave
 */
function generateLocalResponse(userMessage: string): string {
    const msg = userMessage.toLowerCase();
    const date = new Date().toLocaleDateString('pt-BR');

    if (msg.includes('oi') || msg.includes('olá') || msg.includes('ola') || msg.includes('tudo bem')) {
        return `Olá! 👋 Como posso ajudar você a organizar suas finanças hoje?\n\n📅 ${date}`;
    }

    if (msg.includes('analisar') || msg.includes('gastos') || msg.includes('despesas')) {
        return `📊 **Análise Rápida**\n\nCom base no que vejo, seria ótimo revisar seus gastos recentes na categoria "Lazer" ou "Alimentação".\n\nQue tal definir uma meta de economia para este mês? 💰\n\n📅 ${date}`;
    }

    if (msg.includes('meta') || msg.includes('economizar') || msg.includes('guardar')) {
        return `Ótima iniciativa! 🚀\n\nPara começar a economizar:\n1. Defina um valor fixo mensal.\n2. Revise suas assinaturas recorrentes.\n3. Use a aba "Metas" aqui do app para acompanhar!\n\nVocê consegue! 💪\n\n📅 ${date}`;
    }

    if (msg.includes('obrigado') || msg.includes('valeu')) {
        return `De nada! Conte comigo sempre que precisar colocar as contas em dia. 😉\n\n📅 ${date}`;
    }

    // Resposta padrão genérica
    return `Entendi! 🤔\n\nComo estou operando em modo offline temporário, posso te dar dicas gerais sobre finanças ou ajudar a navegar no app.\n\nTente perguntar sobre "Metas" ou "Analisar gastos"!\n\n📅 ${date}`;
}

/**
 * Cria uma mensagem de sistema inicial para definir o comportamento do AI
 */
export function getSystemMessage(): ChatMessage {
    return {
        role: 'system',
        content: `Você é o assistente inteligente do Numoaura, um aplicativo de gestão financeira pessoal focado em simplicidade e clareza.
        
Seu objetivo é ajudar o usuário a organizar suas finanças, identificar padrões de gastos e alcançar metas financeiras.
O Numoaura possui recursos como:
- Rastreamento de receitas e despesas
- Gráficos visuais de balanço diário
- Metas de economia
- Histórico detalhado de transações

Ao responder:
1. Seja amigável, motivador e direto.
2. Use emojis para tornar a conversa leve 💸 🚀.
3. Forneça conselhos práticos e acionáveis.
4. Se o usuário perguntar sobre funcionalidades, explique como o Numoaura pode ajudar.
5. Responda sempre em português do Brasil.
6. coloque no final de cada resposta a data atual no formato dd/mm/yyyy
7. coloque no final de cada resposta uma frase de motivação`,
    };
}

/**
 * Gera insights financeiros com base nas transações do usuário
 */
export async function generateFinancialInsights(transactions: Transaction[]): Promise<string> {
    if (!transactions || transactions.length === 0) {
        return "Não encontrei transações recentes para analisar. Tente adicionar alguns gastos primeiro!";
    }

    // Preparar resumo dos dados para a IA (economizar tokens e focar no importante)
    const summary = transactions.map(t =>
        `- ${t.created_at.split('T')[0]}: ${t.description || t.category} (R$ ${t.amount.toFixed(2)}) [${t.type}]`
    ).join('\n');

    const prompt = `
Analise as seguintes transações financeiras recentes e forneça 3 recomendações pontuais de economia.
Foque em identificar gastos recorrentes desnecessários ou padrões de consumo.
Seja direto e amigável. Use emojis.

Transações:
${summary}
    `.trim();

    const messages: ChatMessage[] = [
        { role: 'system', content: 'Você é um consultor financeiro pessoal experiente e prático.' },
        { role: 'user', content: prompt }
    ];

    return await sendMessageToQwen(messages);
}
