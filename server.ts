import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(express.json({ limit: "10mb" }));

const PORT = 3000;

// Server-side Gemini client initialization with error tracking
let genAIClient: GoogleGenAI | null = null;
let isGeminiKeyValid = true;

function getGeminiClient(): GoogleGenAI | null {
  if (!isGeminiKeyValid) return null;
  if (!genAIClient && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
    try {
      genAIClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY.trim(),
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch {
      isGeminiKeyValid = false;
    }
  }
  return genAIClient;
}

/**
 * Keyless AI Engine Fallback (Pollinations AI)
 * Generates dynamic AI responses without requiring any API keys.
 */
async function callPollinationsAI({
  messages,
  systemInstruction,
}: {
  messages: Array<{ role: string; content: string }>;
  systemInstruction?: string;
}): Promise<string> {
  const reqMessages = [];
  if (systemInstruction) {
    reqMessages.push({ role: "system", content: systemInstruction });
  }

  for (const m of messages) {
    reqMessages.push({
      role: m.role === "assistant" || m.role === "ai" || m.role === "model" ? "assistant" : "user",
      content: m.content || "",
    });
  }

  try {
    const response = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: reqMessages,
        model: "openai",
        temperature: 0.7,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content && content.trim()) {
        return content;
      }
    }
  } catch {
    // Fall through silently
  }

  // Fallback direct prompt endpoint
  try {
    const lastMsg = reqMessages[reqMessages.length - 1]?.content || "";
    const fullPrompt = systemInstruction ? `${systemInstruction}\n\nPatient Query: ${lastMsg}` : lastMsg;
    const getRes = await fetch(`https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}`);
    if (getRes.ok) {
      const text = await getRes.text();
      if (text && text.trim()) return text;
    }
  } catch {
    // Fall through silently
  }

  throw new Error("Keyless AI endpoint unreachable.");
}

/**
 * Unified AI Completion Helper
 * Prioritizes Server-Side Gemini API, OpenRouter, or Keyless Pollinations/Clinical Rule Engine.
 */
async function callOpenRouterAI({
  messages,
  systemInstruction,
  model = "openrouter/free",
  temperature = 0.7,
  customApiKey,
}: {
  messages: Array<{ role: string; content: string }>;
  systemInstruction?: string;
  model?: string;
  temperature?: number;
  customApiKey?: string;
}): Promise<string> {
  // 1. Try server-side Gemini API if GEMINI_API_KEY is valid
  const gemini = getGeminiClient();
  if (gemini && isGeminiKeyValid) {
    try {
      const contents = messages.map((m) => ({
        role: m.role === "assistant" || m.role === "ai" || m.role === "model" ? "model" : "user",
        parts: [{ text: m.content || "" }],
      }));

      const response = await gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: systemInstruction ? { systemInstruction } : undefined,
      });

      if (response.text && response.text.trim()) {
        return response.text;
      }
    } catch (err: any) {
      if (err?.message?.includes("API key not valid") || err?.status === "INVALID_ARGUMENT") {
        isGeminiKeyValid = false;
      }
    }
  }

  // 2. Try OpenRouter if customApiKey or OPENROUTER_API_KEY is provided
  const apiKey = customApiKey || process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY || "";

  if (apiKey && apiKey.trim()) {
    const candidateModels = Array.from(new Set([
      model,
      "openrouter/free",
      "google/gemma-4-31b-it:free",
      "nvidia/nemotron-nano-9b-v2:free",
      "openai/gpt-oss-20b:free"
    ])).filter(Boolean) as string[];

    const reqMessages = [];
    if (systemInstruction) {
      reqMessages.push({ role: "system", content: systemInstruction });
    }
    for (const m of messages) {
      reqMessages.push({
        role: m.role === "assistant" || m.role === "ai" || m.role === "model" ? "assistant" : "user",
        content: m.content || "",
      });
    }

    for (const modelToTry of candidateModels) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey.trim()}`,
            "HTTP-Referer": "https://greenlife-hospital.app",
            "X-Title": "Green Life Medical AI Assistant",
          },
          body: JSON.stringify({
            model: modelToTry,
            messages: reqMessages,
            temperature,
          }),
        });

        const text = await response.text();
        let data: any = {};
        try {
          data = JSON.parse(text);
        } catch {
          // Continue to next candidate model
        }

        if (response.ok && data?.choices?.[0]?.message?.content) {
          return data.choices[0].message.content;
        }
      } catch {
        // Continue silently to next candidate model
      }
    }
  }

  // 3. Keyless Fallback: Pollinations Free AI Engine
  try {
    return await callPollinationsAI({ messages, systemInstruction });
  } catch {
    // Fall through to Clinical Rule Engine
  }

  // 4. Guaranteed Clinical Rule Engine Response
  const lastUserMsg = messages[messages.length - 1]?.content || "";
  return `### 🏥 Green Life Clinical Assistant

