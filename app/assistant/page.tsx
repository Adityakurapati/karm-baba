'use client';

import DashboardLayout from '@/components/DashboardLayout';
import TopHeader from '@/components/TopHeader';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: 'Hello! I\'m your KARM BABA AI Assistant. I can help you with deal matching, lead scoring, document verification, and much more. How can I assist you today?',
    },
  ]);

  const [input, setInput] = useState('');

  const handleSendMessage = () => {
    if (!input.trim()) return;

    setMessages([...messages, { role: 'user', text: input }]);

    setTimeout(() => {
      const responses = [
        'I can help you find suppliers for your electronics requirements.',
        'Based on your profile, I recommend connecting with these 5 verified traders.',
        'Your lead scoring shows 3 hot leads ready for negotiation.',
        'I suggest reviewing your pending certifications to improve your verification score.',
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { role: 'assistant', text: randomResponse }]);
    }, 500);

    setInput('');
  };

  const suggestions = [
    'Find suppliers for my requirements',
    'Analyze my deal pipeline',
    'Review pending certifications',
    'Get lead recommendations',
    'Check verification status',
    'Schedule follow-ups',
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout>

      
      <div className="flex-1 overflow-auto flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary-container text-white p-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined notranslate text-2xl" translate="no">smart_toy</span>
            </div>
            <div>
              <h1 className="text-3xl font-headline font-black">KARM AI Assistant</h1>
              <p className="text-white/75">Your intelligent business partner</p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-auto p-8 flex flex-col">
          {messages.length === 1 ? (
            // Initial State with Suggestions
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="text-center max-w-lg">
                <div className="text-6xl mb-4">🤖</div>
                <h2 className="text-2xl font-headline font-black text-on-surface mb-4">
                  How can I help you today?
                </h2>
                <p className="text-on-surface-variant mb-8">
                  Ask me anything about deals, leads, suppliers, or your business growth
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(suggestion);
                        setTimeout(() => handleSendMessage(), 0);
                      }}
                      className="p-3 bg-surface-container rounded-lg border border-outline-variant hover:border-primary hover:bg-primary/5 transition-colors text-sm font-headline font-bold text-on-surface text-left"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Chat Messages
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md px-4 py-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-surface-container border border-outline-variant text-on-surface'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-8 border-t border-outline-variant bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleSendMessage}
                className="px-6 py-3 bg-primary text-white font-headline font-bold rounded-lg hover:bg-primary-container transition-colors"
              >
                <span className="material-symbols-outlined notranslate" translate="no">send</span>
              </button>
            </div>
          </div>
        </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
    );
  }
