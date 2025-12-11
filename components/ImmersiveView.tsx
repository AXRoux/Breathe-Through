import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';

type BreathingTechnique = 'coherent' | 'box' | '478';

const ImmersiveView: React.FC = () => {
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBreathing, setIsBreathing] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [technique, setTechnique] = useState<BreathingTechnique>('coherent');

  // Extend window interface to include aistudio helper
  const win = window as any;

  const techniques = [
    { id: 'coherent', label: 'Resonance', desc: 'Balance (5s In, 5s Out)', class: 'animate-breathe-coherent' },
    { id: 'box', label: 'Box', desc: 'Focus (4-4-4-4)', class: 'animate-breathe-box' },
    { id: '478', label: '4-7-8', desc: 'Relax (4s In, 7s Hold, 8s Out)', class: 'animate-breathe-478' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // Check for API Key selection (Required for Gemini 3 Pro)
    if (win.aistudio) {
      const hasKey = await win.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        try {
          await win.aistudio.openSelectKey();
        } catch (e) {
          console.error("Key selection failed or cancelled", e);
          return;
        }
      }
    }

    setIsGenerating(true);
    
    try {
      const image = await GeminiService.generateImmersiveBackground(prompt);
      if (image) {
        setBgImage(image);
        setPrompt(''); // Clear input on success
      }
    } catch (error) {
      console.error("Failed to generate", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleBreathing = () => {
    setIsBreathing(!isBreathing);
    if (!isBreathing) {
      // Auto hide controls after a moment when starting
      setTimeout(() => setShowControls(false), 2000);
    } else {
      setShowControls(true);
    }
  };

  const currentTechnique = techniques.find(t => t.id === technique) || techniques[0];

  return (
    <div className="relative h-full w-full overflow-hidden bg-black flex flex-col">
      {/* Background Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ 
          backgroundImage: bgImage ? `url(${bgImage})` : 'none', 
          backgroundColor: bgImage ? 'transparent' : '#000000',
        }}
      >
         {/* Placeholder gradient if no image */}
         {!bgImage && (
           <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 flex items-center justify-center">
             <p className="text-zinc-600 text-sm font-light tracking-widest uppercase">Environment Not Set</p>
           </div>
         )}
         <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
      </div>

      {/* Breathing Element */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        {isBreathing && (
          <div className="relative">
            <div className={`w-72 h-72 rounded-full bg-sky-200/10 blur-3xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${currentTechnique.class}`}></div>
            <div className={`w-56 h-56 rounded-full border border-white/20 flex items-center justify-center text-white/90 font-light tracking-[0.3em] text-sm backdrop-blur-sm bg-white/5 ${currentTechnique.class}`}>
              BREATHE
            </div>
          </div>
        )}
      </div>

      {/* Tap area to toggle controls */}
      {!showControls && (
        <div 
          className="absolute inset-0 z-20" 
          onClick={() => setShowControls(true)}
        />
      )}

      {/* Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 w-full z-30 transition-transform duration-500 ease-out bg-gradient-to-t from-black via-black/90 to-transparent pb-24 pt-10 px-6 ${
          showControls ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-md mx-auto w-full">
           <div className="flex justify-between items-end mb-6">
             <div>
               <h3 className="text-white font-light text-lg tracking-tight">Immersive Space</h3>
               <p className="text-zinc-400 text-xs">Design your safe environment.</p>
             </div>
             
             <button
               onClick={toggleBreathing}
               className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                 isBreathing 
                  ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'
               }`}
             >
               {isBreathing ? 'Stop' : 'Start'}
             </button>
           </div>

           {/* Technique Selector */}
           <div className="mb-6">
             <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2 block">Breathing Pattern</label>
             <div className="grid grid-cols-3 gap-2">
               {techniques.map((t) => (
                 <button
                   key={t.id}
                   onClick={() => setTechnique(t.id as BreathingTechnique)}
                   className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all ${
                     technique === t.id 
                       ? 'bg-sky-500/20 border-sky-500/50 text-white' 
                       : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:bg-zinc-800'
                   }`}
                 >
                   <span className="text-[10px] font-bold uppercase tracking-wide">{t.label}</span>
                   {/* Optional: Add mini description if space allows, or keep clean */}
                 </button>
               ))}
             </div>
             <p className="text-center text-zinc-500 text-[10px] mt-2 font-medium">{currentTechnique.desc}</p>
           </div>

           {/* Generator Input */}
           <div className="relative group">
             <div className="absolute inset-0 bg-sky-500/5 rounded-2xl blur-xl group-hover:bg-sky-500/10 transition-all"></div>
             <div className="relative flex items-center bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-1.5 focus-within:border-sky-500/50 focus-within:ring-1 focus-within:ring-sky-500/20 transition-all">
               <input 
                 type="text" 
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                 placeholder="Describe a calm place (e.g., a quiet snowy cabin)..."
                 disabled={isGenerating}
                 className="flex-1 bg-transparent text-white placeholder-zinc-500 text-sm px-4 py-3 outline-none min-w-0"
               />
               <button 
                 onClick={handleGenerate}
                 disabled={isGenerating || !prompt.trim()}
                 className="p-3 bg-sky-600 hover:bg-sky-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl transition-colors shadow-lg shadow-sky-900/20"
               >
                 {isGenerating ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 ) : (
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                 )}
               </button>
             </div>
           </div>
           
           {isGenerating && (
             <p className="text-center text-sky-400/80 text-[10px] font-bold uppercase tracking-widest mt-3 animate-pulse">
               Constructing Environment with Nano Banana Pro...
             </p>
           )}
        </div>
      </div>
    </div>
  );
};

export default ImmersiveView;