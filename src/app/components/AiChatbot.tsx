import { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, Bot, User, Sparkles, Loader2, Trash2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

type Message = { id: string; role: 'user' | 'assistant'; content: string; timestamp: Date };

const PROMPT_TEMPLATES = [
  { label: 'Analyze Scope 3', prompt: 'What are the most effective strategies to reduce Scope 3 emissions in our supply chain?' },
  { label: 'BRSR Summary', prompt: 'Summarize the key requirements of India BRSR (Business Responsibility and Sustainability Reporting) and what data I need to collect.' },
  { label: 'Net Zero Path', prompt: 'Create a step-by-step Net Zero transition pathway for a manufacturing company with 1,500 tCO₂e annual emissions.' },
  { label: 'Carbon Pricing', prompt: 'How does carbon pricing work in India and globally? What is the financial risk for companies?' },
  { label: 'ESG Score Boost', prompt: 'What are the top 5 actions to quickly improve our ESG score from 70 to 85 within 6 months?' },
  { label: 'EU CSRD Guide', prompt: 'Explain the EU Corporate Sustainability Reporting Directive (CSRD) and ESRS standards that took effect in 2024.' },
];

const STORAGE_KEY = 'ecotrack_chat_history';

export function AiChatbot() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored).map((m: Message) => ({ ...m, timestamp: new Date(m.timestamp) }));
    } catch { /* ignore */ }
    return [{
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m your EcoTrack AI Assistant powered by Gemini. I specialize in ESG frameworks, GHG accounting (Scope 1/2/3), compliance (BRSR, CSRD, TCFD), and sustainability strategy. Use the quick prompts below or ask me anything.',
      timestamp: new Date(),
    }];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      });
      const data = await res.json();
      const reply = data.reply || data.data?.response || data.message || 'I received your message but could not generate a response. Please check the backend connection.';
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      }]);
    } catch {
      toast.error('Backend offline — check that the backend server is running on port 5000.');
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ Could not connect to the AI backend. Please ensure the Express server is running (`npm start` in the `/backend` folder) and your `GEMINI_API_KEY` is set in `.env`.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    const welcome: Message = { id: 'welcome', role: 'assistant', content: 'Chat history cleared. How can I help you?', timestamp: new Date() };
    setMessages([welcome]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success('Chat history cleared');
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
              <Bot className="size-6 text-white" />
            </div>
            ESG AI Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 ml-1">Ask anything about ESG, GHG accounting, compliance & sustainability</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-full border border-purple-200 dark:border-purple-800">
            <Sparkles className="size-4 text-purple-600 dark:text-purple-400 animate-pulse" />
            <span className="text-xs font-medium text-purple-800 dark:text-purple-300">Gemini AI</span>
          </div>
          <Button variant="outline" size="sm" onClick={clearHistory} className="gap-1.5 text-gray-500">
            <Trash2 className="size-3.5" /> Clear
          </Button>
        </div>
      </div>

      {/* Quick Prompt Templates */}
      <div className="flex flex-wrap gap-2">
        {PROMPT_TEMPLATES.map(t => (
          <button key={t.label} onClick={() => sendMessage(t.prompt)}
            disabled={isLoading}
            className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 transition-all disabled:opacity-50">
            <MessageSquare className="size-3 inline mr-1.5 text-emerald-500" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden border-2 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-5 flex flex-col pb-4">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                >
                  <div className={`flex-shrink-0 size-8 rounded-full flex items-center justify-center shadow-md ${
                    msg.role === 'user' ? 'bg-emerald-600' : 'bg-gradient-to-br from-purple-600 to-blue-600'
                  }`}>
                    {msg.role === 'user' ? <User className="size-4 text-white" /> : <Bot className="size-4 text-white" />}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm'
                  }`}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                    <p className={`text-xs mt-1.5 ${msg.role === 'user' ? 'text-emerald-200' : 'text-gray-400'}`}>
                      {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 self-start">
                <div className="flex-shrink-0 size-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Bot className="size-4 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 rounded-tl-sm flex items-center gap-3">
                  <Loader2 className="size-4 animate-spin text-purple-600" />
                  <div className="flex gap-1">
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <div key={i} className="size-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }} />
                    ))}
                  </div>
                  <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">Gemini is thinking...</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-800">
          <form className="flex gap-2" onSubmit={e => { e.preventDefault(); sendMessage(input); }}>
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about Scope 3, BRSR filing, carbon pricing, Net Zero..."
              className="flex-1 rounded-full px-4 focus-visible:ring-emerald-500 dark:bg-gray-800 dark:border-gray-700"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 h-10 w-10 flex-shrink-0 shadow-md"
            >
              <Send className="size-4" />
            </Button>
          </form>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
            Powered by Google Gemini · Chat history saved locally
          </p>
        </div>
      </Card>
    </div>
  );
}
