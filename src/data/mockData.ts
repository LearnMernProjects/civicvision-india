import { User, Complaint } from '@/types';

export const users: User[] = [
  { id: 1, name: "Rahul Sharma", city: "Mumbai", credits: 150 },
  { id: 2, name: "Aisha Patel", city: "Mumbai", credits: 230 },
  { id: 3, name: "Viraj Naik", city: "Mumbai", credits: 200 },
];

export const generateComplaints = (): Complaint[] => {
  const complaints: Complaint[] = [];
  const types: Complaint['type'][] = ['pothole', 'traffic_violation', 'garbage', 'street_light', 'other'];
  const statuses: Complaint['status'][] = ['reported', 'verified', 'in_progress', 'resolved', 'escalated'];
  const severities: Complaint['severity'][] = ['low', 'medium', 'high'];
  
  // Mumbai coordinates bounds
  const latMin = 19.0, latMax = 19.3;
  const lngMin = 72.8, lngMax = 72.9;
  
  const plateNumbers = ['MH02AB1234', 'MH01CD5678', 'MH03EF9012', 'MH12GH3456', 'MH45IJ7890'];
  
  // Real Mumbai area names
  const mumbaiAreas = [
    'Andheri', 'Bandra', 'Borivali', 'Chembur', 'Colaba', 'Dadar', 'Goregaon', 
    'Juhu', 'Kurla', 'Malad', 'Marine Lines', 'Matunga', 'Mazgaon', 'Mulund',
    'Powai', 'Santacruz', 'Sion', 'Vashi', 'Vikhroli', 'Worli', 'Ghatkopar',
    'Bhandup', 'Kandivali', 'Goregaon East', 'Andheri East', 'Bandra West',
    'Jogeshwari', 'Andheri West', 'Santacruz East', 'Santacruz West'
  ];
  
  for (let i = 1; i <= 30; i++) {
    const isHelmetUser = Math.random() > 0.7;
    const fineAmount = isHelmetUser ? Math.floor(Math.random() * 500) + 100 : undefined;
    const selectedArea = mumbaiAreas[Math.floor(Math.random() * mumbaiAreas.length)];
    
    complaints.push({
      id: i,
      title: `Issue #${i}`,
      description: `Reported issue in ${selectedArea}`,
      image: `/api/placeholder/400/300`,
      lat: latMin + Math.random() * (latMax - latMin),
      lng: lngMin + Math.random() * (lngMax - lngMin),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      plateNumber: Math.random() > 0.5 ? plateNumbers[Math.floor(Math.random() * plateNumbers.length)] : undefined,
      time: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      userId: users[Math.floor(Math.random() * users.length)].id,
      severity: severities[Math.floor(Math.random() * severities.length)],
      type: types[Math.floor(Math.random() * types.length)],
      city: 'Mumbai',
      area: selectedArea,
      finePaid: fineAmount,
      helmetUser: isHelmetUser,
    });
  }
  
  return complaints;
};

export const complaints = generateComplaints();
