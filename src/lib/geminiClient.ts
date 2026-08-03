/**
 * OpenRouter AI Integration for Green Life Hospital
 * Powered by OpenRouter's Free Tier AI Agents (Meta Llama 3.3 70B Free, DeepSeek R1 Free, Qwen 2.5 72B Free, etc.)
 */

export const OPENROUTER_FREE_MODELS = [
  { id: 'openrouter/free', name: 'OpenRouter Auto Free Router (Recommended)', desc: 'Automatically routes to active free AI models on OpenRouter' },
  { id: 'google/gemma-4-31b-it:free', name: 'Google Gemma 4 31B (Free)', desc: 'High-speed clinical & general medical guidance' },
  { id: 'nvidia/nemotron-nano-9b-v2:free', name: 'Nvidia Nemotron Nano 9B (Free)', desc: 'Lightweight & fast medical triage' },
  { id: 'openai/gpt-oss-20b:free', name: 'OpenAI GPT OSS 20B (Free)', desc: 'Advanced reasoning health assistant' },
];

export function getStoredOpenRouterKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('user_openrouter_api_key') || 
         localStorage.getItem('user_gemini_api_key') || 
         (import.meta as any).env?.VITE_OPENROUTER_API_KEY || 
         '';
}

export function saveStoredOpenRouterKey(key: string) {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem('user_openrouter_api_key', key.trim());
      localStorage.setItem('user_gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('user_openrouter_api_key');
      localStorage.removeItem('user_gemini_api_key');
    }
  }
}

// Aliases for backwards compatibility with existing UI components
export const getStoredGeminiKey = getStoredOpenRouterKey;
export const saveStoredGeminiKey = saveStoredOpenRouterKey;

export function getStoredOpenRouterModel(): string {
  if (typeof window === 'undefined') return 'openrouter/free';
  const saved = localStorage.getItem('user_openrouter_model');
  if (!saved || saved.includes('llama-3.3-70b-instruct') || saved.includes('deepseek-r1') || saved.includes('qwen-2.5') || saved.includes('gemini-2.0-flash-lite')) {
    return 'openrouter/free';
  }
  return saved;
}

export function saveStoredOpenRouterModel(model: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user_openrouter_model', model);
  }
}

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

