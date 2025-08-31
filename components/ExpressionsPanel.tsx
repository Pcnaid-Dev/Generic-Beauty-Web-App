/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { type Face } from '../services/geminiService';

interface ExpressionsPanelProps {
  onGenerate: (prompt: string, options: { face?: Face }) => void;
  isLoading: boolean;
  detectedFaces: Face[];
  selectedFace: Face | null;
  onSelectFace: (direction: 'next' | 'prev') => void;
}

const expressions = [
    { name: 'Smile', prompt: 'Add a subtle, natural-looking closed-mouth smile to the selected face. The result must be photorealistic.' },
    { name: 'Wide Smile', prompt: 'Add a wide, happy smile showing teeth to the selected face. The teeth should look natural and fit the person.' },
    { name: 'Smirk', prompt: 'Add a confident, subtle smirk to the lips of the selected face.' },
    { name: 'Frown', prompt: 'Subtly change the expression of the selected face to a slight frown.' },
    { name: 'Surprised', prompt: 'Slightly widen the eyes and part the lips of the selected face for a surprised expression.' },
];

const ExpressionsPanel: React.FC<ExpressionsPanelProps> = ({ 
    onGenerate, isLoading, detectedFaces, selectedFace, onSelectFace
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  
  const handleToolSelect = (toolPrompt: string) => {
    if (selectedFace) {
      onGenerate(toolPrompt, { face: selectedFace });
    }
  };

  const handleApplyCustom = () => {
    if (customPrompt.trim() && selectedFace) {
        onGenerate(customPrompt, { face: selectedFace });
        setCustomPrompt('');
    }
  };

  const getMessage = () => {
    if (isLoading && detectedFaces.length === 0) return 'Detecting faces...';
    if (detectedFaces.length > 0 && !selectedFace) return 'Multiple faces detected. Please select one to begin editing.';
    if (!selectedFace) return 'Face detection is required for expression adjustments.';
    return `Select an expression for Face ${selectedFace.id + 1}.`;
  }

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-4 animate-fade-in backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-center text-gray-300">Expressions</h3>
        
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
        {expressions.map(tool => (
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

      <div className="h-px bg-gray-700/50"></div>

       <div className="flex flex-col gap-2">
         <p className="text-sm text-center text-gray-400">Or type a custom expression</p>
         <div className="flex gap-2">
            <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g., 'a look of determination'"
                className="flex-grow bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-sm"
                disabled={isLoading || !selectedFace}
            />
            <button
                onClick={handleApplyCustom}
                disabled={isLoading || !customPrompt.trim() || !selectedFace}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 text-sm rounded-lg transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed"
            >
                Apply
            </button>
        </div>
      </div>
    </div>
  );
};

export default ExpressionsPanel;