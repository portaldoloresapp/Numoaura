import { GoogleGenerativeAI } from "@google/generative-ai";
import Constants from 'expo-constants';

// Tenta pegar a chave do .env ou usa uma string vazia (o usuário precisará preencher)
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

const genAI = new GoogleGenerativeAI(API_KEY);

export interface ChatMessage {
    role: 'user' | 'model'; // Gemini usa 'model' em vez de 'assistant'
    parts: { text: string }[];
}

export async function sendMessageToGemini(history: ChatMessage[], newMessage: string): Promise<string> {
    if (!API_KEY) {
        throw new Error("Chave de API do Google Gemini não configurada.");
    }

    try {
        // Usando modelo solicitado pelo usuário
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const result = await chat.sendMessage(newMessage);
        const response = await result.response;
        const text = response.text();

        return text;
    } catch (error: any) {
        console.error("Erro ao falar com Gemini:", error);
        throw new Error(error.message || "Erro desconhecido ao conectar com a IA.");
    }
}

export function formatMessageForGemini(role: 'user' | 'assistant', content: string): ChatMessage {
    return {
        role: role === 'user' ? 'user' : 'model',
        parts: [{ text: content }],
    };
}

/**
 * Analisa uma imagem de recibo e extrai dados financeiros
 */
export async function analyzeReceipt(base64Image: string): Promise<{
    amount: number | null,
    description: string,
    category_slug: string
}> {
    if (!API_KEY) throw new Error("Chave Gemini não configurada");

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `Analise este recibo/nota fiscal.
        Extraia e retorne um JSON com:
        - "amount": valor total (number)
        - "description": nome do estabelecimento (string)
        - "category_slug": escolha UMA das seguintes slugs para a melhor categoria: ["mercado", "casa", "transporte", "contas", "lazer", "presentes"]. Se não se encaixar, use "outros".
        
        Se não conseguir ler, retorne null.`;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Image, mimeType: "image/jpeg" } }
        ]);

        const responseText = result.response.text();
        return JSON.parse(responseText);
    } catch (error) {
        console.error("Erro ao analisar imagem:", error);
        throw new Error("Não foi possível analisar o recibo.");
    }
}