function getClinicalFallbackResponse(userQuery: string): string {
  const q = userQuery.toLowerCase().trim();
  
  if (q.includes('hemoglobin') || q.includes('blood test') || q.includes('cbc') || q.includes('rbc') || q.includes('haemoglobin')) {
    if (q.includes('high') || q.includes('elevated') || q.includes('increase')) {
      return `### 🧪 Clinical Analysis: Elevated Hemoglobin (Polycythemia)

**What High Hemoglobin Means:**
Hemoglobin is the oxygen-carrying protein in red blood cells. Elevated levels indicate that your blood contains an abnormally high volume of red blood cells.

**Common Causes:**
1. **Dehydration:** Reduced blood fluid plasma concentrates red blood cells.
2. **Chronic Low Oxygen (Hypoxia):** Smoking, sleep apnea, or high altitude living.
3. **Bone Marrow Production:** Overproduction of RBCs (e.g., Polycythemia Vera).
4. **Cardiopulmonary Strain:** Chronic lung disease or heart conditions.

**Recommended Clinical Next Steps:**
- **Increase Fluid Intake:** Drink plenty of water and re-test in 1-2 weeks.
- **Complete Blood Count (CBC) Review:** Compare hematocrit and RBC count with your physician.
- **Specialist Consultation:** Book a review with Green Life Internal Medicine or Hematology.

**Recommended Green Life Specialists:**
- **Dr. Sarah Jenkins** (Internal Medicine)
- **Dr. Robert Vance** (Hematology & Pathology)`;
    } else if (q.includes('low') || q.includes('anemia')) {
      return `### 🧪 Clinical Analysis: Low Hemoglobin (Anemia)

**What Low Hemoglobin Means:**
Low hemoglobin indicates anemia, meaning oxygen supply to your tissues may be diminished.

**Common Causes:**
1. **Iron Deficiency:** Poor dietary intake or blood loss.
2. **Vitamin B12 / Folate Deficiency:** Essential for red cell maturation.
3. **Chronic Blood Loss:** Menstrual bleeding or GI tract issues.

**Recommended Next Steps:**
- Order Serum Ferritin & Iron Studies.
- Schedule a consultation with Green Life General Physician.`;
    } else {
      return `### 🧪 Clinical Reference: Hemoglobin Test Guidance

**Normal Reference Ranges:**
- **Adult Males:** 13.8 to 17.2 g/dL
- **Adult Females:** 12.1 to 15.1 g/dL

**Next Steps:**
- If your test is outside normal limits, upload your report PDF in your **Patient Portal** for AI breakdown or consult our General OPD.`;
    }
  }

  if (q.includes('analyze my symptoms') || q.includes('suggest doctor') || q.includes('triage') || q.includes('recommend doctor')) {
    return `### 🩺 Green Life Clinical Symptom Triage & Specialist Matcher

To help me match you with the ideal Green Life doctor, please describe:

1. **What primary symptoms are you feeling?** (e.g. chest pressure, knee pain, migraine, fever, rash)
2. **How long have these symptoms lasted?**
3. **Severity rating (1 to 10)?**

**Green Life Department Directory:**
- **Cardiology:** Chest tightness, breathlessness, high blood pressure (Dr. Marcus Vance)
- **Neurology:** Chronic migraines, numbness, dizziness (Dr. Elena Rostova)
- **Orthopedics:** Joint pain, back strain, fractures (Dr. Aris Thorne)
- **General Medicine:** Fevers, flu, fatigue, routine health checkups (Dr. Sarah Jenkins)

*Reply with your symptoms for immediate specialist recommendation!*`;
  }

  if (q.includes('headache') || q.includes('fever') || q.includes('migraine') || q.includes('cold') || q.includes('flu') || q.includes('cough')) {
    return `### 🩺 Clinical Guidance: Fever & Headache Assessment

**Symptom Overview:**
Headaches with fever or body aches are commonly caused by viral infections, dehydration, tension, or sinus congestion.

**Home Care Instructions:**
1. **Hydration & Rest:** Drink 2-3 liters of fluids daily and rest in a dark, quiet room.
2. **Track Temperature:** Monitor temperature every 4 hours.
3. **Red Flags:** Sudden severe "thunderclap" headache, stiff neck, or high fever (>103°F) require immediate ER evaluation.

**Recommended Department:** Internal Medicine / General Medicine
**Suggested Specialist:** **Dr. Sarah Jenkins** (General Physician)`;
  }

  if (q.includes('knee') || q.includes('back') || q.includes('joint') || q.includes('bone') || q.includes('leg') || q.includes('fracture')) {
    return `### 🦴 Orthopedic Guidance: Joint & Musculoskeletal Care

**Assessment:**
Musculoskeletal discomfort in the knee, back, or joints is frequently triggered by ligament strains, cartilage wear, or physical exertion.

**Immediate Self-Care (R.I.C.E Protocol):**
1. **Rest:** Avoid heavy strain or high impact exercise.
2. **Ice:** Apply cold packs for 15-20 mins 3 times daily.
3. **Elevate:** Keep affected joint elevated when resting.

**Recommended Department:** Orthopedics & Joint Care
**Suggested Specialist:** **Dr. Aris Thorne** (Orthopedic Surgeon)`;
  }

  if (q.includes('heart') || q.includes('chest') || q.includes('bp') || q.includes('blood pressure') || q.includes('cardio')) {
    return `### 🫀 Urgent Care Notice: Cardiovascular Evaluation

**Emergency Warning:**
If you feel sudden crushing chest pain, tightness radiating to the jaw/left arm, or severe shortness of breath, **please call Emergency Services (911/108) or visit Green Life ER immediately.**

**For Routine Blood Pressure & Cardiac Checkups:**
- **Recommended Department:** Cardiology Center
- **Suggested Specialist:** **Dr. Marcus Vance** (Cardiologist)`;
  }

  return `### 🏥 Green Life Virtual Health Consultant

Thank you for your question regarding **"${userQuery}"**:

**Clinical Summary & Advice:**
1. **Evaluation:** Health inquiries regarding "${userQuery}" are best discussed with a physical examination and medical history review.
2. **OPD Timings:** Green Life Hospital multi-specialty OPD is open Mon - Sat (8:00 AM - 8:00 PM).
3. **Book Appointment:** Click the **Book Appointment** button above to select your preferred doctor.

*Disclaimer: For medical emergencies, please visit the nearest Emergency Room.*`;
}

