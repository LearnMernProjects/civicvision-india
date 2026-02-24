'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCivicStore } from '@/lib/store';
import MapHeatView from '@/components/MapHeatView';
import { Complaint, MapMode } from '@/types';

export default function MapPage() {
  const complaints = useCivicStore(state => state.complaints);
  const selectedComplaint = useCivicStore(state => state.selectedComplaint);
  const mapMode = useCivicStore(state => state.mapMode);
  const setSelectedComplaint = useCivicStore(state => state.setSelectedComplaint);
  const setMapMode = useCivicStore(state => state.setMapMode);

  const [showLiveIssues, setShowLiveIssues] = useState(true);
  const [showResolvedAreas, setShowResolvedAreas] = useState(true);
  const [heatmapMode, setHeatmapMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state while mounting to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-emerald-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // Filter complaints based on toggle states
  const filteredComplaints = complaints.filter(complaint => {
    if (!mounted) return false; // Prevent hydration mismatch
    
    if (!showLiveIssues && complaint.status !== 'resolved') return false;
    if (!showResolvedAreas && complaint.status === 'resolved') return false;
    
    return true;
  });

  // Group complaints by area for clustering
  const groupedByArea = filteredComplaints.reduce((acc, complaint) => {
    const area = complaint.area || 'Unknown Area';
    if (!acc[area]) {
      acc[area] = {
        area,
        total: 0,
        unresolved: 0,
        resolved: 0,
        highSeverity: 0,
        todayCount: 0,
        complaints: []
      };
    }
    acc[area].total++;
    acc[area].complaints.push(complaint);
    
    if (complaint.status === 'resolved') {
      acc[area].resolved++;
    } else {
      acc[area].unresolved++;
    }
    
    if (complaint.severity === 'high') {
      acc[area].highSeverity++;
    }
    
    // Use a stable date comparison for today's complaints
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    const complaintDate = new Date(complaint.createdAt);
    complaintDate.setHours(0, 0, 0, 0); // Normalize to start of day
    
    if (complaintDate.getTime() === today.getTime()) {
      acc[area].todayCount++;
    }
    
    return acc;
  }, {} as Record<string, any>);

  const handleComplaintClick = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
  };

  const toggleHeatmapMode = () => {
    const newMode = heatmapMode ? 'markers' : 'heatmap';
    setHeatmapMode(!heatmapMode);
    setMapMode({ type: newMode });
  };

  return (
    <div className="min-h-screen bg-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-800">Civic Map - Andheri</h1>
          <p className="text-gray-600 mt-2">Real-time civic issue monitoring in Andheri, Mumbai</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-4 border border-emerald-100"
            >
              {/* Map Controls */}
              <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={toggleHeatmapMode}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      heatmapMode 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {heatmapMode ? 'Heatmap Mode' : 'Marker Mode'}
                  </button>
                  
                  <label className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                    <input
                      type="checkbox"
                      checked={showLiveIssues}
                      onChange={(e) => setShowLiveIssues(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium">Live Issues</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                    <input
                      type="checkbox"
                      checked={showResolvedAreas}
                      onChange={(e) => setShowResolvedAreas(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium">Resolved Areas</span>
                  </label>
                </div>

                <select
                  value="all"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled
                >
                  <option value="all">All Issues ({filteredComplaints.length})</option>
                </select>
              </div>

              {/* Map Container */}
              <div className="relative h-[500px] lg:h-[600px] rounded-xl overflow-hidden shadow-inner border-2 border-gray-200">
                <MapHeatView
                  complaints={filteredComplaints}
                  mapMode={{ type: heatmapMode ? 'heatmap' : 'markers' }}
                  selectedComplaint={selectedComplaint}
                  onComplaintClick={handleComplaintClick}
                />
                
                {/* Map Legend */}
                <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200 min-w-[180px]">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Status</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow"></div>
                      <span className="font-medium text-red-600">Reported (Red)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow"></div>
                      <span className="font-medium text-orange-600">Verified</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-purple-500 rounded-full border-2 border-white shadow"></div>
                      <span className="font-medium text-purple-600">In Progress</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></div>
                      <span className="font-medium text-green-600">Resolved (Green)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-red-700 rounded-full border-2 border-white shadow"></div>
                      <span className="font-medium text-red-700">Escalated</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">📍 Showing Andheri area</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Issues</span>
                  <span className="font-semibold">{mounted ? filteredComplaints.length : 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Unresolved</span>
                  <span className="font-semibold text-red-600">
                    {mounted ? filteredComplaints.filter(c => c.status !== 'resolved').length : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Resolved</span>
                  <span className="font-semibold text-green-600">
                    {mounted ? filteredComplaints.filter(c => c.status === 'resolved').length : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">High Priority</span>
                  <span className="font-semibold text-red-600">
                    {mounted ? filteredComplaints.filter(c => c.severity === 'high').length : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Today's Reports</span>
                  <span className="font-semibold text-blue-600">
                    {mounted ? filteredComplaints.filter(c => {
                      if (!mounted) return false;
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const complaintDate = new Date(c.createdAt);
                      complaintDate.setHours(0, 0, 0, 0);
                      return complaintDate.getTime() === today.getTime();
                    }).length : 0}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Area Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Areas by Status</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {Object.values(groupedByArea).map((area: any) => (
                  <div key={area.area} className="border-b border-gray-100 pb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-800">{area.area}</span>
                      <span className="text-sm text-gray-600">{area.total} issues</span>
                    </div>
                    <div className="flex space-x-2 text-xs">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">
                        {area.unresolved} unresolved
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        {area.resolved} resolved
                      </span>
                      {area.todayCount > 0 && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {area.todayCount} today
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Selected Complaint Details */}
            {selectedComplaint && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Selected Issue</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-gray-800">{selectedComplaint.title}</p>
                    <p className="text-sm text-gray-600">{selectedComplaint.description}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800`}>
                      {selectedComplaint.type.replace('_', ' ')}
                    </span>
                    <br />
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800`}>
                      {selectedComplaint.severity}
                    </span>
                    <br />
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full`} 
                          style={{ 
                            backgroundColor: 
                              selectedComplaint.status === 'reported' ? '#FACC15' :
                              selectedComplaint.status === 'verified' ? '#3B82F6' :
                              selectedComplaint.status === 'in_progress' ? '#8B5CF6' :
                              selectedComplaint.status === 'resolved' ? '#22C55E' : '#EF4444',
                            color: 'white' 
                          }}>
                      {selectedComplaint.status.replace('_', ' ')}
                    </span>
                  </div>

                  {selectedComplaint.plateNumber && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                      <p className="text-sm font-medium text-blue-800">
                        Plate: {selectedComplaint.plateNumber}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    <p>Area: {selectedComplaint.area || 'Unknown'}</p>
                    <p>Reported: {new Date(selectedComplaint.createdAt).toLocaleDateString()}</p>
                  </div>

                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="w-full px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Clear Selection
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
