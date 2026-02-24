'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PlateDetection } from '@/types';

interface PlateDetectorProps {
  detection: PlateDetection | null;
  imageSrc: string;
  onConfirm: () => void;
  onReject: () => void;
}

export default function PlateDetector({ detection, imageSrc, onConfirm, onReject }: PlateDetectorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!detection || !canvasRef.current || !imageSrc) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Draw bounding box
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      ctx.strokeRect(
        detection.bbox.x,
        detection.bbox.y,
        detection.bbox.w,
        detection.bbox.h
      );

      // Draw confidence label
      ctx.fillStyle = '#10B981';
      ctx.fillRect(detection.bbox.x, detection.bbox.y - 30, 150, 25);
      ctx.fillStyle = 'white';
      ctx.font = '14px sans-serif';
      ctx.fillText(
        `${detection.plate} (${Math.round(detection.confidence * 100)}%)`,
        detection.bbox.x + 5,
        detection.bbox.y - 10
      );
    };
    img.src = imageSrc;
  }, [detection, imageSrc]);

  if (!detection) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">License Plate Detected</h3>
      
      <div className="relative mb-4">
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto rounded-lg"
          style={{ maxHeight: '400px' }}
        />
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Detected Plate</p>
            <p className="text-2xl font-bold text-emerald-600">{detection.plate}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Confidence</p>
            <p className="text-xl font-semibold text-emerald-600">
              {Math.round(detection.confidence * 100)}%
            </p>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Confirm & Continue
        </button>
        <button
          onClick={onReject}
          className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    </motion.div>
  );
}
