import React, { useState } from 'react';
import { Medication, User, PatientInfo } from '../types';

interface ProfileViewProps {
  user: User;
  medications: Medication[];
  sickleCellType: string;
  patientInfo: PatientInfo;
  onUpdateSickleCellType: (type: string) => void;
  onUpdatePatientInfo: (info: PatientInfo) => void;
  onAddMedication: (med: Medication) => void;
  onRemoveMedication: (id: string) => void;
  onLogout: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ 
  user, 
  medications, 
  sickleCellType, 
  patientInfo,
  onUpdateSickleCellType, 
  onUpdatePatientInfo,
  onAddMedication, 
  onRemoveMedication, 
  onLogout 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  
  // Medication Form State
  const [newName, setNewName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newFreq, setNewFreq] = useState('');

  // Patient Info Form State
  const [editInfo, setEditInfo] = useState<PatientInfo>(patientInfo);

  const handleSaveMed = () => {
    if (!newName) return;
    onAddMedication({
      id: Date.now().toString(),
      name: newName,
      dosage: newDosage,
      frequency: newFreq || 'Daily',
      takenToday: false
    });
    setIsAdding(false);
    setNewName('');
    setNewDosage('');
    setNewFreq('');
  };

  const handleSaveInfo = () => {
    onUpdatePatientInfo(editInfo);
    setIsEditingInfo(false);
  };

