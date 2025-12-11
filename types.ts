export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  TRIAGE = 'TRIAGE',
  IMMERSIVE = 'IMMERSIVE',
  JOURNAL = 'JOURNAL',
  PROFILE = 'PROFILE'
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface UserData {
  medications: Medication[];
  entries: JournalEntry[];
  sickleCellType: string;
  patientInfo: PatientInfo;
}

export interface PatientInfo {
  doctorName: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  bloodType: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  takenToday: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  isUrgent?: boolean;
  groundingChunks?: any[]; // For Google Maps data
}

export interface JournalEntry {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  painLevel: number; // 1-10
  triggers: string[];
  notes: string;
  activityContext?: 'School' | 'Work' | 'Home' | 'Exercise' | 'Other';
  isCrisis?: boolean;
  medsTaken?: boolean;
}

export interface TriageResponse {
  severity: number;
  advice: string;
  requiresEmergency: boolean;
  followUpQuestion?: string;
  groundingChunks?: any[];
}

export interface ImmersiveScene {
  id: string;
  name: string;
  prompt: string;
  baseColor: string;
  description: string;
}