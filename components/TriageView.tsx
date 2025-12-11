import React, { useState, useRef, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';
import { ChatMessage } from '../types';

const TriageView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      text: 'Hello. I am Dr. Gemini, your dedicated medical agent. I can see your location and help find nearby care if needed. \n\nPlease describe your symptoms in detail.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{latitude: number; longitude: number} | undefined>(undefined);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get Location on Mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => console.log("Location access denied or error:", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const historyTexts = messages.map(m => `${m.role === 'model' ? 'Doctor' : 'Patient'}: ${m.text}`);
      
      const triageResult = await GeminiService.assessCrisis(
        currentInput, 
        historyTexts,
        location
      );

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: triageResult.advice,
        isUrgent: triageResult.requiresEmergency,
        groundingChunks: triageResult.groundingChunks
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: 'I am experiencing a connection interruption. If you are in severe distress, please contact emergency services immediately.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render map chips
  const renderMapChips = (chunks: any[]) => {
    if (!chunks || chunks.length === 0) return null;
    
    // Extract map data
    const mapItems = chunks
      .filter(c => c.web?.uri && c.web?.title)
      .map((c, i) => ({
        id: i,
        title: c.web.title,
        uri: c.web.uri
      }));

    if (mapItems.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {mapItems.map((item) => (
          <a 
            key={item.id}
            href={item.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 transition-colors group"
          >
             <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700">
               <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
             </div>
             <div className="flex flex-col">
               <span className="text-xs font-bold text-zinc-200 truncate max-w-[120px]">{item.title}</span>
               <span className="text-[10px] text-sky-500 font-medium">Open Maps</span>
             </div>
          </a>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-black pb-20 relative">
      {/* Medical Header */}
      <div className="flex-none px-6 py-4 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <h2 className="text-lg font-medium tracking-tight text-white uppercase">Medical Agent <span className="text-zinc-600">|</span> <span className="text-sky-500">Active</span></h2>
          </div>
          <div className="flex items-center gap-2 mt-1">
             <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase pl-4">Dr. Gemini Grounded</p>
             {location && <span className="text-[10px] bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-800">GPS ON</span>}
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <svg className="w-4 h-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
        </div>
      </div>

      {/* Chat Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}
          >
            {/* Avatar / Role Label */}
            <span className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 px-1 ${msg.role === 'user' ? 'text-zinc-500' : 'text-sky-500'}`}>
              {msg.role === 'user' ? 'Patient' : 'Dr. Gemini'}
            </span>

            {/* Message Bubble */}
            <div
              className={`max-w-[90%] rounded-2xl p-5 text-sm leading-relaxed shadow-md whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-zinc-800 text-white rounded-tr-none border border-zinc-700'
                  : msg.isUrgent
                  ? 'bg-red-950/20 text-red-100 border border-red-500/30 rounded-tl-none'
                  : 'bg-gradient-to-br from-zinc-900 to-black text-zinc-300 border border-zinc-800 rounded-tl-none'
              }`}
            >
              {msg.isUrgent && (
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-red-500/20">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="text-red-400 font-bold uppercase text-xs tracking-widest">High Priority Alert</span>
                </div>
              )}
              {msg.text}
              
              {/* Render Map Data if exists */}
              {msg.groundingChunks && renderMapChips(msg.groundingChunks)}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex flex-col items-start animate-fade-in">
             <span className="text-[10px] font-bold uppercase tracking-widest mb-1.5 px-1 text-sky-500">
              Dr. Gemini
            </span>
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl rounded-tl-none p-5 flex items-center gap-4">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 border-2 border-sky-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-2 border-sky-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-sky-400 text-xs font-bold uppercase tracking-widest animate-pulse">Locating Care...</span>
                <span className="text-zinc-600 text-[10px] font-medium mt-0.5">Checking maps & protocols</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-none p-4 bg-black border-t border-zinc-900/50 backdrop-blur-sm">
        <div className="relative flex items-center gap-2">
          {/* Text Input */}
          <div className="relative flex-1 group">
            <div className="absolute inset-0 bg-sky-500/5 rounded-2xl blur-xl group-hover:bg-sky-500/10 transition-all opacity-0 group-hover:opacity-100"></div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type to speak to Dr. Gemini..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-5 pr-4 py-4 text-white placeholder-zinc-600 focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/20 outline-none transition-all text-sm font-medium relative z-10"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-4 bg-sky-600 hover:bg-sky-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-2xl transition-all z-20 shadow-lg shadow-sky-900/20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TriageView;