  const startEditingInfo = () => {
    setEditInfo(patientInfo);
    setIsEditingInfo(true);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const sickleCellTypes = [
    { value: 'SS', label: 'HbSS (Sickle Cell Anemia)' },
    { value: 'SC', label: 'HbSC Disease' },
    { value: 'S-Beta0', label: 'HbS Beta-Zero Thalassemia' },
    { value: 'S-Beta+', label: 'HbS Beta-Plus Thalassemia' },
    { value: 'SD', label: 'HbSD' },
    { value: 'SE', label: 'HbSE' },
    { value: 'Trait', label: 'Sickle Cell Trait (AS)' },
    { value: 'Other', label: 'Other' },
  ];

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="flex flex-col h-full bg-black pb-24 overflow-y-auto">
      <div className="p-6">
        <header className="mb-10 flex justify-between items-start animate-fade-in">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center text-xl font-light tracking-widest text-white shadow-lg">
              {getInitials(user.name)}
            </div>
            <div>
              <h2 className="text-2xl font-light text-white">{user.name}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Type</span>
                <div className="relative">
                  <select 
                    value={sickleCellType}
                    onChange={(e) => onUpdateSickleCellType(e.target.value)}
                    className="appearance-none bg-zinc-900 text-sky-500 text-xs font-bold border border-zinc-800 rounded-lg pl-3 pr-8 py-1.5 focus:ring-1 focus:ring-sky-500 focus:outline-none uppercase tracking-wide cursor-pointer hover:border-zinc-700 transition-colors"
                  >
                    {sickleCellTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.value}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="text-zinc-500 hover:text-white text-[10px] uppercase font-bold tracking-widest border border-zinc-800 hover:border-zinc-600 px-4 py-2 rounded-full transition-all"
          >
            Sign Out
          </button>
        </header>

        <section className="mb-10 animate-fade-in" style={{animationDelay: '100ms'}}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Medication Regimen</h3>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="text-sky-500 hover:text-sky-400 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add New
            </button>
          </div>

          {isAdding && (
            <div className="bg-zinc-900 rounded-2xl p-5 mb-5 border border-zinc-800 animate-fade-in">
              <input
                type="text" placeholder="Medication Name"
                value={newName} onChange={e => setNewName(e.target.value)}
                className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white mb-3 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all placeholder-zinc-600"
              />
              <div className="flex gap-3 mb-4">
                <input
                  type="text" placeholder="Dosage (500mg)"
                  value={newDosage} onChange={e => setNewDosage(e.target.value)}
                  className="flex-1 min-w-0 bg-black border border-zinc-700 rounded-xl p-3 text-white text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all placeholder-zinc-600"
                />
                <input
                  type="text" placeholder="Freq (Daily)"
                  value={newFreq} onChange={e => setNewFreq(e.target.value)}
                  className="flex-1 min-w-0 bg-black border border-zinc-700 rounded-xl p-3 text-white text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all placeholder-zinc-600"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setIsAdding(false)} className="text-zinc-500 text-xs font-bold uppercase tracking-wide hover:text-zinc-300">Cancel</button>
                <button onClick={handleSaveMed} className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold uppercase tracking-wide px-5 py-2 rounded-lg transition-colors">Save</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {medications.length === 0 ? (
              <p className="text-zinc-600 text-sm italic py-2">No medications on file.</p>
            ) : (
              medications.map(med => (
                <div key={med.id} className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800 flex justify-between items-center group hover:border-zinc-700 transition-all">
                  <div>
                    <h4 className="text-zinc-200 font-medium">{med.name}</h4>
                    <p className="text-zinc-500 text-xs mt-0.5">{med.dosage} • {med.frequency}</p>
                  </div>
                  <button 
                    onClick={() => onRemoveMedication(med.id)}
                    className="text-zinc-600 hover:text-red-400 p-2 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="animate-fade-in" style={{animationDelay: '200ms'}}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Medical ID</h3>
             {isEditingInfo ? (
               <div className="flex gap-4">
                  <button onClick={() => setIsEditingInfo(false)} className="text-zinc-500 hover:text-zinc-300 text-[10px] font-bold uppercase tracking-wider">Cancel</button>
                  <button onClick={handleSaveInfo} className="text-sky-500 hover:text-sky-400 text-[10px] font-bold uppercase tracking-wider">Save Changes</button>
               </div>
             ) : (
               <button onClick={startEditingInfo} className="text-sky-500 hover:text-sky-400 text-xs font-bold uppercase tracking-wide">Edit Details</button>
             )}
          </div>

          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 space-y-5">
            <div className="flex justify-between border-b border-zinc-800 pb-4">
              <span className="text-zinc-500 text-sm">Condition</span>
              <span className="text-zinc-200 text-sm font-medium text-right">
                {sickleCellTypes.find(t => t.value === sickleCellType)?.label || sickleCellType}
              </span>
            </div>

            {isEditingInfo ? (
              <>
                <div className="space-y-2 border-b border-zinc-800 pb-5">
                  <label className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Primary Physician</label>
                  <input 
                    type="text" 
                    value={editInfo.doctorName}
                    onChange={(e) => setEditInfo({...editInfo, doctorName: e.target.value})}
                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                    placeholder="Dr. Name"
                  />
                </div>
                <div className="space-y-2 border-b border-zinc-800 pb-5">
                  <label className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Emergency Contact</label>
                  <input 
                    type="text" 
                    value={editInfo.emergencyContactName}
                    onChange={(e) => setEditInfo({...editInfo, emergencyContactName: e.target.value})}
                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white text-sm mb-2 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                    placeholder="Name"
                  />
                  <input 
                    type="tel" 
                    value={editInfo.emergencyContactPhone}
                    onChange={(e) => setEditInfo({...editInfo, emergencyContactPhone: e.target.value})}
                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                    placeholder="Phone Number"
                  />
                </div>
                <div className="space-y-3">
                   <label className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Blood Type</label>
                   <div className="flex flex-wrap gap-2">
                     {bloodTypes.map(type => (
                       <button
                         key={type}
                         onClick={() => setEditInfo({...editInfo, bloodType: type})}
                         className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${editInfo.bloodType === type ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/40' : 'bg-black border border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
                       >
                         {type}
                       </button>
                     ))}
                   </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between border-b border-zinc-800 pb-4">
                  <span className="text-zinc-500 text-sm">Primary Doctor</span>
                  <span className="text-zinc-200 text-sm font-medium">{patientInfo.doctorName || "Not set"}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-4">
                  <span className="text-zinc-500 text-sm">Emergency Contact</span>
                  <div className="text-right">
                    <div className="text-zinc-200 text-sm font-medium">{patientInfo.emergencyContactName || "Not set"}</div>
                    {patientInfo.emergencyContactPhone && <div className="text-xs text-sky-500 mt-0.5">{patientInfo.emergencyContactPhone}</div>}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-sm">Blood Type</span>
                  <span className="text-zinc-200 text-sm font-medium bg-zinc-800 px-2 py-0.5 rounded">{patientInfo.bloodType || "N/A"}</span>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfileView;