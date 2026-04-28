"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, Send, X, Loader2, CheckCircle } from 'lucide-react';

interface BugReportData {
  title: string;
  description: string;
  steps: string[];
  expected: string;
  actual: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'ui' | 'functionality' | 'performance' | 'security' | 'other';
  browser: string;
  url: string;
}

interface BugReportProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    route: string;
    component?: string;
  };
}

export function BugReport({ isOpen, onClose, context }: BugReportProps) {
  const [formData, setFormData] = useState<BugReportData>({
    title: '',
    description: '',
    steps: [''],
    expected: '',
    actual: '',
    severity: 'medium',
    category: 'functionality',
    browser: typeof window !== 'undefined' ? navigator.userAgent : '',
    url: typeof window !== 'undefined' ? window.location.href : '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: keyof BugReportData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData(prev => ({ ...prev, steps: newSteps }));
  };

  const addStep = () => {
    setFormData(prev => ({ ...prev, steps: [...prev.steps, ''] }));
  };

  const removeStep = (index: number) => {
    if (formData.steps.length > 1) {
      const newSteps = formData.steps.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, steps: newSteps }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call to submit bug report
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In a real implementation, this would send the data to a backend service
      console.log('Bug report submitted:', {
        ...formData,
        context,
        timestamp: new Date().toISOString(),
      });

      setIsSubmitted(true);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
        setFormData({
          title: '',
          description: '',
          steps: [''],
          expected: '',
          actual: '',
          severity: 'medium',
          category: 'functionality',
          browser: typeof window !== 'undefined' ? navigator.userAgent : '',
          url: typeof window !== 'undefined' ? window.location.href : '',
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to submit bug report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.title.trim() && 
    formData.description.trim() && 
    formData.steps.some(step => step.trim()) &&
    formData.expected.trim() && 
    formData.actual.trim();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bug className="w-6 h-6" />
                  <div>
                    <h2 className="text-xl font-bold">Report a Bug</h2>
                    <p className="text-sm opacity-90">
                      Help us improve by reporting issues you encounter
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Bug Report Submitted!
                  </h3>
                  <p className="text-gray-600">
                    Thank you for helping us improve. We'll review your report and address the issue.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bug Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Brief description of the issue"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Detailed description of what happened"
                        required
                      />
                    </div>
                  </div>

                  {/* Steps to Reproduce */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Steps to Reproduce *
                    </label>
                    <div className="space-y-2">
                      {formData.steps.map((step, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            value={step}
                            onChange={(e) => handleStepChange(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder={`Step ${index + 1}`}
                          />
                          {formData.steps.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeStep(index)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addStep}
                        className="text-sm text-red-500 hover:text-red-600 font-medium"
                      >
                        + Add Step
                      </button>
                    </div>
                  </div>

                  {/* Expected vs Actual */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expected Behavior *
                      </label>
                      <textarea
                        value={formData.expected}
                        onChange={(e) => handleInputChange('expected', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="What should have happened"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Actual Behavior *
                      </label>
                      <textarea
                        value={formData.actual}
                        onChange={(e) => handleInputChange('actual', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="What actually happened"
                        required
                      />
                    </div>
                  </div>

                  {/* Severity and Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Severity
                      </label>
                      <select
                        value={formData.severity}
                        onChange={(e) => handleInputChange('severity', e.target.value as BugReportData['severity'])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="low">Low - Minor inconvenience</option>
                        <option value="medium">Medium - Affects usability</option>
                        <option value="high">High - Major functionality broken</option>
                        <option value="critical">Critical - System unusable</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value as BugReportData['category'])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="ui">UI/UX Issue</option>
                        <option value="functionality">Functionality</option>
                        <option value="performance">Performance</option>
                        <option value="security">Security</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Auto-filled Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">System Information</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div><strong>URL:</strong> {formData.url}</div>
                      <div><strong>Browser:</strong> {formData.browser.substring(0, 100)}...</div>
                      {context && (
                        <div><strong>Context:</strong> {context.route} {context.component && `(${context.component})`}</div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!isFormValid || isSubmitting}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Report</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