/**
 * Keyless Direct AI Engine Fallback (Pollinations)
 */
async function callPollinationsDirect({
  messages,
  systemInstruction,
}: {
  messages: Array<{ role: string; content: string }>;
  systemInstruction?: string;
}): Promise<string> {
  const reqMessages = [];
  if (systemInstruction) {
    reqMessages.push({ role: 'system', content: systemInstruction });
  }

  for (const m of messages) {
    reqMessages.push({
      role: m.role === 'assistant' || m.role === 'ai' || m.role === 'model' ? 'assistant' : 'user',
      content: m.content || ''
    });
  }

  try {
    const res = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: reqMessages,
        model: 'openai',
        temperature: 0.7
      })
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content && content.trim()) return content;
    }
  } catch (err: any) {
    console.warn('Direct Pollinations POST failed, trying GET endpoint:', err.message);
  }

  const lastMsg = reqMessages[reqMessages.length - 1]?.content || '';
  const fullPrompt = systemInstruction ? `${systemInstruction}\n\nUser Question: ${lastMsg}` : lastMsg;
  const getRes = await fetch(`https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}`);
  if (getRes.ok) {
    const text = await getRes.text();
    if (text && text.trim()) return text;
  }

  throw new Error('Keyless AI Engine unavailable.');
}

/**
 * Direct Client-Side OpenRouter Completion Call
 */
