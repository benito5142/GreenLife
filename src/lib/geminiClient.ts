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

function getClinicalFallbackResponse(userQuery: string): string {
  const q = userQuery.toLowerCase();
  
  let coreAdvice = '';
  if (q.includes('headache') || q.includes('fever') || q.includes('cold') || q.includes('flu') || q.includes('migraine')) {
    coreAdvice = `### 🩺 Green Life Clinical Guidance: Fever & Headache Symptoms

**General Assessment:**
Fevers and headaches are common physiological responses to viral infections, tension, dehydration, or fatigue.

**Recommended Steps:**
1. **Hydration & Rest:** Stay well hydrated with fluids (water, oral rehydration solution) and rest in a quiet, dark room.
2. **Temperature Monitoring:** Monitor body temperature every 4 hours.
3. **Emergency Warning Signs:** Seek urgent medical care if you experience a high fever (>102°F/39°C), severe neck stiffness, sudden vision changes, or confusion.

**Recommended Department:** Internal Medicine / General OPD
**Suggested Specialist:** Dr. Sarah Jenkins (General Physician) or Dr. Robert Vance (Internal Medicine)`;
  } else if (q.includes('knee') || q.includes('leg') || q.includes('joint') || q.includes('bone') || q.includes('back pain') || q.includes('fracture')) {
    coreAdvice = `### 🦴 Green Life Clinical Guidance: Joint & Musculoskeletal Care

**General Assessment:**
Joint, knee, or back pain frequently arises from ligament strain, arthritis, cartilage inflammation, or physical exertion.

**Recommended Steps:**
1. **R.I.C.E Protocol:** Rest the affected joint, apply Ice packs for 15-20 mins, gently Compress with an elastic bandage, and Elevate.
2. **Avoid Strain:** Refrain from heavy lifting or high-impact exercise until evaluated.

**Recommended Department:** Orthopedics & Joint Care Center
**Suggested Specialist:** Dr. Aris Thorne (Orthopedic Surgeon) or Dr. Elena Rostova (Rheumatology)`;
  } else if (q.includes('heart') || q.includes('chest') || q.includes('bp') || q.includes('blood pressure') || q.includes('cardio')) {
    coreAdvice = `### 🫀 Green Life Urgent Care Notice: Cardiovascular Symptoms

**Important Safety Disclaimer:**
Chest pain, pressure, or sudden shortness of breath requires immediate clinical evaluation. If you feel crushing chest pain radiating to your jaw or left arm, call Emergency Hotline **+1 (800) 473-3654** immediately or visit our 24/7 Level-1 Trauma Center.

**For Routine Cardiac Checkups / Blood Pressure:**
- **Recommended Department:** Cardiology Center
- **Suggested Specialist:** Dr. Marcus Vance (Cardiology Specialist)`;
  } else {
    coreAdvice = `### 🏥 Green Life Medical Virtual Assistant

Welcome to Green Life Hospital! I am your AI Virtual Health Consultant, available 24/7 to assist with symptom guidance, department matching, and specialist recommendations.

**How Green Life Hospital Can Help You:**
- **Instant OPD Bookings**: Choose your preferred specialist and time slot online.
- **Specialized Centers**: Cardiology, Neurology, Orthopedics, Pediatrics, General Medicine, and Oncology.
- **Digital Health Records**: Securely upload and store your lab reports & diagnostic scans in your Patient Portal.

*Need an appointment right now? Click **Book Appointment** in the top navigation bar!*`;
  }

  return coreAdvice;
}

export async function sendGeminiChatMessage(messages: Array<{ role: string; content: string }>, userContext?: any): Promise<string> {
  const lastMsg = messages[messages.length - 1]?.content || '';

  // 1. First attempt calling backend Express API endpoint
  try {
    const response = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, userContext })
    });

    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(data.error || `Server error ${response.status}`);
    }

    if (data.reply) return data.reply;
  } catch (serverErr: any) {
    console.warn('Backend /api/gemini/chat call unavailable or failed:', serverErr.message);

    // Check if server error is 403 PERMISSION_DENIED or 429 RESOURCE_EXHAUSTED
    const serverErrStr = serverErr.message || '';
    if (serverErrStr.includes('RESOURCE_EXHAUSTED') || serverErrStr.includes('429') || serverErrStr.includes('prepayment')) {
      const fallback = getClinicalFallbackResponse(lastMsg);
      return `${fallback}\n\n---\n*💳 **Notice**: Default API Key quota or prepayment credits depleted (\`429 RESOURCE_EXHAUSTED\`). You can enter your own free API Key from [Google AI Studio](https://aistudio.google.com/app/apikey) by clicking the 🔑 **Key Icon** in the chat header above.*`;
    }
    if (serverErrStr.includes('PERMISSION_DENIED') || serverErrStr.includes('403') || serverErrStr.includes('denied access')) {
      const fallback = getClinicalFallbackResponse(lastMsg);
      return `${fallback}\n\n---\n*🔑 **Notice**: Google Gemini API returned \`403 PERMISSION_DENIED\` (Project access restriction). You can click the 🔑 **Key Icon** in the chat header to enter a new API Key from [Google AI Studio](https://aistudio.google.com/app/apikey).*`;
    }

    // 2. Client-side fallback using @google/genai SDK if API key available in client env / localStorage
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
        
        if (errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('429') || errStr.includes('prepayment')) {
          const fallback = getClinicalFallbackResponse(lastMsg);
          return `${fallback}\n\n---\n*💳 **Notice**: Custom API Key quota or prepayment credits depleted (\`429 RESOURCE_EXHAUSTED\`). Please create a new free API Key at [Google AI Studio](https://aistudio.google.com/app/apikey) in a non-billing standard free tier project.*`;
        }
        if (errStr.includes('PERMISSION_DENIED') || errStr.includes('403') || errStr.includes('denied access')) {
          const fallback = getClinicalFallbackResponse(lastMsg);
          return `${fallback}\n\n---\n*🔑 **Notice**: Google Gemini API returned \`403 PERMISSION_DENIED\` (The Google Cloud Project for this key is restricted or Generative Language API is disabled). Click the 🔑 **Key Icon** at the top of this chat to enter a fresh API Key from [Google AI Studio](https://aistudio.google.com/app/apikey).*`;
        }
      }
    }

    // If both failed (e.g. Netlify static hosting without backend, or missing key)
    const fallback = getClinicalFallbackResponse(lastMsg);
    return `${fallback}\n\n---\n*💡 **System Note**: Operating in Clinical Fallback Mode. Click the 🔑 **Key Icon** in the chat header to enter your Google Gemini API Key for live AI responses on static hosting.*`;
  }

  return getClinicalFallbackResponse(lastMsg);
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
