import { GoogleGenAI } from '@google/genai';

/**
 * Safely parses response JSON or throws a clear, descriptive error.
 */
async function parseJsonResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  if (!contentType.includes('application/json')) {
    throw new Error(`Server returned non-JSON response (${response.status} ${response.statusText}).`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON format received from server.`);
  }
}

/**
 * Gets a client-side GoogleGenAI instance if API key is present in client environment or localStorage.
 */
export function getStoredGeminiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('user_gemini_api_key') || 
         (import.meta as any).env?.VITE_GEMINI_API_KEY || 
         (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '') || 
         '';
}

export function saveStoredGeminiKey(key: string) {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem('user_gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('user_gemini_api_key');
    }
  }
}

function getClientGenAI() {
  const apiKey = getStoredGeminiKey();
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

export async function sendGeminiChatMessage(messages: Array<{ role: string; content: string }>, userContext?: any): Promise<string> {
  // 1. First attempt calling backend Express API endpoint
  try {
    const response = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, userContext })
    });

    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(data.error || 'Server error processing chat message');
    }

    if (data.reply) return data.reply;
  } catch (serverErr: any) {
    console.warn('Backend /api/gemini/chat call failed or unavailable:', serverErr.message);

    // 2. Client-side fallback using @google/genai SDK if API key available in client env
    const clientAi = getClientGenAI();
    if (clientAi) {
      try {
        const systemInstruction = `You are "GreenLife AI Health Assistant", an intelligent, compassionate, and professional medical virtual consultant for Green Life Hospital & Care Management System.
You provide clear health information, symptom guidance, medical term explanations, lifestyle advice, and assistance with hospital departments or doctor selection.
Guidelines: Maintain an empathetic medical tone, structure answers with clear formatting, and add a brief standard medical disclaimer.
Patient Context: ${userContext ? JSON.stringify(userContext) : 'Guest Patient'}`;

        const history = messages.slice(0, -1).map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));

        const lastMsg = messages[messages.length - 1]?.content || '';

        const chat = clientAi.chats.create({
          model: 'gemini-2.5-flash',
          history,
          config: { systemInstruction, temperature: 0.7 }
        });

        const res = await chat.sendMessage({ message: lastMsg });
        if (res.text) return res.text;
      } catch (clientSdkErr: any) {
        console.error('Client SDK Gemini Chat Error:', clientSdkErr);
        const errStr = clientSdkErr.message || JSON.stringify(clientSdkErr);
        if (errStr.includes('PERMISSION_DENIED') || errStr.includes('403') || errStr.includes('denied access')) {
          throw new Error(`🔑 Google Gemini API Key Error (403 PERMISSION DENIED): The Google Cloud project for your API Key was denied access or has Generative Language API disabled.\n\nQuick Fix:\n1. Go to https://aistudio.google.com/app/apikey and create a new free API Key.\n2. Click the 🔑 Key icon in the chat title bar, paste your key, and click Save Key!`);
        }
        throw new Error(`Gemini AI Error: ${clientSdkErr.message || 'Failed to generate response'}`);
      }
    }

    // Re-throw descriptive error if neither succeeded
    if (serverErr.message?.includes('404')) {
      throw new Error('Netlify Static Hosting Notice: The backend Express API (/api/gemini/chat) is not active on static hosting. Please click the 🔑 Settings icon in the chat title bar to enter your Gemini API Key or set VITE_GEMINI_API_KEY in Netlify.');
    }
    throw new Error(serverErr.message || 'Unable to connect to Gemini AI server endpoint.');
  }

  return 'No response generated.';
}

