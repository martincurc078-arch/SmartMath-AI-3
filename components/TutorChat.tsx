import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles, User, Bot } from 'lucide-react';
import { ChatMessage, MathSolution } from '../types';
import { getTutorResponse } from '../services/geminiService';
import { KaTeXRenderer } from './KaTeXRenderer';

interface TutorChatProps {
  onBack: () => void;
  solutionContext: MathSolution;
}

export const TutorChat: React.FC<TutorChatProps> = ({ onBack, solutionContext }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Здравей! Аз съм твоят AI учител. Виждам, че решаваш задача от раздел **${solutionContext.topic}**. Как мога да ти помогна да я разбереш по-добре?`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await getTutorResponse(history, userMsg.text, solutionContext);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    // Optional: Auto-send or just populate input
  };

  // Helper to render text with mixed Markdown/LaTeX
  const renderMessageContent = (text: string) => {
    // Basic formatting: Split by latex delimiters $...$
    // This is a simplified parser.
    const parts = text.split(/(\$[^\$]+\$)/g);
    return (
      <span>
        {parts.map((part, i) => {
          if (part.startsWith('$') && part.endsWith('$')) {
            return <KaTeXRenderer key={i} expression={part.slice(1, -1)} className="text-inherit inline-block mx-1" />;
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-100 shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold text-slate-800 flex items-center gap-2">
            AI Учител <Sparkles size={16} className="text-yellow-500 fill-yellow-500" />
          </h1>
          <p className="text-xs text-slate-500">Винаги на линия</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-indigo-600'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
            }`}>
              {renderMessageContent(msg.text)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-sm ml-12">
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length < 3 && !isLoading && (
        <div className="px-4 pb-2 bg-slate-50 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <div className="flex gap-2">
            {["Защо раздели на 2?", "Обясни стъпка 1 отново", "Има ли друг начин?"].map((q, i) => (
              <button 
                key={i}
                onClick={() => handleQuickQuestion(q)}
                className="px-3 py-1.5 bg-white border border-indigo-100 text-indigo-600 rounded-full text-xs font-medium shadow-sm hover:bg-indigo-50 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Попитай нещо..."
            className="flex-1 bg-slate-100 text-slate-800 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-md shadow-indigo-200"
          >
            <Send size={20} className={isLoading ? 'opacity-0' : ''} />
            {isLoading && <div className="absolute w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
          </button>
        </div>
      </div>
    </div>
  );
};