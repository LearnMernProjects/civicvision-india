import { PlateDetection, ImageAuthenticity } from '@/types';

export const detectPlateFromImage = async (file: File): Promise<PlateDetection | null> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // 30% chance of not finding a plate (more realistic)
  if (Math.random() < 0.3) {
    return null;
  }
  
  // Generate random plate number
  const states = ['MH', 'GJ', 'KA', 'DL'];
  const state = states[Math.floor(Math.random() * states.length)];
  const numbers = Math.floor(Math.random() * 99).toString().padStart(2, '0');
  const letters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
                  String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const plateNumber = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  
  return {
    plate: `${state}${numbers}${letters}${plateNumber}`,
    bbox: {
      x: 50 + Math.random() * 100,
      y: 80 + Math.random() * 50,
      w: 120 + Math.random() * 80,
      h: 40 + Math.random() * 20
    },
    confidence: 0.7 + Math.random() * 0.29 // Confidence between 70-99%
  };
};

export const simulateImageAuthenticityCheck = async (file: File): Promise<ImageAuthenticity> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Randomly generate authenticity scores
  const aiProbability = Math.random();
  const authenticityScore = 1 - aiProbability;
  
  let decision: ImageAuthenticity['decision'] = 'AUTHENTIC';
  if (aiProbability > 0.8) {
    decision = 'BLOCKED';
  } else if (aiProbability > 0.6) {
    decision = 'FLAGGED';
  }
  
  return {
    authenticityScore,
    aiGeneratedProbability: aiProbability,
    decision
  };
};

export const simulatePlateDetection = (file: File): Promise<PlateDetection> => {
  return detectPlateFromImage(file);
};
