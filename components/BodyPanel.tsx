/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';

interface BodyPanelProps {
  onApplyAdjustment: (prompt: string) => void;
  isLoading: boolean;
}

type SubCategory = 'shape' | 'skin' | 'clothing';

const bodyTools: Record<SubCategory, { name: string, prompt: string }[]> = {
    shape: [
        { name: 'Slim Waist', prompt: 'Subtly slim the waist of the subject for a more defined figure. The result should be natural.' },
        { name: 'Adjust Hips', prompt: 'Slightly enhance the hips of the subject. The result should be natural and proportional.' },
        { name: 'Tone Arms', prompt: 'Make the arms of the subject appear slightly more toned and defined.' },
        { name: 'Lengthen Legs', prompt: 'Slightly lengthen the legs of the subject from a low angle to enhance perspective. Keep it subtle.' },
        { name: 'Broaden Shoulders', prompt: 'Slightly broaden the shoulders of the subject for a stronger frame.'},
        { name: 'Enhance Posture', prompt: 'Subtly improve the posture of the subject, making them stand up straighter.'},
    ],
    skin: [
        { name: 'Even Tone', prompt: 'Even out the skin tone on the subject\'s body for a smoother appearance.' },
        { name: 'Add Tan', prompt: 'Apply a natural-looking tan to the subject\'s body skin.' },
        { name: 'Soften Marks', prompt: 'Subtly soften the appearance of stretch marks on the skin.' },
        { name: 'Remove Tattoos', prompt: 'Remove any tattoos from the skin, making it look natural.' },
    ],
    clothing: [
        { name: 'Reduce Wrinkles', prompt: 'Smooth out and reduce wrinkles on the subject\'s clothing.' },
        { name: 'Change Color', prompt: 'Change the color of the main article of clothing to blue.' },
        { name: 'Adjust Fit', prompt: 'Slightly tighten the fit of the clothing on the subject.' },
        { name: 'Add Plaid Pattern', prompt: 'Add a realistic red plaid pattern to the subject\'s shirt.'},
    ]
};

const BodyPanel: React.FC<BodyPanelProps> = ({ onApplyAdjustment, isLoading }) => {
  const [activeSubCategory, setActiveSubCategory] = useState<SubCategory>('shape');
  const [customPrompt, setCustomPrompt] = useState('');

  const tools = bodyTools[activeSubCategory];
  const subCategories: { id: SubCategory, label: string }[] = [
    { id: 'shape', label: 'Shape' },
    { id: 'skin', label: 'Skin' },
    { id: 'clothing', label: 'Clothing' },
  ];
  
  const handleApplyCustom = () => {
      if (customPrompt.trim()) {
          onApplyAdjustment(customPrompt);
          setCustomPrompt('');
      }
  }

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-4 animate-fade-in backdrop-blur-sm">
      <div className="w-full grid grid-cols-3 gap-1 bg-gray-900/50 rounded-lg p-1">
        {subCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveSubCategory(cat.id)}
            className={`w-full capitalize font-semibold py-1 px-1.5 rounded-md transition-all duration-200 text-xs ${activeSubCategory === cat.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2 animate-fade-in">
        {tools.map(tool => (
          <button
            key={tool.name}
            onClick={() => onApplyAdjustment(tool.prompt)}
            disabled={isLoading}
            className="bg-white/10 border border-transparent text-gray-200 font-semibold py-2 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/20 active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {tool.name}
          </button>
        ))}
      </div>
      
      <div className="h-px bg-gray-700/50"></div>

       <div className="flex flex-col gap-2">
         <p className="text-sm text-center text-gray-400">Or type a custom body adjustment</p>
         <div className="flex gap-2">
            <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g., 'make the shirt green'"
                className="flex-grow bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-sm"
                disabled={isLoading}
            />
            <button
                onClick={handleApplyCustom}
                disabled={isLoading || !customPrompt.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 text-sm rounded-lg transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed"
            >
                Apply
            </button>
        </div>
      </div>
    </div>
  );
};

export default BodyPanel;