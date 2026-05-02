'use client';

import { useState } from 'react';

interface AIAssistantProps {
  isOpen?: boolean;
}

export function AIAssistant({ isOpen = false }: AIAssistantProps) {
  const [messages, setMessages] = useState<{ id: string; type: 'user' | 'assistant'; content: string }[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! I\'m your KARM BABA AI Assistant. I can help you with deal recommendations, market insights, and negotiation tips. What would you like to know?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(!isOpen);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: input,
    };

    setMessages([...messages, userMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'Based on your recent activity, I recommend reaching out to suppliers with similar credibility scores.',
        'Your current deal pipeline is looking strong! Consider accelerating the negotiation phase to close deals faster.',
        'I notice you haven\'t updated some of your product listings. Would you like recommendations on pricing?',
        'Market analysis suggests higher demand for your products in Q2. Consider increasing inventory.',
        'Your buyer network is expanding well. Keep up the good engagement!',
      ];

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: responses[Math.floor(Math.random() * responses.length)],
      };

      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-dark transition-colors z-40"
        title="Open AI Assistant"
      >
        <span className="text-2xl">🤖</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-xl shadow-2xl border border-outline-variant flex flex-col z-50">
      {/* Header */}
      <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-primary text-white rounded-t-xl">
        <div>
          <h3 className="font-headline font-bold">AI Assistant</h3>
          <p className="text-xs text-white/70">KARM BABA Intelligence</p>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-white hover:bg-white/20 p-1 rounded transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg text-sm ${
                msg.type === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-on-surface border border-outline-variant'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-outline-variant bg-gray-50 rounded-b-xl">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask AI anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 px-3 py-2 border border-outline-variant rounded-lg focus:border-primary outline-none text-sm"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors text-sm"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-on-surface-variant mt-2">
          Powered by KARM BABA AI • Data-driven insights for better deals
        </p>
      </div>
    </div>
  );
}
