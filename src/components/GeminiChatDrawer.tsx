import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User, 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Check, 
  Stethoscope, 
  Activity, 
  ShieldAlert,
  Info,
  Key,
  Settings,
  Save
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sendGeminiChatMessage, getStoredGeminiKey, saveStoredGeminiKey } from '../lib/geminiClient';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const GeminiChatDrawer: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showKeySettings, setShowKeySettings] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(getStoredGeminiKey());
  const [keySavedMsg, setKeySavedMsg] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: `Hello${user?.name ? ` ${user.name}` : ''}! 👋 I am **GreenLife AI Assistant**, your 24/7 intelligent health advisor powered by Gemini.\n\nHow can I help you today? You can ask me to analyze symptoms, suggest hospital specialists, explain lab report terminology, or answer general wellness questions.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsgId = 'user-' + Date.now();
    const userMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      // Format messages for history
      const formattedHistory = [...messages, userMsg].map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text
      }));

      const replyText = await sendGeminiChatMessage(
        formattedHistory,
        user ? { name: user.name, role: user.role } : null
      );

      const aiMsg: Message = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: replyText || 'I apologize, but I could not formulate a response at this moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Gemini Assistant Error:', err);
      const errorMsg: Message = {
        id: 'err-' + Date.now(),
        sender: 'ai',
        text: `⚠️ **Service Notice**: ${err.message || 'Unable to connect to Gemini AI service. Please check your internet connection or server setup.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveKey = () => {
    saveStoredGeminiKey(customApiKey);
    setKeySavedMsg(true);
    setTimeout(() => setKeySavedMsg(false), 2500);
  };

  const quickPrompts = [
    "🩺 Analyze my symptoms & suggest doctor",
    "🧪 What does high Hemoglobin in blood test mean?",
    "👨‍⚕️ Which specialist handles migraine headaches?",
    "⏰ What are Green Life Hospital's OPD hours?"
  ];

  const renderFormattedText = (rawText: string) => {
    // Simple markdown rendering helper
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      let formattedLine = line;

      // Handle bolding **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.startsWith('* ') || line.startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc my-1 text-slate-700">
            {renderedParts.slice(1)}
          </li>
        );
      }

      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="my-1 text-slate-800 leading-relaxed">
          {renderedParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Action Button Trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white p-3.5 pr-5 rounded-full shadow-2xl hover:shadow-emerald-600/30 flex items-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 group border border-emerald-400/30"
          title="Open GreenLife AI Health Assistant"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-slate-900"></span>
            </span>
          </div>

          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold leading-none tracking-wide text-white flex items-center gap-1">
              GreenLife <span className="bg-emerald-400/30 text-emerald-100 text-[9px] px-1.5 py-0.5 rounded font-mono">AI ASSISTANT</span>
            </p>
            <p className="text-[10px] text-emerald-100/90 font-medium mt-0.5">
              Powered by Gemini
            </p>
          </div>
        </button>
      )}

      {/* Expandable Chat Drawer Window */}
      {isOpen && (
        <div 
          className={`fixed z-50 transition-all duration-300 ease-in-out ${
            isExpanded 
              ? 'inset-4 md:inset-10 bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col' 
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[440px] h-[600px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-4 sm:p-5 rounded-t-3xl flex items-center justify-between border-b border-emerald-800/30 shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-amber-200" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                    GreenLife AI Assistant
                  </h3>
                  <span className="text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                    Gemini 3.6
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/80 font-medium flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  24/7 Virtual Health Consultant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <button
                onClick={() => setShowKeySettings(!showKeySettings)}
                title="Gemini API Key Settings (For Netlify / Static Hosting)"
                className={`p-1.5 rounded-xl transition-colors ${
                  showKeySettings || customApiKey ? 'bg-amber-500/20 text-amber-300' : 'hover:bg-white/10 hover:text-white'
                }`}
              >
                <Key className="w-4 h-4" />
              </button>

              <button
                onClick={() => setMessages([
                  {
                    id: 'welcome-reset',
                    sender: 'ai',
                    text: 'Chat history cleared. How else may I assist you today?',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                ])}
                title="Reset Conversation"
                className="p-1.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Collapse Window" : "Expand Window"}
                className="p-1.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                className="p-1.5 rounded-xl hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* API Key Configuration Panel for Static Hosting (Netlify) */}
          {showKeySettings && (
            <div className="bg-slate-900 text-white p-4 border-b border-emerald-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <Key className="w-4 h-4" />
                  <span>Client Gemini API Key Configuration</span>
                </div>
                <button 
                  onClick={() => setShowKeySettings(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                When hosted as a pure static site on Netlify (without Node server), enter your Google Gemini API key below to enable direct client-side AI responses.
              </p>

              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  className="flex-1 bg-slate-950 text-white font-mono text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-400"
                />
                <button
                  onClick={handleSaveKey}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Key</span>
                </button>
              </div>

              {keySavedMsg && (
                <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Gemini API Key saved to browser storage!
                </p>
              )}
            </div>
          )}
          <div className="bg-emerald-50/60 border-b border-emerald-100/80 px-4 py-2.5 overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 whitespace-nowrap shrink-0 flex items-center gap-1">
              <Info className="w-3 h-3 text-emerald-600" /> Suggestions:
            </span>
            {quickPrompts.map((prompt, pIdx) => (
              <button
                key={pIdx}
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                className="text-xs bg-white hover:bg-emerald-100/70 text-slate-700 font-medium px-2.5 py-1 rounded-xl border border-emerald-200/80 shadow-2xs whitespace-nowrap transition-all active:scale-95 disabled:opacity-50 shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[82%] sm:max-w-[78%] group relative ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-xs p-3.5 shadow-sm'
                    : 'bg-white text-slate-800 rounded-2xl rounded-tl-xs p-4 shadow-2xs border border-slate-200/80'
                }`}>
                  <div className="text-xs sm:text-sm">
                    {msg.sender === 'user' ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    ) : (
                      <div className="space-y-1">
                        {renderFormattedText(msg.text)}
                      </div>
                    )}
                  </div>

                  <div className={`flex items-center justify-between mt-2 pt-1 text-[10px] ${
                    msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400 border-t border-slate-100'
                  }`}>
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'ai' && (
                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors flex items-center gap-1"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-[9px] text-emerald-600 font-bold">Copied</span>
                          </>
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-1 font-bold text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-xs p-4 shadow-2xs border border-slate-200/80 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs text-slate-400 font-medium ml-2">Gemini is analyzing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200 rounded-b-3xl shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about symptoms, lab results, doctors..."
                disabled={loading}
                className="flex-1 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-slate-800 placeholder-slate-400 text-xs sm:text-sm px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white p-3 rounded-2xl shadow-sm transition-all active:scale-95 disabled:active:scale-100 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-2 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
              <ShieldAlert className="w-3 h-3 text-amber-500" />
              <span>AI guidance is informational. For medical emergencies, call 911/108 immediately.</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