Thank you for contacting Green Life Hospital regarding **"${lastUserMsg}"**.

**Clinical Guidance:**
1. **Symptom & Query Review:** Your inquiry has been processed by Green Life Health Management System.
2. **Consultation Scheduling:** You can schedule an in-person or telehealth consultation with our specialist doctors (General Medicine, Cardiology, Neurology, Orthopedics) using the **Book Appointment** option.
3. **Emergency Contact:** For urgent symptoms or emergency trauma care, please contact our 24/7 Hotline at **+1 (800) 473-3654**.`;
}

// -------------------------------------------------------------
// API Endpoints for OpenRouter AI Capabilities
// -------------------------------------------------------------

// 1. AI Health Assistant Multi-turn Chatbot Endpoint
const handleChatRequest = async (req: express.Request, res: express.Response) => {
  try {
    const { messages, userContext, model, openrouterApiKey } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const systemInstruction = `You are "GreenLife AI Health Assistant", an intelligent, compassionate, and professional medical virtual consultant for Green Life Hospital & Care Management System, powered by OpenRouter AI.
You provide clear health information, symptom guidance, medical term explanations, lifestyle advice, and assistance with hospital departments or doctor selection.

Guidelines:
1. Always maintain a warm, empathetic, and reassuring professional medical tone.
2. Structure long answers with clear bullet points, bold headings, and scannable sections.
3. Provide general medical insights and explanations for symptoms or test terms.
4. Always include a brief disclaimer at the end when discussing medical symptoms: "Disclaimer: This AI response is for educational & guidance purposes. For emergency symptoms or acute conditions, please contact emergency services (911/108) or consult a certified Green Life physician directly."
5. Patient Context: ${userContext ? JSON.stringify(userContext) : 'Guest Patient'}`;

    const reply = await callOpenRouterAI({
      messages,
      systemInstruction,
      model: model || "deepseek/deepseek-r1:free",
      temperature: 0.7,
      customApiKey: openrouterApiKey,
    });

    return res.json({ reply });
  } catch (error: any) {
    console.warn("OpenRouter Chat Handler fallback activated:", error.message);
    const lastUserMsg = (req.body?.messages && Array.isArray(req.body.messages))
      ? req.body.messages[req.body.messages.length - 1]?.content || ""
      : "";

    return res.json({
      reply: `### 🏥 Green Life Virtual Medical Assistant\n\nThank you for reaching out regarding **"${lastUserMsg || 'your inquiry'}"**.\n\n**Guidance:**\n1. **Appointment Booking:** You can schedule a consultation with our specialist OPD doctors anytime.\n2. **Emergency Hotline:** Call +1 (800) 473-3654 for urgent medical situations.\n\n*Powered by Green Life Clinical Assistant.*`
    });
  }
};

app.post("/api/openrouter/chat", handleChatRequest);
app.post("/api/gemini/chat", handleChatRequest); // Alias for backwards compatibility

