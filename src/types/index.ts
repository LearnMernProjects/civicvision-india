export interface User {
  id: number;
  name: string;
  city: string;
  credits: number;
  avatar?: string;
}

export interface Complaint {
  id: number;
  title: string;
  description: string;
  image: string;
  lat: number;
  lng: number;
  status: 'reported' | 'verified' | 'in_progress' | 'resolved' | 'escalated';
  plateNumber?: string;
  time: Date;
  createdAt: string;
  userId: number;
  severity: 'low' | 'medium' | 'high';
  type: 'pothole' | 'traffic_violation' | 'garbage' | 'street_light' | 'water_logging' | 'illegal_parking' | 'other';
  city?: string;
  area?: string;
  finePaid?: number;
  helmetUser?: boolean;
}

export interface PlateDetection {
  plate: string;
  bbox: { x: number; y: number; w: number; h: number };
  confidence: number;
}

export interface ImageAuthenticity {
  authenticityScore: number;
  aiGeneratedProbability: number;
  decision: 'AUTHENTIC' | 'FLAGGED' | 'BLOCKED';
}

export interface MapMode {
  type: 'heatmap' | 'markers';
}

export interface CivicStats {
  totalComplaints: number;
  resolvedCount: number;
  verifiedCount: number;
  inProgressCount: number;
  escalatedCount: number;
}
