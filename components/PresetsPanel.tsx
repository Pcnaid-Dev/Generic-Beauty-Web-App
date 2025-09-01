/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { LooksIcon, ImpressionsIcon } from './icons';

type PresetTabId = 'looks' | 'impressions';

interface PresetsPanelProps {
  activeTabId: PresetTabId;
  onTabSelect: (tabId: PresetTabId) => void;
  onApplyAdjustment: (prompt: string) => void;
  isLoading: boolean;
  strength: number;
}

const looks = [
    { name: 'Natural Clean', description: 'A subtle enhancement for a clean, natural look. Balances exposure and adds a touch of vibrancy.' },
    { name: 'Headshot Pro', description: 'Professional lighting and sharpening for a crisp, corporate headshot look. Minimizes shadows and enhances detail.' },
    { name: 'Outdoor Golden', description: 'Applies a warm, golden-hour glow, perfect for outdoor portraits. Enhances warm tones.' },
    { name: 'Cinematic', description: 'Applies a teal-and-orange color grade for a modern cinematic look.' },
    { name: 'Vintage Fade', description: 'A classic faded film look with muted colors and slightly reduced contrast for a nostalgic feel.' },
    { name: 'Crisp B&W', description: 'A sharp, high-contrast black and white conversion with deep blacks and bright whites.' },
];

const impressions = [
    { name: 'Impression', description: 'Boost attractiveness with a set of subtle, realistic enhancements for the perfect selfie.', prompt: 'Apply the "Impression" filter. This should boost attractiveness with a set of subtle, realistic enhancements for the perfect selfie. It includes skin smoothing, eye brightening, and gentle facial sculpting.' },
    { name: 'Hollywood', description: 'A glamorous filter with perfect skin, bright eyes, and a touch of professional contour.', prompt: 'Apply a glamorous "Hollywood" filter, with perfect skin, bright eyes, and a touch of professional contour.' },
    { name: 'Retouch', description: 'A clean, professional retouch that smooths skin, removes spots, and evens out tone.', prompt: 'Perform a clean, professional retouch. Smooth skin texture, remove blemishes and spots, and even out the skin tone across the face.' },
    { name: 'Beard', description: 'Experiment by adding a realistic, full beard to the subject\'s face.', prompt: 'Add a realistic, full, well-groomed dark brown beard to the subject\'s face. Ensure it integrates naturally with the jawline and skin.' },
    { name: 'Masculine', description: 'Apply subtle enhancements to strengthen facial features for a more masculine appearance.', prompt: 'Apply subtle enhancements to strengthen facial features for a more traditionally masculine appearance. This includes a stronger jawline, thicker brows, and more angular features.' },
    { name: 'Feminine', description: 'Apply subtle enhancements to soften facial features for a more feminine appearance.', prompt: 'Apply subtle enhancements to soften facial features for a more traditionally feminine appearance. This includes a softer jawline, slightly larger eyes, and fuller lips.' },
];


const LooksContent: React.FC<Pick<PresetsPanelProps, 'onApplyAdjustment' | 'isLoading' | 'strength'>> = ({ onApplyAdjustment, isLoading, strength }) => {
    const handleApply = (look: (typeof looks)[0]) => {
        const prompt = `Apply the "${look.name}" photo look. ${look.description} The desired intensity of this effect is ${strength}%.`;
        onApplyAdjustment(prompt);
    };
    return (
        <div className="flex flex-wrap justify-start gap-2">
            {looks.map(look => (
            <button
                key={look.name}
                onClick={() => handleApply(look)}
                disabled={isLoading}
                className="bg-white/10 border border-transparent text-gray-200 font-semibold py-2 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/20 active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {look.name}
            </button>
            ))}
        </div>
    )
}

const ImpressionsContent: React.FC<Pick<PresetsPanelProps, 'onApplyAdjustment' | 'isLoading' | 'strength'>> = ({ onApplyAdjustment, isLoading, strength }) => {
    const [customPrompt, setCustomPrompt] = useState('');

    const handlePresetClick = (impression: (typeof impressions)[0]) => {
        const prompt = `${impression.prompt} The desired intensity of this effect is ${strength}%. The result should be photorealistic.`;
        onApplyAdjustment(prompt);
    };
     const handleApplyCustom = () => {
        if (customPrompt.trim()) {
            const prompt = `${customPrompt} The desired intensity of this effect is ${strength}%. The result should be photorealistic.`;
            onApplyAdjustment(prompt);
            setCustomPrompt('');
        }
    };
    
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap justify-start gap-2">
                {impressions.map(impression => (
                    <button key={impression.name} onClick={() => handlePresetClick(impression)} disabled={isLoading} className="bg-white/10 text-gray-200 font-semibold py-2 px-3 rounded-md text-sm hover:bg-white/20 disabled:opacity-50">{impression.name}</button>
                ))}
            </div>
             <div className="border-t border-white/10 pt-4">
                <p className="text-sm text-center text-gray-400 mb-2">Or type a custom impression</p>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="e.g., 'a heroic, cinematic look'"
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
    )
}


const PresetsPanel: React.FC<PresetsPanelProps> = ({ activeTabId, onTabSelect, onApplyAdjustment, isLoading, strength }) => {

  const presetTabs: { id: PresetTabId, label: string, icon: React.FC<{className?: string}> }[] = [
    { id: 'looks', label: 'Looks', icon: LooksIcon },
    { id: 'impressions', label: 'Impressions', icon: ImpressionsIcon },
  ];

  return (
    <div className='flex-grow flex gap-6'>
        {/* Vertical Sub-navigation */}
        <div className='flex flex-col gap-2 w-40'>
            {presetTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabSelect(tab.id)}
                className={`w-full flex items-center gap-3 p-2 rounded-md text-sm font-semibold transition-colors ${activeTabId === tab.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
        </div>

        {/* Tools Content */}
        <div className="flex-grow">
            {activeTabId === 'looks' && <LooksContent onApplyAdjustment={onApplyAdjustment} isLoading={isLoading} strength={strength}/>}
            {activeTabId === 'impressions' && <ImpressionsContent onApplyAdjustment={onApplyAdjustment} isLoading={isLoading} strength={strength}/>}
        </div>
    </div>
  );
};

export default PresetsPanel;