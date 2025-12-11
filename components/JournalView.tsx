import React, { useState, useMemo } from 'react';
import { GeminiService } from '../services/geminiService';
import { JournalEntry } from '../types';

interface JournalViewProps {
  entries: JournalEntry[];
  onAddEntry: (entry: JournalEntry) => void;
}

const JournalView: React.FC<JournalViewProps> = ({ entries, onAddEntry }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [painLevel, setPainLevel] = useState(0); // Default to 0 (Wellness)
  const [notes, setNotes] = useState('');
  const [context, setContext] = useState<string>('Home');
  const [isCrisis, setIsCrisis] = useState(false);
  const [medsTaken, setMedsTaken] = useState(false);

  // Calendar Logic
  const currentDate = new Date();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = useMemo(() => {
    const d = [];
    for (let i = 0; i < firstDayOfMonth; i++) d.push(null);
    for (let i = 1; i <= daysInMonth; i++) d.push(i);
    return d;
  }, [daysInMonth, firstDayOfMonth]);

  const getEntryForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return entries.find(e => e.date === dateStr);
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    const existing = entries.find(e => e.date === dateStr);
    if (existing) {
      setPainLevel(existing.painLevel);
      setNotes(existing.notes);
      setContext(existing.activityContext || 'Home');
      setIsCrisis(existing.isCrisis || false);
      setMedsTaken(existing.medsTaken || false);
      setShowForm(false);
    } else {
      setPainLevel(0); // Default new entries to 0 (Wellness)
      setNotes('');
      setContext('Home');
      setIsCrisis(false);
      setMedsTaken(false);
      setShowForm(true);
    }
  };

  const saveEntry = () => {
    onAddEntry({
      id: Date.now().toString(),
      date: selectedDate,
      painLevel,
      triggers: [],
      notes,
      activityContext: context as any,
      isCrisis,
      medsTaken
    });
    setShowForm(false);
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await GeminiService.analyzePatterns(entries);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const selectedEntry = entries.find(e => e.date === selectedDate);

  return (
    <div className="flex flex-col h-full bg-black pb-24 overflow-y-auto">
      <div className="p-6">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-light tracking-tight text-white">Pain Journal</h2>
            <p className="text-zinc-500 text-sm font-medium mt-1">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
          </div>
        </header>

        {/* Calendar Grid */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 mb-8">
          <div className="grid grid-cols-7 gap-2 mb-4 text-center">
            {['S','M','T','W','T','F','S'].map(d => (
              <div key={d} className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;
              const entry = getEntryForDay(day);
              const isSelected = selectedDate.endsWith(String(day).padStart(2, '0'));
              
              let bgClass = 'bg-black/40 text-zinc-400 hover:bg-zinc-800 border border-zinc-800/50';
              if (isSelected) bgClass = 'ring-1 ring-sky-500 bg-sky-500/10 text-white border-sky-500/50';
              
              let indicator = null;
              if (entry) {
                if (entry.painLevel > 7) indicator = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
                else if (entry.painLevel > 4) indicator = 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
                else if (entry.painLevel === 0) indicator = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'; // Green for 0 pain
                else indicator = 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]';
              }

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all duration-300 ${bgClass}`}
                >
                  <span className="text-xs font-medium">{day}</span>
                  {entry?.isCrisis && (
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full border border-red-500 bg-red-500/50 animate-pulse"></div>
                  )}
                  {indicator && (
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${indicator}`} />
                  )}
                  {entry?.medsTaken && (
                    <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-green-500"></div>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex gap-4 justify-center mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full border border-red-500 bg-red-500/50"></div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Crisis</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]"></div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Zero Pain</span>
            </div>
          </div>
        </div>

        {/* Selected Day Details */}
        <div className="mb-8 animate-fade-in">
          <h3 className="text-zinc-100 font-medium mb-4 flex items-center justify-between">
            <span className="text-sky-500 tracking-wide text-sm font-bold uppercase">{new Date(selectedDate).toLocaleDateString()}</span>
            {selectedEntry && (
              <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${selectedEntry.painLevel > 6 ? 'bg-red-900/20 text-red-400 border-red-900/40' : selectedEntry.painLevel === 0 ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/40' : 'bg-sky-900/20 text-sky-400 border-sky-900/40'}`}>
                Pain Level: {selectedEntry.painLevel}
              </span>
            )}
          </h3>

          {showForm ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              {/* Pain Slider */}
              <div className="flex justify-between items-center mb-2">
                <label className="text-zinc-500 text-xs font-bold uppercase tracking-wider block">Pain Intensity (0-10)</label>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${painLevel === 0 ? 'text-emerald-400 bg-emerald-950/30' : 'text-sky-400 bg-sky-950/30'}`}>{painLevel}</span>
              </div>
              <input 
                type="range" min="0" max="10" 
                value={painLevel} onChange={(e) => setPainLevel(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer mb-6 accent-sky-500"
              />
              
              {/* Context Chips */}
              <label className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2 block">Context</label>
              <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {['Home', 'School', 'Work', 'Exercise'].map(ctx => (
                  <button
                    key={ctx}
                    onClick={() => setContext(ctx)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors border ${context === ctx ? 'bg-sky-500 border-sky-500 text-white' : 'bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
                  >
                    {ctx}
                  </button>
                ))}
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 gap-3 mb-6">
                <div 
                  onClick={() => setIsCrisis(!isCrisis)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${isCrisis ? 'bg-red-900/10 border-red-500/50' : 'bg-black border-zinc-800'}`}
                >
                  <span className={`text-sm font-medium ${isCrisis ? 'text-red-400' : 'text-zinc-400'}`}>Did you experience a crisis?</span>
                  <div className={`w-10 h-6 rounded-full relative transition-colors ${isCrisis ? 'bg-red-500' : 'bg-zinc-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isCrisis ? 'left-5' : 'left-1'}`}></div>
                  </div>
                </div>

                <div 
                  onClick={() => setMedsTaken(!medsTaken)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${medsTaken ? 'bg-green-900/10 border-green-500/50' : 'bg-black border-zinc-800'}`}
                >
                  <span className={`text-sm font-medium ${medsTaken ? 'text-green-400' : 'text-zinc-400'}`}>Meds taken as prescribed?</span>
                  <div className={`w-10 h-6 rounded-full relative transition-colors ${medsTaken ? 'bg-green-500' : 'bg-zinc-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${medsTaken ? 'left-5' : 'left-1'}`}></div>
                  </div>
                </div>
              </div>

              <textarea
                value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe triggers, feelings..."
                className="w-full bg-black/40 border border-zinc-700 rounded-xl p-4 text-sm text-zinc-200 mb-4 focus:border-sky-500 outline-none transition-colors"
                rows={3}
              />
              <button onClick={saveEntry} className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-sky-900/20">Save Entry</button>
            </div>
          ) : selectedEntry ? (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
              <div className="flex flex-wrap gap-2 mb-4">
                 {selectedEntry.isCrisis && (
                   <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1">
                     <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div> Crisis Reported
                   </span>
                 )}
                 {selectedEntry.medsTaken && (
                   <span className="bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Meds Taken
                   </span>
                 )}
                 <span className="bg-black border border-zinc-800 text-zinc-500 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">{selectedEntry.activityContext}</span>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed">{selectedEntry.notes}</p>
            </div>
          ) : (
             <button onClick={() => setShowForm(true)} className="w-full py-4 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-sm hover:text-sky-500 hover:border-sky-500/50 transition-colors">
               + Log symptoms
             </button>
          )}
        </div>

        {/* AI Analysis */}
        <div className="bg-gradient-to-br from-zinc-900 to-black rounded-3xl p-6 border border-zinc-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-sky-500/10 transition-colors"></div>
          
          <div className="flex items-center gap-2 text-sky-400 font-semibold mb-3 relative z-10">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <span className="tracking-wide text-sm uppercase">Pattern Recognition</span>
          </div>
          
          <div className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line relative z-10 font-light">
            {analysis || "Gemini analyzes your logs to find hidden triggers between your pain levels, weather, and activities."}
          </div>

          <button 
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="mt-5 w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-zinc-700"
          >
            {isAnalyzing ? 'Processing...' : 'Analyze Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JournalView;