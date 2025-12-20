import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ChatMessageProps {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
    const isUser = role === 'user';

    return (
        <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
            <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
                <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
                    {content}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 4,
        paddingHorizontal: 16,
    },
    userContainer: {
        alignItems: 'flex-end',
    },
    assistantContainer: {
        alignItems: 'flex-start',
    },
    bubble: {
        maxWidth: '80%',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    userBubble: {
        backgroundColor: '#007AFF',
        borderBottomRightRadius: 4,
    },
    assistantBubble: {
        backgroundColor: '#E5E5EA',
        borderBottomLeftRadius: 4,
    },
    text: {
        fontSize: 16,
        lineHeight: 22,
    },
    userText: {
        color: '#FFFFFF',
    },
    assistantText: {
        color: '#000000',
    },
});
