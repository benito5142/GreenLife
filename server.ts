import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(express.json({ limit: "10mb" }));

const PORT = 3000;

// Helper to get initialized GoogleGenAI instance safely
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in environment variables.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// -------------------------------------------------------------
// API Endpoints for Gemini AI Capabilities
// -------------------------------------------------------------

// 1. AI Health Assistant Multi-turn Chatbot Endpoint
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages, userContext } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getGenAI();

    // Context instructions for medical chat
    const systemInstruction = `You are "GreenLife AI Health Assistant", an intelligent, compassionate, and professional medical virtual consultant for Green Life Hospital & Care Management System.
You provide clear health information, symptom guidance, medical term explanations, lifestyle advice, and assistance with hospital departments or doctor selection.

Guidelines:
1. Always maintain a warm, empathetic, and reassuring professional medical tone.
2. Structure long answers with clear bullet points, bold headings, and scannable sections.
3. Provide general medical insights and explanations for symptoms or test terms.
4. Always include a brief disclaimer at the end when discussing medical symptoms: "Disclaimer: This AI response is for educational & guidance purposes. For emergency symptoms or acute conditions, please contact emergency services (911/108) or consult a certified Green Life physician directly."
5. Patient Context: ${userContext ? JSON.stringify(userContext) : 'Guest Patient'}`;

    // Format chat history for Gemini chat
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content || m.text || '' }],
    }));

    const lastMessage = messages[messages.length - 1].content || messages[messages.length - 1].text;

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: history,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    const response = await chat.sendMessage({
      message: lastMessage,
    });

    return res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    const errStr = error?.message || JSON.stringify(error || {});
    if (errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("429") || errStr.includes("prepayment")) {
      return res.status(429).json({
        error: "429 RESOURCE_EXHAUSTED: Default API key prepayment credits or quota exhausted.",
      });
    }
    if (errStr.includes("PERMISSION_DENIED") || errStr.includes("403") || errStr.includes("denied access")) {
      return res.status(403).json({
        error: "403 PERMISSION_DENIED: The Google Cloud project for the API Key has restricted access.",
      });
    }
    return res.status(500).json({
      error: error?.message || "Failed to generate AI response from Gemini.",
    });
  }
});

// 2. AI Medical Report Analyzer Endpoint
app.post("/api/gemini/analyze-report", async (req, res) => {
  try {
    const { reportTitle, category, summary, diagnosis, extraText, fileDataUrl } = req.body;

    const ai = getGenAI();

    const systemInstruction = `You are a Senior Clinical Diagnostic AI Specialist at Green Life Hospital.
Your task is to analyze patient medical reports, diagnostic imaging/lab notes, and clinical summaries, then produce a comprehensive, easy-to-understand explanation for the patient.`;

    const promptParts: any[] = [];

    let promptText = `Analyze the following patient medical report:
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

    if (fileDataUrl && typeof fileDataUrl === 'string' && fileDataUrl.startsWith('data:')) {
      const match = fileDataUrl.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
      if (match) {
        promptParts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }

    promptParts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: promptParts },
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.4,
      },
    });

    return res.json({ analysis: response.text });
  } catch (error: any) {
    console.error("Gemini Report Analysis Error:", error);
    const errStr = error?.message || JSON.stringify(error || {});
    if (errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("429") || errStr.includes("prepayment")) {
      return res.status(429).json({
        error: "429 RESOURCE_EXHAUSTED: API quota or prepayment credits exhausted.",
      });
    }
    if (errStr.includes("PERMISSION_DENIED") || errStr.includes("403") || errStr.includes("denied access")) {
      return res.status(403).json({
        error: "403 PERMISSION_DENIED: API Key project restricted or permission denied.",
      });
    }
    return res.status(500).json({
      error: error?.message || "Failed to analyze medical report with Gemini.",
    });
  }
});

// 3. AI Symptom Checker & Doctor Matcher Endpoint
app.post("/api/gemini/recommend-doctor", async (req, res) => {
  try {
    const { symptoms, availableDepartments, availableDoctors } = req.body;

    if (!symptoms) {
      return res.status(400).json({ error: "Symptoms description is required." });
    }

    const ai = getGenAI();

    const systemInstruction = `You are a Clinical Triage & Department Matching AI at Green Life Hospital.
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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5,
      },
    });

    return res.json({ recommendation: response.text });
  } catch (error: any) {
    console.error("Gemini Doctor Match Error:", error);
    const errStr = error?.message || JSON.stringify(error || {});
    if (errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("429") || errStr.includes("prepayment")) {
      return res.status(429).json({
        error: "429 RESOURCE_EXHAUSTED: API quota or prepayment credits exhausted.",
      });
    }
    if (errStr.includes("PERMISSION_DENIED") || errStr.includes("403") || errStr.includes("denied access")) {
      return res.status(403).json({
        error: "403 PERMISSION_DENIED: API Key project restricted or permission denied.",
      });
    }
    return res.status(500).json({
      error: error?.message || "Failed to evaluate symptoms with Gemini.",
    });
  }
});

// -------------------------------------------------------------
// Vite Dev Server or Production Static File Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
