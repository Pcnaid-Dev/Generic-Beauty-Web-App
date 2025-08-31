/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';

interface BackgroundPanelProps {
  onBackgroundChange: (prompt: string) => void;
  onDetectPeople: () => void;
  isPersonRemovalMode: boolean;
  onConfirmRemovePeople: () => void;
  onCancelRemovePeople: () => void;
  isLoading: boolean;
}

const BackgroundPanel: React.FC<BackgroundPanelProps> = ({ 
    onBackgroundChange, onDetectPeople, isPersonRemovalMode, 
    onConfirmRemovePeople, onCancelRemovePeople, isLoading 
}) => {
  const [selectedPresetPrompt, setSelectedPresetPrompt] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  const presets = [
    { name: 'Blur Background', prompt: 'Apply a realistic depth-of-field effect, making the background blurry while keeping the main subject in sharp focus.' },
    { name: 'Sunset Sky', prompt: 'Replace the sky with a dramatic, golden-hour sunset sky.' },
    { name: 'Night Sky', prompt: 'Replace the sky with a clear, starry night sky.'},
    { name: 'Studio Backdrop', prompt: 'Replace the background with a clean, professional grey studio backdrop.' },
    { name: 'Forest Scene', prompt: 'Replace the background with a lush, green forest scene.'},
    { name: 'Solid White', prompt: 'Replace the background with a solid, clean white color for a product shot look.'},
    { name: 'Expand Canvas', prompt: 'Expand the canvas of the image using generative fill to make it larger.'}
  ];

  const activePrompt = selectedPresetPrompt || customPrompt;

  const handlePresetClick = (prompt: string) => {
    setSelectedPresetPrompt(prompt);
    setCustomPrompt('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPrompt(e.target.value);
    setSelectedPresetPrompt(null);
  };

  const handleApply = () => {
    if (activePrompt) {
      onBackgroundChange(activePrompt);
    }
  };

  if (isPersonRemovalMode) {
    return (
        <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col items-center gap-4 animate-fade-in backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-center text-gray-300">Remove People</h3>
            <p className="text-sm text-gray-400">Click on the yellow boxes to select people for removal. Selected people will be marked in red.</p>
            <div className="flex gap-2">
                <button onClick={onCancelRemovePeople} className="bg-white/10 text-gray-200 font-semibold py-2 px-4 text-sm rounded-lg hover:bg-white/20 transition-colors">Cancel</button>
                <button onClick={onConfirmRemovePeople} className="bg-gradient-to-br from-red-600 to-red-500 text-white font-bold py-2 px-4 text-sm rounded-lg">Remove Selected</button>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-4 animate-fade-in backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-center text-gray-300">Background Tools</h3>
      
      <div className="flex flex-wrap justify-center gap-2">
        {presets.map(preset => (
          <button
            key={preset.name}
            onClick={() => handlePresetClick(preset.prompt)}
            disabled={isLoading}
            className={`bg-white/10 border border-transparent text-gray-200 font-semibold py-2 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/20 active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${selectedPresetPrompt === preset.prompt ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-blue-500' : ''}`}
          >
            {preset.name}
          </button>
        ))}
         <button
            onClick={onDetectPeople}
            disabled={isLoading}
            className="bg-white/10 border border-transparent text-gray-200 font-semibold py-2 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/20 active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Remove People
          </button>
      </div>

      <input
        type="text"
        value={customPrompt}
        onChange={handleCustomChange}
        placeholder="Or describe a background change..."
        className="flex-grow bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base"
        disabled={isLoading}
      />

      {activePrompt && (
        <div className="animate-fade-in flex flex-col gap-4 pt-2">
            <button
                onClick={handleApply}
                className="w-full bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-sm disabled:from-blue-800 disabled:to-blue-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                disabled={isLoading || !activePrompt.trim()}
            >
                Apply Background Change
            </button>
        </div>
      )}
    </div>
  );
};

export default BackgroundPanel;