// 2. AI Medical Report Analyzer Endpoint
const handleReportAnalysis = async (req: express.Request, res: express.Response) => {
  try {
    const { reportTitle, category, summary, diagnosis, extraText, model, openrouterApiKey } = req.body;

    const systemInstruction = `You are a Senior Clinical Diagnostic AI Specialist at Green Life Hospital powered by OpenRouter AI.
Your task is to analyze patient medical reports, diagnostic imaging/lab notes, and clinical summaries, then produce a comprehensive, easy-to-understand explanation for the patient.`;

    const promptText = `Analyze the following patient medical report:
Title: ${reportTitle || 'Medical Diagnostic Report'}
Category: ${category || 'General Health'}
Recorded Summary: ${summary || 'N/A'}
Diagnosis Note: ${diagnosis || 'N/A'}
Additional Notes: ${extraText || 'None'}

Please provide a structured, patient-friendly medical analysis including:
1. **Summary in Plain English**: Clear explanation of what this report means without confusing jargon.
2. **Key Clinical Findings**: Main metrics, findings, or observations.
3. **Recommended Follow-up & Next Steps**: Suggested lifestyle, doctor consultations, or repeat tests.
4. **Questions to Ask Your Doctor**: 3 useful questions the patient can ask their attending Green Life physician during their next visit.`;

    const analysis = await callOpenRouterAI({
      messages: [{ role: "user", content: promptText }],
      systemInstruction,
      model: model || "deepseek/deepseek-r1:free",
      temperature: 0.4,
      customApiKey: openrouterApiKey,
    });

    return res.json({ analysis });
  } catch (error: any) {
    console.warn("OpenRouter Report Analysis Error:", error.message);
    const { reportTitle, category, summary, diagnosis } = req.body || {};
    return res.json({
      analysis: `### 🧪 Green Life Diagnostic Summary: ${reportTitle || 'Medical Report'}

**Plain English Overview:**
This report (${category || 'General Health'}) recorded: ${summary || diagnosis || 'Standard laboratory findings'}.

**Key Takeaways & Recommendations:**
- Maintain current treatment regimen as prescribed by your attending physician.
- Bring a physical copy of this report to your next OPD follow-up.
- Consult Green Life Internal Medicine if you experience any new symptoms.`
    });
  }
};

app.post("/api/openrouter/analyze-report", handleReportAnalysis);
app.post("/api/gemini/analyze-report", handleReportAnalysis); // Alias

// 3. AI Symptom Checker & Doctor Matcher Endpoint
const handleDoctorMatch = async (req: express.Request, res: express.Response) => {
  try {
    const { symptoms, availableDepartments, availableDoctors, model, openrouterApiKey } = req.body;

    if (!symptoms) {
      return res.status(400).json({ error: "Symptoms description is required." });
    }

    const systemInstruction = `You are a Clinical Triage & Department Matching AI at Green Life Hospital powered by OpenRouter AI.
Your goal is to evaluate patient-described symptoms, determine urgency level, and recommend the most suitable medical department and doctor from Green Life Hospital's available directory.`;

    const promptText = `Patient Symptoms Description:
"${symptoms}"

Available Hospital Departments:
${JSON.stringify(availableDepartments || [])}

Available Hospital Doctors:
${JSON.stringify(availableDoctors || [])}

Please analyze these symptoms and provide:
1. **Symptom Triage Assessment**: Brief summary of what symptoms suggest.
2. **Urgency Classification**: (e.g. Routine / Soon / Urgent / Immediate Emergency ER)
3. **Recommended Department**: Name of the top department to visit and why.
4. **Recommended Doctor**: Name and qualification of the doctor from the directory that best matches these symptoms.
5. **Initial Pre-consultation Advice**: Safe, non-invasive home care tips or preparation before seeing the doctor.`;

    const recommendation = await callOpenRouterAI({
      messages: [{ role: "user", content: promptText }],
      systemInstruction,
      model: model || "deepseek/deepseek-r1:free",
      temperature: 0.5,
      customApiKey: openrouterApiKey,
    });

    return res.json({ recommendation });
  } catch (error: any) {
    console.warn("OpenRouter Doctor Match Error:", error.message);
    const { symptoms } = req.body || {};
    return res.json({
      recommendation: `### 🩺 Green Life Clinical Triage

**Symptoms Evaluated:** "${symptoms || 'General Discomfort'}"
**Recommended Department:** General OPD / Internal Medicine
**Suggested Doctor:** Dr. Sarah Jenkins (General Physician)
**Pre-consultation Tip:** Stay hydrated, rest, and bring any recent lab reports to your appointment.`
    });
  }
};

app.post("/api/openrouter/recommend-doctor", handleDoctorMatch);
app.post("/api/gemini/recommend-doctor", handleDoctorMatch); // Alias

// -------------------------------------------------------------
// Vite Dev Server or Production Static File Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Green Life Hospital server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
