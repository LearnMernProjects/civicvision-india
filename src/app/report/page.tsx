'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCivicStore } from '@/lib/store';
import ImageUploader from '@/components/ImageUploader';
import PlateDetector from '@/components/PlateDetector';
import { PlateDetection, ImageAuthenticity, Complaint } from '@/types';

export default function ReportPage() {
  const router = useRouter();
  const currentUser = useCivicStore(state => state.currentUser);
  const addComplaint = useCivicStore(state => state.addComplaint);
  const increaseUserCredits = useCivicStore(state => state.increaseUserCredits);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [detectedPlate, setDetectedPlate] = useState<PlateDetection | null>(null);
  const [authenticity, setAuthenticity] = useState<ImageAuthenticity | null>(null);
  const [showPlateDetector, setShowPlateDetector] = useState(false);
  const [plateDetectionAttempted, setPlateDetectionAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState({ lat: 19.0760, lng: 72.8777 });
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [annotatedImages, setAnnotatedImages] = useState<{[key: number]: { x: number, y: number, issueType: string, description: string }}>({});
  const [isPublicPost, setIsPublicPost] = useState(false);
  const [publicDescription, setPublicDescription] = useState('');
  const [isHelmetUser, setIsHelmetUser] = useState(false);
  const [fineAmount, setFineAmount] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'pothole' as Complaint['type'],
    severity: 'medium' as Complaint['severity'],
    city: 'Mumbai',
    area: '',
  });

  // No authentication guard - allow access to all users

  // Reset plate detection when issue type changes
  useEffect(() => {
    if (formData.type !== 'traffic_violation' && formData.type !== 'illegal_parking') {
      setDetectedPlate(null);
      setShowPlateDetector(false);
    }
  }, [formData.type]);

  const handleImageSelect = (files: File[]) => {
    setSelectedFiles(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
    // Reset plate detection when new images are uploaded
    setPlateDetectionAttempted(false);
    setDetectedPlate(null);
    setShowPlateDetector(false);
  };

  const handleImageRemove = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setImagePreviews(newPreviews);
    
    // Remove annotation for removed image
    const newAnnotations = { ...annotatedImages };
    delete newAnnotations[index];
    setAnnotatedImages(newAnnotations);
  };

  const handleImageClick = (index: number, event: React.MouseEvent<HTMLImageElement>) => {
    const rect = (event.target as HTMLImageElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setAnnotatedImages(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        x,
        y,
        issueType: prev[index]?.issueType || 'pothole',
        description: prev[index]?.description || ''
      }
    }));
  };

  const handleAnnotationChange = (index: number, field: 'issueType' | 'description', value: string) => {
    setAnnotatedImages(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: value
      }
    }));
  };

  const handlePublicPost = async () => {
    if (!publicDescription.trim()) {
      alert('Please provide a description for the public post.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate posting to public forum/social media
      const publicPostData = {
        title: `Civic Issue in ${formData.city}`,
        description: publicDescription,
        images: imagePreviews,
        location: location,
        timestamp: new Date().toISOString(),
        tags: [formData.type, formData.city, formData.area],
        author: currentUser?.name || 'Anonymous'
      };

      // Simulate API call to post publicly
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert('Issue posted publicly! Community has been notified.');
      setPublicDescription('');
      setIsPublicPost(false);
      
      // Award credits for public posting only if user is logged in
      if (currentUser) {
        increaseUserCredits(currentUser.id, 5);
      }
    } catch (error) {
      console.error('Error posting publicly:', error);
      alert('Failed to post publicly. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlateDetected = (detection: PlateDetection | null) => {
    setPlateDetectionAttempted(true);
    if (detection) {
      setDetectedPlate(detection);
      setShowPlateDetector(true);
    } else {
      setDetectedPlate(null);
      setShowPlateDetector(false);
    }
  };

  const handleAuthenticityChecked = (authenticityResult: ImageAuthenticity) => {
    setAuthenticity(authenticityResult);
  };

  const validateForm = () => {
    if (selectedFiles.length === 0) return false;
    if (!formData.title.trim()) return false;
    if (!formData.description.trim()) return false;
    if (formData.description.length > 500) return false;
    if (!formData.area.trim()) return false;
    if (authenticity?.decision === 'BLOCKED') return false;
    return true;
  };

  const handlePlateConfirm = () => {
    setShowPlateDetector(false);
  };

  const handlePlateReject = () => {
    setDetectedPlate(null);
    setShowPlateDetector(false);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setUseCurrentLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setUseCurrentLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setUseCurrentLocation(false);
          alert('Could not get your location. Please enter manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleLocationClick = (lat: number, lng: number) => {
    setLocation({ lat, lng });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fill all required fields correctly.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newComplaint: Complaint = {
        id: Date.now(),
        title: formData.title,
        description: formData.description,
        image: imagePreviews[0] || '', // Primary image
        lat: location.lat,
        lng: location.lng,
        status: 'reported',
        plateNumber: detectedPlate?.plate,
        time: new Date(),
        createdAt: new Date().toISOString(),
        userId: currentUser?.id || 0, // Use 0 for anonymous users
        severity: formData.severity,
        type: formData.type,
        city: formData.city,
        area: formData.area,
        finePaid: isHelmetUser ? fineAmount : undefined,
        helmetUser: isHelmetUser,
      };

      addComplaint(newComplaint);
      
      // Show success message and always redirect to dashboard
      alert('Issue reported successfully!' + (currentUser ? ' You earned 10 credits.' : ''));
      router.push('/dashboard');
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800">Report a Civic Issue</h1>
          <p className="text-gray-600 mt-2">Help make {formData.city} better by reporting civic issues</p>
        </motion.div>

        {/* Alert Messages */}
        {authenticity?.decision === 'BLOCKED' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-semibold text-red-800">Image Blocked</p>
                <p className="text-red-600">This image appears to be digitally manipulated. Please upload an authentic image.</p>
              </div>
            </div>
          </motion.div>
        )}

        {authenticity?.decision === 'FLAGGED' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4"
          >
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-semibold text-yellow-800">Image Flagged</p>
                <p className="text-yellow-600">This image may be digitally manipulated. Proceed with caution.</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image Upload Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload & Annotate Images</h3>
              
              {/* Plate Detection Status */}
              {(formData.type === 'traffic_violation' || formData.type === 'illegal_parking') && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium text-blue-800">
                      Plate Detection Enabled - Number plates will be automatically detected from your images
                    </p>
                  </div>
                </div>
              )}
              
              <ImageUploader
                onImageSelect={handleImageSelect}
                onPlateDetected={handlePlateDetected}
                onAuthenticityChecked={handleAuthenticityChecked}
                multiple={true}
                maxFiles={5}
                enablePlateDetection={formData.type === 'traffic_violation' || formData.type === 'illegal_parking'}
              />

              {/* Image Previews with Annotations */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Click on images to mark specific issues:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 cursor-crosshair"
                          onClick={(e) => handleImageClick(index, e)}
                        />
                        
                        {/* Annotation Overlay */}
                        {annotatedImages[index] && (
                          <div
                            className="absolute top-0 left-0 w-full h-full pointer-events-none"
                            style={{
                              border: '2px solid #EF4444',
                              borderRadius: '0.5rem',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)'
                            }}
                          >
                            {/* Issue Type Marker */}
                            <div
                              className="absolute bg-red-500 text-white text-xs px-2 py-1 rounded"
                              style={{
                                left: `${annotatedImages[index].x}px`,
                                top: `${annotatedImages[index].y - 20}px`
                              }}
                            >
                              {annotatedImages[index].issueType}
                            </div>
                            
                            {/* Description */}
                            {annotatedImages[index].description && (
                              <div
                                className="absolute bg-black bg-opacity-75 text-white text-xs p-2 rounded max-w-32"
                                style={{
                                  left: `${annotatedImages[index].x}px`,
                                  top: `${annotatedImages[index].y + 10}px`
                                }}
                              >
                                {annotatedImages[index].description}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => handleImageRemove(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Annotation Controls */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Annotation Controls</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
                        <select
                          value={annotatedImages[imagePreviews.length - 1]?.issueType || 'pothole'}
                          onChange={(e) => handleAnnotationChange(imagePreviews.length - 1, 'issueType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="pothole">Pothole</option>
                          <option value="road_damage">Road Damage</option>
                          <option value="street_light">Street Light</option>
                          <option value="garbage">Garbage</option>
                          <option value="water_logging">Water Logging</option>
                          <option value="illegal_parking">Illegal Parking</option>
                          <option value="traffic_violation">Traffic Violation</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={annotatedImages[imagePreviews.length - 1]?.description || ''}
                          onChange={(e) => handleAnnotationChange(imagePreviews.length - 1, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          rows={2}
                          placeholder="Describe the specific issue location..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showPlateDetector && detectedPlate && imagePreviews[0] && (formData.type === 'traffic_violation' || formData.type === 'illegal_parking') && (
                <PlateDetector
                  detection={detectedPlate}
                  imageSrc={imagePreviews[0]}
                  onConfirm={handlePlateConfirm}
                  onReject={handlePlateReject}
                />
              )}
            </motion.div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Issue Details</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* City and Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Kolkata">Kolkata</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Area Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g., Bandra, Andheri, Dadar"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location Coordinates *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      step="0.0001"
                      value={location.lat}
                      onChange={(e) => setLocation({ ...location, lat: parseFloat(e.target.value) })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Latitude"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      value={location.lng}
                      onChange={(e) => setLocation({ ...location, lng: parseFloat(e.target.value) })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Longitude"
                    />
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={useCurrentLocation}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
                    >
                      {useCurrentLocation ? 'Getting...' : 'Use Current'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Click on the map to set location or use current location
                  </p>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Brief description of the issue"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description * ({formData.description.length}/500 characters)
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => {
                      if (e.target.value.length <= 500) {
                        setFormData({ ...formData, description: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    rows={4}
                    placeholder="Detailed description of the issue (max 500 characters)"
                  />
                </div>

                {/* Issue Type and Severity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as Complaint['type'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="pothole">Pothole</option>
                      <option value="traffic_violation">Traffic Violation</option>
                      <option value="garbage">Garbage</option>
                      <option value="street_light">Street Light</option>
                      <option value="water_logging">Water Logging</option>
                      <option value="illegal_parking">Illegal Parking</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Severity *
                    </label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value as Complaint['severity'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                {/* Helmet User and Fine Section */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">Traffic Violation Details (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isHelmetUser}
                          onChange={(e) => setIsHelmetUser(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Helmet User Involved
                        </span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Check if the issue involves a helmet user (rider)
                      </p>
                    </div>
                    
                    {isHelmetUser && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fine Amount (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="50"
                          value={fineAmount}
                          onChange={(e) => setFineAmount(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Enter fine amount"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Amount paid for the traffic violation
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detected Plate Info */}
                {detectedPlate && (formData.type === 'traffic_violation' || formData.type === 'illegal_parking') && (
                  <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Detected License Plate</p>
                          <p className="text-xl font-bold text-emerald-700">{detectedPlate.plate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Confidence</p>
                        <p className="text-lg font-semibold text-emerald-600">
                          {Math.round(detectedPlate.confidence * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* No Plate Detected Message */}
                {plateDetectionAttempted && !detectedPlate && (formData.type === 'traffic_violation' || formData.type === 'illegal_parking') && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-amber-800">No License Plate Detected</p>
                        <p className="text-sm text-amber-600">Could not detect a license plate in this image. Please try uploading a clearer image of a vehicle.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-gray-500">
                    * You'll earn 10 credits for a successful report
                  </p>
                  <button
                    type="submit"
                    disabled={!validateForm() || isSubmitting}
                    className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>

        {/* Public Posting Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-3"
        >
          <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📢 Post Publicly</h3>
            <p className="text-sm text-gray-600 mb-4">
              Share this issue with the community to raise awareness and get faster resolution.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Public Description *
                </label>
                <textarea
                  required
                  value={publicDescription}
                  onChange={(e) => setPublicDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={4}
                  placeholder="Describe this issue for the public community..."
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  * You'll earn 5 additional credits for public posting
                </p>
                <button
                  type="button"
                  onClick={() => setIsPublicPost(!isPublicPost)}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  {isPublicPost ? 'Cancel' : 'Post Publicly'}
                </button>
              </div>

              {isPublicPost && (
                <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <h4 className="font-semibold text-emerald-800 mb-2">Preview Public Post</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Title:</strong> Civic Issue in {formData.city}</p>
                    <p><strong>Description:</strong> {publicDescription}</p>
                    <p><strong>Location:</strong> {formData.area}, {formData.city}</p>
                    <p><strong>Images:</strong> {imagePreviews.length} attached</p>
                    <p><strong>Author:</strong> {currentUser?.name || 'Anonymous'}</p>
                  </div>
                  <div className="flex space-x-3 mt-4">
                    <button
                      type="button"
                      onClick={handlePublicPost}
                      disabled={isSubmitting || !publicDescription.trim()}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'Posting...' : 'Post Publicly'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPublicPost(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
