/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback } from 'react';
// Fix: Import 'motion' from framer-motion to enable animations.
import { motion } from 'framer-motion';
import { UploadIcon } from './icons';

interface StartScreenProps {
  onImageSelected: (file: File) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onImageSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelected(e.dataTransfer.files[0]);
    }
  }, [onImageSelected]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div 
      className="w-full h-full flex items-center justify-center p-4"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <div 
        className={`glass-panel rounded-3xl p-8 sm:p-12 md:p-16 text-center transition-all duration-300 ${isDragging ? 'border-pink-500 scale-105' : 'border-transparent'}`}
      >
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <h1 className="text-4xl sm:text-5xl font-bold text-white">AI Beauty Editor</h1>
            <p className="mt-4 text-lg text-text-secondary max-w-md">
                Create stunning, professional-quality portraits with the power of generative AI.
            </p>
            <div className="mt-8">
                <label htmlFor="upload-button" className="inline-flex items-center justify-center px-8 py-4 bg-accent-pink text-white font-bold rounded-full cursor-pointer transition-transform duration-200 hover:scale-105 shadow-lg shadow-pink-500/20">
                    <UploadIcon className="w-6 h-6 mr-3" />
                    Select a photo
                </label>
                <input id="upload-button" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
            <p className="mt-4 text-sm text-text-secondary/50">or drag & drop an image anywhere</p>
        </motion.div>
      </div>
    </div>
  );
};

export default StartScreen;