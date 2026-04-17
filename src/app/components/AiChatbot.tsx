import { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export function AiChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am your EcoTrack AI Assistant. I can help you with ESG metrics, compliance frameworks, or suggestions for reducing your carbon footprint. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to get response');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.data.response,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      toast.error('Failed to get response. Please ensure Gemini API Key is set in your backend .env file.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="size-8 text-emerald-600" />
            AI Assistant
          </h1>
          <p className="text-gray-600 mt-1">Chat with our ESG expert AI</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-200">
          <Sparkles className="size-4 text-emerald-600" />
          <span className="text-xs font-medium text-emerald-800">Powered by Gemini</span>
        </div>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden border-2 shadow-sm">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-6 flex flex-col pb-4">
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-4 max-w-[80%] ${
                  msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'
                }`}
              >
                <div
                  className={`flex-shrink-0 size-8 rounded-full flex items-center justify-center ${
                    msg.role === 'user' ? 'bg-emerald-600' : 'bg-purple-600'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="size-4 text-white" />
                  ) : (
                    <Bot className="size-4 text-white" />
                  )}
                </div>
                <div
                  className={`p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-sm'
                      : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4 max-w-[80%] self-start"
              >
                <div className="flex-shrink-0 size-8 rounded-full bg-purple-600 flex items-center justify-center">
                  <Bot className="size-4 text-white" />
                </div>
                <div className="p-4 rounded-2xl bg-gray-100 text-gray-800 rounded-tl-sm flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">Thinking...</span>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 bg-white border-t">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about emissions, ESG goals, or compliance..."
              className="flex-1 focus-visible:ring-emerald-500 rounded-full px-4"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="rounded-full bg-emerald-600 hover:bg-emerald-700 h-10 w-10 flex-shrink-0"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
