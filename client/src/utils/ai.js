import axios from 'axios';

// Get keys helper
export const getApiKeys = () => {
    const localGemini = localStorage.getItem('devlearn_gemini_api_key');
    const localGroq = localStorage.getItem('devlearn_groq_api_key');
    
    return {
        geminiKey: localGemini || import.meta.env.VITE_GEMINI_API_KEY || '',
        groqKey: localGroq || import.meta.env.VITE_GROQ_API_KEY || ''
    };
};

// Call Gemini API
const callGemini = async (prompt, key) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
    const response = await axios.post(url, {
        contents: [{
            parts: [{
                text: prompt
            }]
        }]
    }, {
        headers: { 'Content-Type': 'application/json' }
    });
    
    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
        throw new Error('Empty response from Gemini API');
    }
    return text;
};

// Call Groq API (Fallback)
const callGroq = async (prompt, key) => {
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const response = await axios.post(url, {
        model: 'llama-3.3-70b-versatile',
        messages: [{
            role: 'user',
            content: prompt
        }],
        temperature: 0.1
    }, {
        headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
        }
    });

    const text = response.data?.choices?.[0]?.message?.content;
    if (!text) {
        throw new Error('Empty response from Groq API');
    }
    return text;
};

// Orchestrate LLM call with fallback
export const callLlm = async (prompt) => {
    const { geminiKey, groqKey } = getApiKeys();
    
    try {
        if (!geminiKey) throw new Error('Gemini key is missing');
        console.log('Attempting call with Gemini...');
        return await callGemini(prompt, geminiKey);
    } catch (geminiError) {
        console.warn('Gemini request failed. Attempting Groq fallback...', geminiError);
        if (groqKey) {
            try {
                return await callGroq(prompt, groqKey);
            } catch (groqError) {
                console.error('Groq fallback request also failed.', groqError);
                throw new Error('Both Gemini and Groq fallback APIs failed. Please check your keys or connection.');
            }
        } else {
            throw new Error(`Gemini API failed and no Groq fallback key is configured. Error: ${geminiError.message}`);
        }
    }
};

// Clean JSON response Helper
export const parseJsonResponse = (text) => {
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
        cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith('```')) {
        cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    cleanText = cleanText.trim();
    
    try {
        return JSON.parse(cleanText);
    } catch (e) {
        // Try to find the first '{' and last '}' to extract raw JSON
        const firstBrace = cleanText.indexOf('{');
        const lastBrace = cleanText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            const jsonSubstring = cleanText.substring(firstBrace, lastBrace + 1);
            return JSON.parse(jsonSubstring);
        }
        throw e;
    }
};
