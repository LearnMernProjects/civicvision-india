'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Complaint, MapMode } from '@/types';
import { useCivicStore } from '@/lib/store';

// Dynamic imports to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => ({ default: mod.MapContainer })), 
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => ({ default: mod.TileLayer })), 
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then(mod => ({ default: mod.Marker })), 
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then(mod => ({ default: mod.Popup })), 
  { ssr: false }
);
const Circle = dynamic(
  () => import('react-leaflet').then(mod => ({ default: mod.Circle })), 
  { ssr: false }
);

const statusColors = {
  reported: '#EF4444',     // Red for reported
  verified: '#F59E0B',     // Orange for verified  
  in_progress: '#8B5CF6',  // Purple for in progress
  resolved: '#22C55E',     // Green for resolved
  escalated: '#DC2626',    // Dark red for escalated
};

const severityColors = {
  low: '#60A5FA',
  medium: '#F59E0B',
  high: '#EF4444',
};

interface MapHeatViewProps {
  complaints: Complaint[];
  mapMode: MapMode;
  selectedComplaint: Complaint | null;
  onComplaintClick: (complaint: Complaint) => void;
}

export default function MapHeatView({ complaints, mapMode, selectedComplaint, onComplaintClick }: MapHeatViewProps) {
  const [isClient, setIsClient] = useState(false);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    setIsClient(true);
    // Fix for default markers in react-leaflet
    if (typeof window !== 'undefined') {
      const DefaultIcon = require('leaflet').Icon.Default.prototype as any;
      DefaultIcon._getIconUrl = undefined;
      require('leaflet').Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    }
  }, []);

  // Auto-fit map bounds when complaints change
  useEffect(() => {
    if (!isClient || !mapRef.current || complaints.length === 0) return;
    
    // Access map instance directly from ref after a short delay to ensure it's initialized
    const timer = setTimeout(() => {
      const mapInstance = mapRef.current;
      if (!mapInstance) return;
      
      // Dynamically import Leaflet classes
      import('leaflet').then((leaflet: any) => {
        const LatLngBounds = leaflet.LatLngBounds;
        const bounds = new LatLngBounds(
          complaints.map(c => [c.lat, c.lng])
        );
        
        if (bounds.isValid()) {
          mapInstance.fitBounds(bounds, { padding: [50, 50] });
        }
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [complaints, isClient]);

  if (!isClient) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  const createCustomIcon = (complaint: Complaint) => {
    const DivIcon = require('leaflet').DivIcon;
    const color = statusColors[complaint.status as keyof typeof statusColors];
    const isReported = complaint.status === 'reported';
    const size = isReported ? 20 : 16; // Larger size for red dots
    const anchor = isReported ? 10 : 8;
    
    return new DivIcon({
      html: `
        <div style="
          position: relative;
          width: ${size}px;
          height: ${size}px;
        ">
          ${isReported ? `
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${size * 2}px;
            height: ${size * 2}px;
            background-color: ${color};
            border-radius: 50%;
            opacity: 0.3;
            animation: pulse 2s infinite;
          "></div>
          ` : ''}
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: ${color};
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 3px 6px rgba(0,0,0,0.4);
          "></div>
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
            50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.1; }
          }
        </style>
      `,
      className: 'custom-marker',
      iconSize: [size, size],
      iconAnchor: [anchor, anchor],
    });
  };

  const renderHeatmap = () => {
    // Simple heatmap simulation using circles
    return complaints.map((complaint) => {
      const intensity = complaint.severity === 'high' ? 0.8 : 
                       complaint.severity === 'medium' ? 0.5 : 0.3;
      
      return (
        <Circle
          key={`heatmap-${complaint.id}`}
          center={[complaint.lat, complaint.lng]}
          radius={500}
          pathOptions={{
            fillColor: severityColors[complaint.severity as keyof typeof severityColors],
            fillOpacity: intensity * 0.3,
            stroke: false,
          }}
        />
      );
    });
  };

  const renderMarkers = () => {
    return complaints.map((complaint) => (
      <Marker
        key={`marker-${complaint.id}`}
        position={[complaint.lat, complaint.lng]}
        icon={createCustomIcon(complaint)}
        eventHandlers={{
          click: () => onComplaintClick(complaint),
        }}
      >
        <Popup>
          <div className="p-2">
            <h3 className="font-semibold text-gray-800">{complaint.title}</h3>
            <p className="text-sm text-gray-600">{complaint.description}</p>
            <div className="mt-2 space-y-1">
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800`}>
                {complaint.type.replace('_', ' ')}
              </span>
              <br />
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full`} 
                    style={{ backgroundColor: statusColors[complaint.status as keyof typeof statusColors], color: 'white' }}>
                {complaint.status.replace('_', ' ')}
              </span>
              {complaint.plateNumber && (
                <>
                  <br />
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    Plate: {complaint.plateNumber}
                  </span>
                </>
              )}
            </div>
          </div>
        </Popup>
      </Marker>
    ));
  };

  return (
    <div className="h-full w-full relative">
      <MapContainer
        ref={mapRef}
        center={[19.1136, 72.8697]} // Andheri center
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
        className="rounded-xl z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        {mapMode.type === 'heatmap' ? renderHeatmap() : renderMarkers()}
      </MapContainer>
    </div>
  );
}
