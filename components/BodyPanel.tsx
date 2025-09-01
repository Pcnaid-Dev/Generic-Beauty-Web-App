/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { BodyIcon, ClothingIcon, SkinIcon } from './icons'; // Assuming new icons are created

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
  const subCategories: { id: SubCategory, label: string, icon: React.FC<{className?: string}> }[] = [
    { id: 'shape', label: 'Shape', icon: BodyIcon },
    { id: 'skin', label: 'Skin', icon: SkinIcon },
    { id: 'clothing', label: 'Clothing', icon: ClothingIcon },
  ];
  
  const handleApplyCustom = () => {
      if (customPrompt.trim()) {
          onApplyAdjustment(customPrompt);
          setCustomPrompt('');
      }
  }

  return (
    <div className='flex-grow flex gap-6'>
        {/* Vertical Sub-navigation */}
        <div className='flex flex-col gap-2 w-40'>
            {subCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveSubCategory(cat.id)}
                className={`w-full flex items-center gap-3 p-2 rounded-md text-sm font-semibold transition-colors ${activeSubCategory === cat.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <cat.icon className="w-5 h-5" />
                <span>{cat.label}</span>
              </button>
            ))}
        </div>

        {/* Tools Content */}
        <div className="flex-grow flex flex-col gap-4">
            <div className="flex flex-wrap justify-start gap-2 animate-fade-in">
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
            
            <div className="border-t border-white/10 pt-4">
                <p className="text-sm text-center text-gray-400 mb-2">Or type a custom body adjustment</p>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="e.g., 'make the shirt green'"
                        className="flex-grow bg-gray-900 border border-gray-600 text-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-sm"
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
    </div>
  );
};

export default BodyPanel;