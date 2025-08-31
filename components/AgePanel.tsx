/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { type Face } from '../services/geminiService';

interface AgePanelProps {
  onGenerate: (prompt: string, options: { face?: Face }) => void;
  isLoading: boolean;
  detectedFaces: Face[];
  selectedFace: Face | null;
  onSelectFace: (direction: 'next' | 'prev') => void;
}

const ageAdjustments = [
    { name: 'Younger', prompt: 'Make the selected person look noticeably younger. Smooth skin, reduce wrinkles, and restore a youthful facial structure.' },
    { name: 'Teenager', prompt: 'Transform the selected person to look like a teenager, with appropriate skin texture and facial features.' },
    { name: 'Older', prompt: 'Make the selected person look significantly older. Add realistic wrinkles, age spots, and sagging to the skin. Alter hair to be thinner and grayer.' },
];

const AgePanel: React.FC<AgePanelProps> = ({ 
    onGenerate, isLoading, detectedFaces, selectedFace, onSelectFace
}) => {
  
  const handleToolSelect = (toolPrompt: string) => {
    if (selectedFace) {
      onGenerate(toolPrompt, { face: selectedFace });
    }
  };

  const getMessage = () => {
    if (isLoading && detectedFaces.length === 0) return 'Detecting faces...';
    if (detectedFaces.length > 0 && !selectedFace) return 'Multiple faces detected. Please select one to begin editing.';
    if (!selectedFace) return 'Face detection is required for age adjustments.';
    return `Select an age adjustment for Face ${selectedFace.id + 1}.`;
  }

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-4 animate-fade-in backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-center text-gray-300">Age Adjustment</h3>
        
      {detectedFaces.length > 1 && (
        <div className="flex items-center justify-center gap-4 bg-gray-900/50 rounded-lg p-2">
          <button onClick={() => onSelectFace('prev')} className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20">&lt;</button>
          <span className="font-semibold text-gray-200">
              {`Face ${selectedFace ? selectedFace.id + 1 : '-' } of ${detectedFaces.length}`}
          </span>
          <button onClick={() => onSelectFace('next')} className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20">&gt;</button>
        </div>
      )}

      <p className="text-sm text-center text-gray-400">{getMessage()}</p>
        
      <div className="flex flex-wrap justify-center gap-2">
        {ageAdjustments.map(tool => (
          <button
            key={tool.name}
            onClick={() => handleToolSelect(tool.prompt)}
            disabled={isLoading || !selectedFace}
            className="bg-white/10 border border-transparent text-gray-200 font-semibold py-2 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/20 active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {tool.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AgePanel;