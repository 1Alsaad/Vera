import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const redisUrl = 'https://integral-feline-55093.upstash.io';
const cohereApiKey = process.env.COHERE_API_KEY;
const redisAuthToken = process.env.REDIS_AUTH_TOKEN;

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const getRedisHistory = async (memoryKey: string) => {
    if (!redisAuthToken) {
        throw new Error('Redis authentication token is missing');
    }

    try {
        const response = await fetch(`${redisUrl}/lrange/${memoryKey}/0/-1`, {
            headers: {
                'Authorization': `Bearer ${redisAuthToken}`
            }
        });

        if (!response.ok) {
            const responseText = await response.text();
            throw new Error(`Redis API error: ${response.status} ${responseText}`);
        }

        const data = await response.json();

        if (Array.isArray(data.result)) {
            return data.result.map(item => {
                try {
                    return JSON.parse(item);
                } catch (e) {
                    console.error(`Error parsing Redis item: ${item}`);
                    return null;
                }
            }).filter(item => item !== null);
        } else {
            throw new Error('Unexpected data format from Redis. Expected an array of JSON strings.');
        }
    } catch (error) {
        console.error('Error fetching Redis history:', error);
        return [];
    }
};

const storeInRedis = async (memoryKey: string, value: any) => {
    if (!redisAuthToken) {
        throw new Error('Redis authentication token is missing');
    }

    try {
        const response = await fetch(`${redisUrl}/rpush/${memoryKey}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${redisAuthToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(value)
        });

        if (!response.ok) {
            const responseText = await response.text();
            throw new Error(`Redis API error: ${response.status} ${responseText}`);
        }
    } catch (error) {
        console.error('Error saving to Redis:', error);
    }
};

const queryCohere = async (message: string, chatHistory: any[], pdfContent: string, uploadedDocuments: any[]) => {
    if (!cohereApiKey) {
        throw new Error('Cohere API key is missing');
    }

    try {
        const response = await fetch('https://api.cohere.ai/v1/chat', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${cohereApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                model: "command",
                chat_history: chatHistory.map(item => ({
                    role: item.role === 'User' ? 'USER' : 'CHATBOT',
                    message: item.message
                })),
                documents: uploadedDocuments,
                temperature: 0.3,
                prompt_truncation: 'AUTO',
                preamble: `You are an AI assistant called Vera. Your primary role is to help users understand and apply content related to ESG (Environmental, Social, and Governance) topics, disclosures, and targets. Always provide accurate information based on the context provided in the documents. If you don't have specific information about a topic in the provided documents, admit that you don't know rather than making up information.`
            })
        });

        if (!response.ok) {
            throw new Error(`Cohere API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error querying Cohere API:', error);
        return null;
    }
};

const searchSupabase = async (query: string) => {
    const embedding = await getEmbedding(query);

    if (!embedding) {
        throw new Error('Error retrieving embedding');
    }

    const { data, error } = await supabase.rpc('match_documents', {
        query_embedding: embedding,
        match_count: 10
    });

    if (error) {
        throw new Error(`Error querying Supabase: ${error.message}`);
    }

    return data;
};

const getEmbedding = async (text: string) => {
    const response = await fetch('https://api.cohere.ai/v1/embed', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${cohereApiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            texts: [text],
            model: "embed-english-v3.0",
            input_type: "search_query"
        })
    });

    if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`Cohere embedding API error: ${response.status} ${responseText}`);
    }

    const data = await response.json();
    return data.embeddings[0];
};

const getUploadedDocuments = async (userId: string, sessionId: string) => {
    const { data, error } = await supabase
        .from('documents')
        .select('content, metadata')
        .eq('user_id', userId)
        .eq('session_id', sessionId);

    if (error) {
        throw new Error(`Error fetching uploaded documents: ${error.message}`);
    }

    return data || [];
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
    try {
        const { message, taskId, userId, sessionId, company, firstName, lastName } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'User Message is missing' }, { status: 400 });
        }

        const memoryKey = `${company}-${firstName}-${lastName}-${taskId}`;

        const redisHistory = await getRedisHistory(memoryKey);

        const chatHistory = redisHistory.map(item => ({
            role: item.role === 'User' ? 'User' : 'Chatbot',
            message: item.message
        }));

        chatHistory.push({
            role: 'User',
            message: message
        });

        let relevantDocuments = [];

        // Fetch previously uploaded documents
        const uploadedDocuments = await getUploadedDocuments(userId, sessionId);
        const uploadedDocumentMessages = uploadedDocuments.map(doc => ({
            role: 'System',
            message: `Previously uploaded document (${doc.metadata?.name || 'Untitled'}): ${doc.content}`
        }));

        relevantDocuments = [...relevantDocuments, ...uploadedDocumentMessages];

        // Perform semantic search
        const supabaseResults = await searchSupabase(message);
        const supabaseDocuments = supabaseResults
            .filter(doc => doc && doc.content)
            .map(doc => ({
                role: 'System',
                message: `Additional relevant document: ${doc.content}`
            }));

        relevantDocuments = [...relevantDocuments, ...supabaseDocuments];

        chatHistory.push(...relevantDocuments);

        const cohereResponse = await queryCohere(message, chatHistory, '', uploadedDocuments);
        if (!cohereResponse) {
            return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 });
        }

        let responseText = cohereResponse.text;

        if (message.toLowerCase().includes("write the citation") || message.toLowerCase().includes("show the paragraphs")) {
            responseText += "\n\nThe specific citations from the documents are provided above. Please refer to the document content provided earlier in the conversation for more details.";
        }

        chatHistory.push({
            role: 'Chatbot',
            message: responseText
        });

        const filteredHistory = chatHistory.filter(item => ['User', 'Chatbot'].includes(item.role));

        if (filteredHistory.length > 0) {
            await storeInRedis(memoryKey, filteredHistory[filteredHistory.length - 2]);
            await storeInRedis(memoryKey, filteredHistory[filteredHistory.length - 1]);
        }

        return NextResponse.json({
            response: responseText,
            sourceDocuments: JSON.stringify(relevantDocuments),
            question: message,
            memoryType: "Upstash Redis-Backed Chat Memory with Document Retrieval"
        });
    } catch (error) {
        console.error('Error in AI chat:', error);
        return NextResponse.json({ 
            error: 'Internal Server Error', 
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}