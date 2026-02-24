'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useCivicStore } from '@/lib/store';
import AnimatedCounter from './AnimatedCounter';

const statusColors = {
  reported: '#FACC15',
  verified: '#3B82F6',
  in_progress: '#8B5CF6',
  resolved: '#22C55E',
  escalated: '#EF4444'
};

export default function DashboardStats() {
  const stats = useCivicStore(state => state.stats);
  const complaints = useCivicStore(state => state.complaints);

  const statusData = [
    { name: 'Reported', value: stats.totalComplaints - stats.verifiedCount - stats.inProgressCount - stats.resolvedCount - stats.escalatedCount, color: statusColors.reported },
    { name: 'Verified', value: stats.verifiedCount, color: statusColors.verified },
    { name: 'In Progress', value: stats.inProgressCount, color: statusColors.in_progress },
    { name: 'Resolved', value: stats.resolvedCount, color: statusColors.resolved },
    { name: 'Escalated', value: stats.escalatedCount, color: statusColors.escalated },
  ];

  const severityData = [
    { name: 'Low', value: complaints.filter(c => c.severity === 'low').length },
    { name: 'Medium', value: complaints.filter(c => c.severity === 'medium').length },
    { name: 'High', value: complaints.filter(c => c.severity === 'high').length },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Total Complaints</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              <AnimatedCounter value={stats.totalComplaints} />
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Resolved</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              <AnimatedCounter value={stats.resolvedCount} />
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">In Progress</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">
              <AnimatedCounter value={stats.inProgressCount} />
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Resolution Rate</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">
              <AnimatedCounter 
                value={stats.totalComplaints > 0 ? Math.round((stats.resolvedCount / stats.totalComplaints) * 100) : 0} 
                suffix="%" 
              />
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100 lg:col-span-2"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Distribution</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100 lg:col-span-2"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Severity Levels</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={severityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
