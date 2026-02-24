'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { detectPlateFromImage, simulateImageAuthenticityCheck } from '@/lib/fakeCV';
import { PlateDetection, ImageAuthenticity } from '@/types';

interface ImageUploaderProps {
  onImageSelect: (files: File[]) => void;
  onPlateDetected: (detection: PlateDetection | null) => void;
  onAuthenticityChecked: (authenticity: ImageAuthenticity) => void;
  multiple?: boolean;
  maxFiles?: number;
  enablePlateDetection?: boolean;
}

export default function ImageUploader({ onImageSelect, onPlateDetected, onAuthenticityChecked, multiple = false, maxFiles = 1, enablePlateDetection = true }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    let fileArray = Array.from(files);
    
    if (multiple && maxFiles && fileArray.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files`);
      return;
    }

    if (!multiple && fileArray.length > 1) {
      fileArray = [fileArray[0]];
    }

    // Filter for image files only
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      alert('Please upload image files only');
      return;
    }

    setIsProcessing(true);
    const previews = imageFiles.map(file => URL.createObjectURL(file));
    setUploadedImages(previews);
    onImageSelect(imageFiles);

    // Process first image for plate detection and authenticity
    const firstFile = imageFiles[0];
    
    // Run authenticity check first
    const authenticity = await simulateImageAuthenticityCheck(firstFile);
    onAuthenticityChecked(authenticity);

    // If image is authentic and plate detection is enabled, run plate detection
    if (authenticity.decision !== 'BLOCKED' && enablePlateDetection) {
      const detection = await detectPlateFromImage(firstFile);
      onPlateDetected(detection);
    }

    setIsProcessing(false);
  };

  const handleFile = async (file: File) => {
    await handleFiles([file]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {uploadedImages.length === 0 ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700">Drop your image{multiple ? 's' : ''} here</p>
                <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                {multiple && (
                  <p className="text-xs text-gray-400 mt-1">Up to {maxFiles} files</p>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Choose Image{multiple ? 's' : ''}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-2">
                {uploadedImages.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    {isProcessing && index === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Change Image{multiple ? 's' : ''}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
