import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import TriageView from './components/TriageView';
import ImmersiveView from './components/ImmersiveView';
import JournalView from './components/JournalView';
import ProfileView from './components/ProfileView';
import AuthView from './components/AuthView';
import { ViewState, Medication, JournalEntry, User, PatientInfo } from './types';
import { StorageService } from './services/storageService';

// Dashboard Component - Medical Intuitive
interface DashboardProps {
  user: User;
  onNavigate: (v: ViewState) => void;
  medications: Medication[];
  onToggleMed: (id: string) => void;
  entries: JournalEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate, medications, onToggleMed, entries }) => {
  // Logic for Last Crisis based on explicit flag
  const lastCrisisEntry = entries
    .filter(e => e.isCrisis)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
  const daysSinceLastCrisis = lastCrisisEntry 
    ? Math.floor((Date.now() - new Date(lastCrisisEntry.date).getTime()) / (1000 * 60 * 60 * 24)) 
    : 'N/A';

  // Logic for Historical Adherence from Journal
  const adherencePercentage = React.useMemo(() => {
    if (entries.length === 0) return 0;
    const takenCount = entries.filter(e => e.medsTaken).length;
    return Math.round((takenCount / entries.length) * 100);
  }, [entries]);

  // Current status check
  const lastEntry = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const isHighPain = lastEntry && lastEntry.painLevel > 6;

  return (
    <div className="flex flex-col h-full p-6 bg-black pb-24 overflow-y-auto">
      <header className="mb-8 mt-4 flex justify-between items-end animate-fade-in">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-white">Patient Summary</h1>
          <p className="text-zinc-500 text-sm font-medium">Welcome back, {user.name.split(' ')[0]}</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border ${isHighPain ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-sky-500/10 text-sky-400 border-sky-500/20'}`}>
          {isHighPain ? 'MONITOR CLOSELY' : 'STABLE'}
        </div>
      </header>

      {/* Vitals / Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8 animate-fade-in" style={{animationDelay: '100ms'}}>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
          <p className="text-zinc-500 text-xs font-bold tracking-widest uppercase mb-2">Crisis Free</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-light text-white">{daysSinceLastCrisis}</span>
            <span className="text-xs font-medium text-zinc-600">days</span>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
          <p className="text-zinc-500 text-xs font-bold tracking-widest uppercase mb-2">Log Adherence</p>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-light ${adherencePercentage > 80 ? 'text-green-400' : adherencePercentage > 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {adherencePercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h3 className="text-zinc-400 text-xs font-bold tracking-widest uppercase mb-4">Immediate Actions</h3>
      <div className="grid grid-cols-2 gap-4 mb-10 animate-fade-in" style={{animationDelay: '200ms'}}>
        <button 
          onClick={() => onNavigate(ViewState.TRIAGE)}
          className="group relative bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-red-900/50 p-5 rounded-2xl text-left transition-all duration-300 flex flex-col justify-between h-32 overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-red-500/10"></div>
          <svg className="w-8 h-8 text-red-400 mb-2 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <div className="relative z-10">
            <span className="block font-semibold text-zinc-100 text-lg">Report Pain</span>
            <span className="text-xs text-zinc-500 group-hover:text-zinc-400">Start Triage AI</span>
          </div>
        </button>

        <button 
          onClick={() => onNavigate(ViewState.IMMERSIVE)}
          className="group relative bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-sky-900/50 p-5 rounded-2xl text-left transition-all duration-300 flex flex-col justify-between h-32 overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-sky-500/10"></div>
          <svg className="w-8 h-8 text-sky-400 mb-2 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          <div className="relative z-10">
            <span className="block font-semibold text-zinc-100 text-lg">Breathe</span>
            <span className="text-xs text-zinc-500 group-hover:text-zinc-400">Immersive Therapy</span>
          </div>
        </button>
      </div>

      {/* Dynamic Medication List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8 animate-fade-in" style={{animationDelay: '300ms'}}>
         <div className="flex justify-between items-center mb-6">
           <h3 className="text-zinc-100 font-medium tracking-tight">Today's Regimen</h3>
           <button onClick={() => onNavigate(ViewState.PROFILE)} className="text-sky-500 hover:text-sky-400 text-xs font-semibold tracking-wide uppercase">Manage</button>
         </div>
         
         {medications.length === 0 ? (
           <div className="text-center py-6">
             <p className="text-zinc-600 text-sm mb-3">No medications configured.</p>
             <button onClick={() => onNavigate(ViewState.PROFILE)} className="text-sky-500 text-sm hover:underline">Configure Regimen</button>
           </div>
         ) : (
           <div className="space-y-3">
             {medications.map(med => (
               <div key={med.id} className="group flex items-center bg-black/40 p-4 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all">
                 <button 
                   onClick={() => onToggleMed(med.id)}
                   className={`w-6 h-6 rounded-full border flex items-center justify-center mr-4 transition-all duration-300 ${med.takenToday ? 'bg-sky-500 border-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.3)]' : 'border-zinc-600 hover:border-sky-500 bg-transparent'}`}
                 >
                   {med.takenToday && <svg className="w-3.5 h-3.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                 </button>
                 <div className="flex-1">
                   <p className={`font-medium text-sm transition-colors ${med.takenToday ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{med.name}</p>
                   <p className="text-xs text-zinc-500 mt-0.5">{med.dosage} • {med.frequency}</p>
                 </div>
               </div>
             ))}
           </div>
         )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [sickleCellType, setSickleCellType] = useState<string>('SS');
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({ doctorName: '', emergencyContactName: '', emergencyContactPhone: '', bloodType: '' });
  const [loadingData, setLoadingData] = useState(false);

  // Authentication Check (Middleware)
  useEffect(() => {
    const currentUser = StorageService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadUserData(currentUser.id);
    }
  }, []);

  const loadUserData = async (userId: string) => {
    setLoadingData(true);
    try {
      const data = await StorageService.getUserData(userId);
      setMedications(data.medications);
      setEntries(data.entries);
      setSickleCellType(data.sickleCellType || 'SS');
      setPatientInfo(data.patientInfo || { doctorName: '', emergencyContactName: '', emergencyContactPhone: '', bloodType: '' });
    } catch (e) {
      console.error("Failed to load user data", e);
    } finally {
      setLoadingData(false);
    }
  };

  const saveData = async (updatedMeds: Medication[], updatedEntries: JournalEntry[], updatedType: string, updatedInfo: PatientInfo) => {
    if (!user) return;
    try {
      await StorageService.saveUserData(user.id, { 
        medications: updatedMeds, 
        entries: updatedEntries,
        sickleCellType: updatedType,
        patientInfo: updatedInfo
      });
    } catch (e) {
      console.error("Failed to save data", e);
    }
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    loadUserData(loggedInUser.id);
  };

  const handleLogout = () => {
    StorageService.logout();
    setUser(null);
    setMedications([]);
    setEntries([]);
    setSickleCellType('SS');
    setPatientInfo({ doctorName: '', emergencyContactName: '', emergencyContactPhone: '', bloodType: '' });
    setCurrentView(ViewState.DASHBOARD);
  };

  // Data Manipulation Handlers
  const handleAddMed = (med: Medication) => {
    const newMeds = [...medications, med];
    setMedications(newMeds);
    saveData(newMeds, entries, sickleCellType, patientInfo);
  };

  const handleRemoveMed = (id: string) => {
    const newMeds = medications.filter(m => m.id !== id);
    setMedications(newMeds);
    saveData(newMeds, entries, sickleCellType, patientInfo);
  };

  const toggleMedication = (id: string) => {
    const newMeds = medications.map(m => m.id === id ? { ...m, takenToday: !m.takenToday } : m);
    setMedications(newMeds);
    saveData(newMeds, entries, sickleCellType, patientInfo);
  };

  const handleAddEntry = (entry: JournalEntry) => {
    let newEntries;
    const existingIdx = entries.findIndex(e => e.date === entry.date);
    if (existingIdx >= 0) {
      newEntries = [...entries];
      newEntries[existingIdx] = entry;
    } else {
      newEntries = [...entries, entry];
    }
    setEntries(newEntries);
    saveData(medications, newEntries, sickleCellType, patientInfo);
  };
  
  const handleUpdateType = (type: string) => {
    setSickleCellType(type);
    saveData(medications, entries, type, patientInfo);
  };

  const handleUpdatePatientInfo = (info: PatientInfo) => {
    setPatientInfo(info);
    saveData(medications, entries, sickleCellType, info);
  };

  // Auth Guard
  if (!user) {
    return <AuthView onLogin={handleLogin} />;
  }

  const renderView = () => {
    if (loadingData) {
      return <div className="h-full flex items-center justify-center text-sky-500 font-light tracking-widest text-sm uppercase">Loading health data...</div>;
    }

    switch (currentView) {
      case ViewState.TRIAGE: return <TriageView />;
      case ViewState.IMMERSIVE: return <ImmersiveView />;
      case ViewState.JOURNAL: return <JournalView entries={entries} onAddEntry={handleAddEntry} />;
      case ViewState.PROFILE: return <ProfileView user={user} medications={medications} sickleCellType={sickleCellType} patientInfo={patientInfo} onUpdateSickleCellType={handleUpdateType} onUpdatePatientInfo={handleUpdatePatientInfo} onAddMedication={handleAddMed} onRemoveMedication={handleRemoveMed} onLogout={handleLogout} />;
      default: return <Dashboard user={user} onNavigate={setCurrentView} medications={medications} onToggleMed={toggleMedication} entries={entries} />;
    }
  };

  return (
    <div className="h-screen w-screen bg-black text-zinc-100 flex flex-col font-sans antialiased selection:bg-sky-500/30">
      <div className="flex-1 overflow-hidden relative">
        {renderView()}
      </div>
      <Navigation currentView={currentView} onNavigate={setCurrentView} />
    </div>
  );
};

export default App;