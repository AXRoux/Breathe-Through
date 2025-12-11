import { User, UserData, Medication, JournalEntry } from "../types";

const USERS_KEY = "breathethrough_users";
const DATA_PREFIX = "breathethrough_data_";
const SESSION_KEY = "breathethrough_session";

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const StorageService = {
  // --- Auth Management ---

  async register(email: string, password: string, name: string): Promise<User> {
    await delay(500);
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    
    if (users.find((u: any) => u.email === email)) {
      throw new Error("User already exists");
    }

    const newUser = { id: Date.now().toString(), email, password, name };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Initialize empty data for user
    const initialData: UserData = { 
      medications: [], 
      entries: [], 
      sickleCellType: 'SS',
      patientInfo: {
        doctorName: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        bloodType: ''
      }
    };
    localStorage.setItem(DATA_PREFIX + newUser.id, JSON.stringify(initialData));

    this.setSession(newUser);
    return { id: newUser.id, email: newUser.email, name: newUser.name };
  },

  async login(email: string, password: string): Promise<User> {
    await delay(500);
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const safeUser = { id: user.id, email: user.email, name: user.name };
    this.setSession(safeUser);
    return safeUser;
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser(): User | null {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  setSession(user: User) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  },

  // --- Database Management ---

  async getUserData(userId: string): Promise<UserData> {
    const dataString = localStorage.getItem(DATA_PREFIX + userId);
    const defaultData: UserData = { 
      medications: [], 
      entries: [], 
      sickleCellType: 'SS',
      patientInfo: {
        doctorName: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        bloodType: ''
      }
    };

    if (!dataString) return defaultData;

    const parsedData = JSON.parse(dataString);
    // Merge with default to ensure new fields (like patientInfo) exist for old users
    return { ...defaultData, ...parsedData, patientInfo: { ...defaultData.patientInfo, ...(parsedData.patientInfo || {}) } };
  },

  async saveUserData(userId: string, data: UserData): Promise<void> {
    localStorage.setItem(DATA_PREFIX + userId, JSON.stringify(data));
  }
};
