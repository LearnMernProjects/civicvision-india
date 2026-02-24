'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useCivicStore } from '@/lib/store';
import { Complaint } from '@/types';

interface SelfCorrectionModalProps {
  complaint: Complaint;
  isVisible: boolean;
  onClose: () => void;
}

export default function SelfCorrectionModal({ complaint, isVisible, onClose }: SelfCorrectionModalProps) {
  const [isSending, setIsSending] = useState(false);
  const [responseSent, setResponseSent] = useState(false);
  const updateComplaint = useCivicStore(state => state.updateComplaint);

  const handleSendRequest = async () => {
    setIsSending(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update complaint status
    updateComplaint(complaint.id, {
      status: 'in_progress',
      description: complaint.description + '\n\n[Self-correction request sent to vehicle owner]'
    });
    
    setIsSending(false);
    setResponseSent(true);
    
    // Auto close after success
    setTimeout(() => {
      onClose();
      setResponseSent(false);
    }, 2000);
  };

  if (!complaint?.plateNumber) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Vehicle Owner Detected
              </h3>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">License Plate</p>
                <p className="text-2xl font-bold text-blue-600">{complaint.plateNumber}</p>
              </div>

              {!responseSent ? (
                <>
                  <p className="text-gray-600 mb-6">
                    Send a self-correction request to the vehicle owner to resolve this issue voluntarily?
                  </p>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSendRequest}
                      disabled={isSending}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSending ? (
                        <span className="flex items-center justify-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Sending...
                        </span>
                      ) : (
                        'Send Request'
                      )}
                    </button>
                    <button
                      onClick={onClose}
                      disabled={isSending}
                      className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-green-600 font-semibold">Request sent successfully!</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