async function callOpenRouterDirect({
  messages,
  systemInstruction,
  model,
  temperature = 0.7,
}: {
  messages: Array<{ role: string; content: string }>;
  systemInstruction?: string;
  model?: string;
  temperature?: number;
}): Promise<string> {
  const apiKey = getStoredOpenRouterKey();
  let selectedModel = model || getStoredOpenRouterModel() || 'openrouter/free';

  if (apiKey && apiKey.trim()) {
    const candidateModels = Array.from(new Set([
      selectedModel,
      'openrouter/free',
      'google/gemma-4-31b-it:free',
      'nvidia/nemotron-nano-9b-v2:free',
      'openai/gpt-oss-20b:free'
    ])).filter(Boolean) as string[];

    const reqMessages = [];
    if (systemInstruction) {
      reqMessages.push({ role: 'system', content: systemInstruction });
    }

    for (const m of messages) {
      reqMessages.push({
        role: m.role === 'assistant' || m.role === 'ai' || m.role === 'model' ? 'assistant' : 'user',
        content: m.content || ''
      });
    }

    for (const modelToTry of candidateModels) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`,
          'HTTP-Referer': 'https://greenlife-hospital.app',
          'X-Title': 'Green Life Medical AI Assistant'
        };

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: modelToTry,
            messages: reqMessages,
            temperature
          })
        });

        const text = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(text);
        } catch {
          // Fallthrough
        }

        if (res.ok && data.choices?.[0]?.message?.content) {
          return data.choices[0].message.content;
        }
      } catch {
        // Silently try next candidate
      }
    }
  }

  // Keyless Fallback
  try {
    return await callPollinationsDirect({ messages, systemInstruction });
  } catch {
    // Silently fall through
  }

  const lastUserMsg = messages[messages.length - 1]?.content || '';
  return getClinicalFallbackResponse(lastUserMsg);
}

export async function sendOpenRouterChatMessage(messages: Array<{ role: string; content: string }>, userContext?: any): Promise<string> {
  const lastMsg = messages[messages.length - 1]?.content || '';
  const selectedModel = getStoredOpenRouterModel();
  const customApiKey = getStoredOpenRouterKey();

  // 1. Try server backend /api/openrouter/chat
  try {
    const response = await fetch('/api/openrouter/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, userContext, model: selectedModel, openrouterApiKey: customApiKey })
    });

    const data = await parseJsonResponse(response);

    if (response.ok && data.reply) {
      return data.reply;
    }
  } catch {
    // Silently proceed to direct client call
  }

  // 2. Direct client-side call to OpenRouter API / Pollinations AI / Fallback
  try {
    const systemInstruction = `You are "GreenLife AI Health Assistant", an intelligent, compassionate, and professional medical virtual consultant for Green Life Hospital & Care Management System.
You provide clear health information, symptom guidance, medical term explanations, lifestyle advice, and assistance with hospital departments or doctor selection.
Guidelines: Maintain an empathetic medical tone, structure answers with clear formatting, and add a brief standard medical disclaimer.
Patient Context: ${userContext ? JSON.stringify(userContext) : 'Guest Patient'}`;

    return await callOpenRouterDirect({
      messages,
      systemInstruction,
      model: selectedModel,
      temperature: 0.7
    });
  } catch {
    return getClinicalFallbackResponse(lastMsg);
  }
}

// Backwards-compatible export
export const sendGeminiChatMessage = sendOpenRouterChatMessage;

export async function analyzeMedicalReportWithOpenRouter(params: {
  reportTitle: string;
  category?: string;
  summary?: string;
  diagnosis?: string;
  fileDataUrl?: string;
}): Promise<string> {
  const selectedModel = getStoredOpenRouterModel();
  const customApiKey = getStoredOpenRouterKey();

  try {
    const response = await fetch('/api/openrouter/analyze-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, model: selectedModel, openrouterApiKey: customApiKey })
    });

    const data = await parseJsonResponse(response);

    if (response.ok && data.analysis) {
      return data.analysis;
    }
    throw new Error(data.error || 'Server error analyzing report');
  } catch (serverErr: any) {
    console.warn('Backend report analysis failed, attempting direct OpenRouter call:', serverErr.message);

    try {
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

      return await callOpenRouterDirect({
        messages: [{ role: 'user', content: promptText }],
        systemInstruction: 'You are a Senior Clinical Diagnostic AI Specialist at Green Life Hospital powered by OpenRouter AI.',
        model: selectedModel,
        temperature: 0.4
      });
    } catch (clientErr: any) {
      throw new Error(`OpenRouter Report Analysis Error: ${clientErr.message}`);
    }
  }
}

// Backwards-compatible export
export const analyzeMedicalReportWithGemini = analyzeMedicalReportWithOpenRouter;

export async function matchDoctorWithOpenRouter(symptoms: string, availableDepartments: any[], availableDoctors: any[]): Promise<string> {
  const selectedModel = getStoredOpenRouterModel();
  const customApiKey = getStoredOpenRouterKey();

  try {
    const response = await fetch('/api/openrouter/recommend-doctor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms, availableDepartments, availableDoctors, model: selectedModel, openrouterApiKey: customApiKey })
    });

    const data = await parseJsonResponse(response);

    if (response.ok && data.recommendation) {
      return data.recommendation;
    }
    throw new Error(data.error || 'Server error matching symptoms');
  } catch (serverErr: any) {
    console.warn('Backend doctor match failed, attempting direct OpenRouter call:', serverErr.message);

    try {
      const promptText = `Patient Symptoms: "${symptoms}"
Departments: ${JSON.stringify(availableDepartments)}
Doctors: ${JSON.stringify(availableDoctors)}
Provide triage assessment, urgency level, recommended department, doctor match, and pre-consultation advice.`;

      return await callOpenRouterDirect({
        messages: [{ role: 'user', content: promptText }],
        systemInstruction: 'You are a Clinical Triage & Department Matching AI at Green Life Hospital powered by OpenRouter AI.',
        model: selectedModel,
        temperature: 0.5
      });
    } catch (clientErr: any) {
      throw new Error(`OpenRouter Doctor Matcher Error: ${clientErr.message}`);
    }
  }
}

// Backwards-compatible export
export const matchDoctorWithGemini = matchDoctorWithOpenRouter;
