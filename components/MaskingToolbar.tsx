/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
// FIX: Corrected icon imports. Icons were added to the icons.tsx file.
import { BrushIcon, EraserIcon, CheckIcon, CloseIcon } from './icons';

interface MaskingToolbarProps {
  mode: 'brush' | 'erase';
  onModeChange: (mode: 'brush' | 'erase') => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  onApply: (prompt: string) => void;
  onCancel: () => void;
}

const MaskingToolbar: React.FC<MaskingToolbarProps> = ({
  mode, onModeChange, brushSize, onBrushSizeChange, onApply, onCancel
}) => {
  const [prompt, setPrompt] = useState('');

  const handleApplyClick = () => {
    onApply(prompt);
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-fade-in">
        <div className="bg-gray-800/80 border border-gray-700 rounded-lg p-2 flex flex-col gap-2 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-center gap-2">
                <button 
                    onClick={() => onModeChange('brush')}
                    className={`p-2 rounded-md transition-colors ${mode === 'brush' ? 'bg-blue-500 text-white' : 'bg-white/10 hover:bg-white/20 text-gray-200'}`}
                    aria-label="Brush"
                >
                    <BrushIcon className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => onModeChange('erase')}
                    className={`p-2 rounded-md transition-colors ${mode === 'erase' ? 'bg-blue-500 text-white' : 'bg-white/10 hover:bg-white/20 text-gray-200'}`}
                    aria-label="Erase"
                >
                    <EraserIcon className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 flex-grow mx-4">
                    <span className="text-sm font-medium text-gray-300">Size:</span>
                    <input
                        type="range"
                        min="5"
                        max="100"
                        value={brushSize}
                        onChange={(e) => onBrushSizeChange(Number(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>
                <button onClick={onCancel} className="p-2 rounded-md bg-red-500/20 hover:bg-red-500/40 text-red-300" aria-label="Cancel Mask">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the edit for the masked area..."
                    className="flex-grow bg-gray-900 border border-gray-600 text-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full text-sm"
                />
                 <button 
                    onClick={handleApplyClick} 
                    disabled={!prompt.trim()}
                    className="p-2 rounded-md bg-green-600 hover:bg-green-500 text-white disabled:bg-green-800 disabled:cursor-not-allowed" 
                    aria-label="Apply Mask"
                 >
                    <CheckIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    </div>
  );
};

export default MaskingToolbar;