export async function analyzeMedicalReportWithGemini(params: {
  reportTitle: string;
  category?: string;
  summary?: string;
  diagnosis?: string;
  fileDataUrl?: string;
}): Promise<string> {
  try {
    const response = await fetch('/api/gemini/analyze-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(data.error || 'Server error analyzing report');
    }

    if (data.analysis) return data.analysis;
  } catch (serverErr: any) {
    console.warn('Backend /api/gemini/analyze-report call failed:', serverErr.message);

    const clientAi = getClientGenAI();
    if (clientAi) {
      try {
        const promptParts: any[] = [];
        const promptText = `Analyze the following patient medical report:
Title: ${params.reportTitle}
Category: ${params.category || 'General Health'}
Recorded Summary: ${params.summary || 'N/A'}
Diagnosis Note: ${params.diagnosis || 'N/A'}

Please provide a structured, patient-friendly medical analysis including:
1. **Summary in Plain English**
2. **Key Clinical Findings**
3. **Recommended Follow-up & Next Steps**
4. **Questions to Ask Your Doctor**`;

        if (params.fileDataUrl && params.fileDataUrl.startsWith('data:')) {
          const match = params.fileDataUrl.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
          if (match) {
            promptParts.push({ inlineData: { mimeType: match[1], data: match[2] } });
          }
        }
        promptParts.push({ text: promptText });

        const res = await clientAi.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: promptParts },
          config: {
            systemInstruction: 'You are a Senior Clinical Diagnostic AI Specialist at Green Life Hospital.',
            temperature: 0.4
          }
        });

        if (res.text) return res.text;
      } catch (clientSdkErr: any) {
        const errStr = clientSdkErr.message || JSON.stringify(clientSdkErr);
        if (errStr.includes('PERMISSION_DENIED') || errStr.includes('403') || errStr.includes('denied access')) {
          throw new Error(`🔑 Gemini API Key Error (403 PERMISSION DENIED): Generative Language API is disabled/restricted for this key. Get a new key at https://aistudio.google.com/app/apikey and save it in AI Chat Settings.`);
        }
        throw new Error(`Gemini Report Analysis Error: ${clientSdkErr.message}`);
      }
    }

    if (serverErr.message?.includes('404')) {
      throw new Error('Netlify Static Hosting Notice: The backend Express API (/api) is not running on Netlify static hosting. Please enter a Gemini API key in AI Chat Settings or configure VITE_GEMINI_API_KEY in Netlify.');
    }
    throw new Error(serverErr.message || 'Unable to connect to Gemini report analysis service.');
  }

  return 'No analysis generated.';
}

export async function matchDoctorWithGemini(symptoms: string, availableDepartments: any[], availableDoctors: any[]): Promise<string> {
  try {
    const response = await fetch('/api/gemini/recommend-doctor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms, availableDepartments, availableDoctors })
    });

    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(data.error || 'Server error matching symptoms');
    }

    if (data.recommendation) return data.recommendation;
  } catch (serverErr: any) {
    console.warn('Backend /api/gemini/recommend-doctor call failed:', serverErr.message);

    const clientAi = getClientGenAI();
    if (clientAi) {
      try {
        const promptText = `Patient Symptoms: "${symptoms}"
Departments: ${JSON.stringify(availableDepartments)}
Doctors: ${JSON.stringify(availableDoctors)}
Provide triage assessment, urgency level, recommended department, doctor match, and pre-consultation advice.`;

        const res = await clientAi.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: promptText,
          config: {
            systemInstruction: 'You are a Clinical Triage & Department Matching AI at Green Life Hospital.',
            temperature: 0.5
          }
        });

        if (res.text) return res.text;
      } catch (clientSdkErr: any) {
        const errStr = clientSdkErr.message || JSON.stringify(clientSdkErr);
        if (errStr.includes('PERMISSION_DENIED') || errStr.includes('403') || errStr.includes('denied access')) {
          throw new Error(`🔑 Gemini API Key Error (403 PERMISSION DENIED): Generative Language API is disabled/restricted for this key. Get a new key at https://aistudio.google.com/app/apikey and save it in AI Chat Settings.`);
        }
        throw new Error(`Doctor Matcher Error: ${clientSdkErr.message}`);
      }
    }

    if (serverErr.message?.includes('404')) {
      throw new Error('Netlify Static Hosting Notice: Express API (/api) not active on static hosting. Please enter a Gemini API Key in AI Chat Settings or set VITE_GEMINI_API_KEY in Netlify.');
    }
    throw new Error(serverErr.message || 'Unable to evaluate symptoms at this time.');
  }

  return 'No recommendation generated.';
}
