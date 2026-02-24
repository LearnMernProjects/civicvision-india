'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCivicStore } from '@/lib/store';
import { Complaint } from '@/types';

export default function IssueTracker() {
  const { complaints, currentUser } = useCivicStore();
  const [timeLeft, setTimeLeft] = useState<{ [key: number]: string }>({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter user's complaints from last 24 hours
  const userComplaints24h = useMemo(() => {
    if (!currentUser || !isMounted) return [];

    return complaints.filter((complaint: Complaint) => {
      if (complaint.userId !== currentUser.id) return false;

      const complaintTime = new Date(complaint.createdAt).getTime();
      const now = Date.now();
      const timeDiff = now - complaintTime;
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      return hoursDiff <= 24;
    });
  }, [complaints, currentUser, isMounted]);

  // Most recent issue
  const allUserComplaints = useMemo(() => {
    if (!currentUser || !isMounted) return [];

    return complaints
      .filter((complaint: Complaint) => complaint.userId === currentUser.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 1);
  }, [complaints, currentUser, isMounted]);

  // Timer calculation
  useEffect(() => {
    if (!isMounted) return;

    const calculateTimeLeft = () => {
      const now = Date.now();
      const newTimeLeft: { [key: number]: string } = {};

      userComplaints24h.forEach((complaint: Complaint) => {
        const complaintTime = new Date(complaint.createdAt).getTime();
        const timeDiff = now - complaintTime;
        const timeRemaining = 24 * 60 * 60 * 1000 - timeDiff;

        if (timeRemaining > 0) {
          const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
          const minutes = Math.floor(
            (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor(
            (timeRemaining % (1000 * 60)) / 1000
          );

          newTimeLeft[complaint.id] =
            `${hours.toString().padStart(2, '0')}:` +
            `${minutes.toString().padStart(2, '0')}:` +
            `${seconds.toString().padStart(2, '0')}`;
        } else {
          newTimeLeft[complaint.id] = 'Expired';
        }
      });

      setTimeLeft(newTimeLeft);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [userComplaints24h, isMounted]);

  const getStatusColor = (status: Complaint['status']) => {
    switch (status) {
      case 'resolved':
        return 'text-green-600 bg-green-50';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50';
      case 'verified':
        return 'text-yellow-600 bg-yellow-50';
      case 'escalated':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: Complaint['status']) => {
    switch (status) {
      case 'resolved':
        return 'Resolved';
      case 'in_progress':
        return 'In Progress';
      case 'verified':
        return 'Verified';
      case 'escalated':
        return 'Escalated';
      default:
        return 'Pending';
    }
  };

  if (!isMounted) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          24-Hour Issue Tracker
        </h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          24-Hour Issue Tracker
        </h3>
        <p className="text-gray-600">
          Please log in to view your issue tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 24-Hour Issues */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 mb-3">
          Issues from Last 24 Hours
        </h4>

        {userComplaints24h.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No issues reported in the last 24 hours.
          </p>
        ) : (
          <div className="space-y-4">
            {userComplaints24h.map((complaint, index) => (
              <motion.div
                key={complaint.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">
                      {complaint.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {complaint.area}, {complaint.city}
                    </p>

                    <div className="flex items-center space-x-4 mt-2">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          complaint.status
                        )}`}
                      >
                        {getStatusText(complaint.status)}
                      </span>

                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          complaint.severity === 'high'
                            ? 'bg-red-100 text-red-700'
                            : complaint.severity === 'medium'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {complaint.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-500">
                      Time remaining:{' '}
                    </span>
                    <span
                      className={`font-mono font-medium ${
                        timeLeft[complaint.id] === 'Expired'
                          ? 'text-red-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {timeLeft[complaint.id] || 'Loading...'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Most Recent Issue */}
      {allUserComplaints.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-700 mb-3">
            Your Most Recent Issue
          </h4>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <h4 className="font-medium text-gray-800">
              {allUserComplaints[0].title}
            </h4>
            <p className="text-sm text-gray-600">
              {allUserComplaints[0].area},{' '}
              {allUserComplaints[0].city}
            </p>

            <div className="mt-2">
              <span className="text-gray-500 text-sm">
                Reported:{' '}
              </span>
              <span className="text-gray-700 text-sm">
                {new Date(
                  allUserComplaints[0].createdAt
                ).toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}