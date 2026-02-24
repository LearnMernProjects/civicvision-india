import { create } from 'zustand';
import { User, Complaint, PlateDetection, MapMode, CivicStats } from '@/types';
import { users, complaints } from '@/data/mockData';

interface CivicStore {
  // State
  currentUser: User | null;
  users: User[];
  complaints: Complaint[];
  selectedComplaint: Complaint | null;
  detectedPlate: PlateDetection | null;
  mapMode: MapMode;
  isLoading: boolean;
  
  // Computed
  stats: CivicStats;
  
  // Actions
  setCurrentUser: (user: User | null) => void;
  addComplaint: (complaint: Complaint) => void;
  updateComplaint: (id: number, updates: Partial<Complaint>) => void;
  setSelectedComplaint: (complaint: Complaint | null) => void;
  setDetectedPlate: (plate: PlateDetection | null) => void;
  setMapMode: (mode: MapMode) => void;
  setLoading: (loading: boolean) => void;
  increaseUserCredits: (userId: number, amount: number) => void;
  updateStats: () => void;
}

export const useCivicStore = create<CivicStore>((set, get) => {
  // Calculate initial stats
  const calculateStats = (complaints: Complaint[]): CivicStats => ({
    totalComplaints: complaints.length,
    resolvedCount: complaints.filter(c => c.status === 'resolved').length,
    verifiedCount: complaints.filter(c => c.status === 'verified').length,
    inProgressCount: complaints.filter(c => c.status === 'in_progress').length,
    escalatedCount: complaints.filter(c => c.status === 'escalated').length,
  });

  return {
    // Initial state
    currentUser: null,
    users,
    complaints,
    selectedComplaint: null,
    detectedPlate: null,
    mapMode: { type: 'heatmap' },
    isLoading: false,
    
    // Initial stats
    stats: calculateStats(complaints),
    
    // Actions
    setCurrentUser: (user) => set({ currentUser: user }),
    
    addComplaint: (complaint) => set((state) => {
      const newComplaints = [...state.complaints, complaint];
      return {
        complaints: newComplaints,
        stats: calculateStats(newComplaints)
      };
    }),
    
    updateComplaint: (id, updates) => set((state) => {
      const newComplaints = state.complaints.map(c => 
        c.id === id ? { ...c, ...updates } : c
      );
      return {
        complaints: newComplaints,
        stats: calculateStats(newComplaints)
      };
    }),
    
    setSelectedComplaint: (complaint) => set({ selectedComplaint: complaint }),
    
    setDetectedPlate: (plate) => set({ detectedPlate: plate }),
    
    setMapMode: (mode) => set({ mapMode: mode }),
    
    setLoading: (loading) => set({ isLoading: loading }),
    
    increaseUserCredits: (userId, amount) => set((state) => ({
      users: state.users.map(u => 
        u.id === userId ? { ...u, credits: u.credits + amount } : u
      ),
      currentUser: state.currentUser?.id === userId 
        ? { ...state.currentUser, credits: state.currentUser.credits + amount }
        : state.currentUser
    })),
    
    updateStats: () => set((state) => ({
      stats: calculateStats(state.complaints)
    })),
  };
});
