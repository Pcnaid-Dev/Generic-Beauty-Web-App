/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';

interface HairPanelProps {
  onApplyAdjustment: (prompt: string) => void;
  isLoading: boolean;
}

type SubCategory = 'color' | 'style' | 'volume' | 'texture';

const hairTools: Record<SubCategory, { name: string, prompt: string }[]> = {
    color: [
        { name: 'Blonde', prompt: 'Change the hair color to a natural blonde.' },
        { name: 'Brunette', prompt: 'Change the hair color to a rich brunette.' },
        { name: 'Redhead', prompt: 'Change the hair color to a natural redhead.' },
        { name: 'Black', prompt: 'Change the hair color to a deep, natural black.' },
        { name: 'Balayage', prompt: 'Add a subtle, natural-looking balayage highlight effect to the hair.' },
        { name: 'Pastel Pink', prompt: 'Change the hair color to a light pastel pink.'},
        { name: 'Silver Gray', prompt: 'Change the hair color to a stylish silver gray.'},
    ],
    style: [
        { name: 'Straight', prompt: 'Make the hair straight and sleek.' },
        { name: 'Wavy', prompt: 'Give the hair natural-looking waves.' },
        { name: 'Curly', prompt: 'Give the hair defined, voluminous curls.' },
        { name: 'Add Bangs', prompt: 'Add stylish bangs that suit the face.' },
        { name: 'Bob Cut', prompt: 'Give the subject a stylish bob haircut.'},
        { name: 'Messy Bun', prompt: 'Style the hair into a casual, messy bun updo.'},
        { name: 'Side Part', prompt: 'Change the hair part to the side.' },
    ],
    volume: [
        { name: 'Add Volume', prompt: 'Add volume and body to the hair, making it look fuller.' },
        { name: 'Thicken', prompt: 'Make the hair appear thicker and more dense.' },
        { name: 'Extend Length', prompt: 'Subtly extend the length of the hair.' },
        { name: 'Fill Hairline', prompt: 'Fill in the hairline to make it appear fuller and more defined.' },
    ],
    texture: [
        { name: 'Reduce Frizz', prompt: 'Reduce frizz and flyaways for a smoother hair texture.' },
        { name: 'Add Shine', prompt: 'Add a healthy, glossy shine to the hair.' },
        { name: 'Clean Flyaways', prompt: 'Clean up and remove small flyaway hairs around the head.' },
    ]
};


const HairPanel: React.FC<HairPanelProps> = ({ onApplyAdjustment, isLoading }) => {
  const [activeSubCategory, setActiveSubCategory] = useState<SubCategory>('color');
  const [customPrompt, setCustomPrompt] = useState('');

  const tools = hairTools[activeSubCategory];
  const subCategories: { id: SubCategory, label: string }[] = [
    { id: 'color', label: 'Color' },
    { id: 'style', label: 'Style' },
    { id: 'volume', label: 'Volume' },
    { id: 'texture', label: 'Texture' }
  ];

    const handleApplyCustom = () => {
      if (customPrompt.trim()) {
          onApplyAdjustment(customPrompt);
          setCustomPrompt('');
      }
  }

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-4 animate-fade-in backdrop-blur-sm">
        <div className="w-full grid grid-cols-4 gap-1 bg-gray-900/50 rounded-lg p-1">
            {subCategories.map(cat => (
                 <button 
                    key={cat.id}
                    onClick={() => setActiveSubCategory(cat.id)}
                    className={`w-full capitalize font-semibold py-1 px-1.5 rounded-md transition-all duration-200 text-xs ${activeSubCategory === cat.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                >{cat.label}</button>
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
            <p className="text-sm text-center text-gray-400">Or type a custom hair style</p>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g., 'give me pink hair with an undercut'"
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

export default HairPanel;