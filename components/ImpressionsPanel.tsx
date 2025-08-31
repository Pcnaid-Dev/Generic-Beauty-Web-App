/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';

interface ImpressionsPanelProps {
  onApplyAdjustment: (prompt: string) => void;
  isLoading: boolean;
  intensity: number;
}

const impressions = [
    { name: 'Impression', description: 'Boost attractiveness with a set of subtle, realistic enhancements for the perfect selfie.', prompt: 'Apply the "Impression" filter. This should boost attractiveness with a set of subtle, realistic enhancements for the perfect selfie. It includes skin smoothing, eye brightening, and gentle facial sculpting.' },
    { name: 'Hollywood', description: 'A glamorous filter with perfect skin, bright eyes, and a touch of professional contour.', prompt: 'Apply a glamorous "Hollywood" filter, with perfect skin, bright eyes, and a touch of professional contour.' },
    { name: 'Retouch', description: 'A clean, professional retouch that smooths skin, removes spots, and evens out tone.', prompt: 'Perform a clean, professional retouch. Smooth skin texture, remove blemishes and spots, and even out the skin tone across the face.' },
    { name: 'Beard', description: 'Experiment by adding a realistic, full beard to the subject\'s face.', prompt: 'Add a realistic, full, well-groomed dark brown beard to the subject\'s face. Ensure it integrates naturally with the jawline and skin.' },
    { name: 'Masculine', description: 'Apply subtle enhancements to strengthen facial features for a more masculine appearance.', prompt: 'Apply subtle enhancements to strengthen facial features for a more traditionally masculine appearance. This includes a stronger jawline, thicker brows, and more angular features.' },
    { name: 'Feminine', description: 'Apply subtle enhancements to soften facial features for a more feminine appearance.', prompt: 'Apply subtle enhancements to soften facial features for a more traditionally feminine appearance. This includes a softer jawline, slightly larger eyes, and fuller lips.' },
];

const ImpressionsPanel: React.FC<ImpressionsPanelProps> = ({ onApplyAdjustment, isLoading, intensity }) => {
    const [activePreset, setActivePreset] = useState<(typeof impressions)[0] | null>(impressions[0]);
    const [customPrompt, setCustomPrompt] = useState('');

    const handlePresetClick = (look: (typeof impressions)[0]) => {
        setActivePreset(look);
        const prompt = `${look.prompt} The desired intensity of this effect is ${intensity}%. The result should be photorealistic.`;
        onApplyAdjustment(prompt);
    };

    const handleApplyCustom = () => {
        if (customPrompt.trim()) {
            const prompt = `${customPrompt} The desired intensity of this effect is ${intensity}%. The result should be photorealistic.`;
            onApplyAdjustment(prompt);
            setCustomPrompt('');
            setActivePreset(null);
        }
    };

    return (
        <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-4 animate-fade-in backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-center text-gray-300">Apply an Impression</h3>
            
            <div className="flex flex-wrap justify-center gap-2">
                {impressions.map(look => (
                <button
                    key={look.name}
                    onClick={() => handlePresetClick(look)}
                    disabled={isLoading}
                    className={`bg-white/10 border border-transparent text-gray-200 font-semibold py-2 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/20 active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${activePreset?.name === look.name ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-blue-500' : ''}`}
                >
                    {look.name}
                </button>
                ))}
            </div>

            {activePreset && (
                <div className="animate-fade-in pt-2">
                    <p className="text-sm text-gray-400 text-center">{activePreset.description}</p>
                </div>
            )}
            
            <div className="h-px bg-gray-700/50"></div>

            <div className="flex flex-col gap-2">
                <p className="text-sm text-center text-gray-400">Or type a custom impression</p>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="e.g., 'add a heroic, cinematic look'"
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

export default ImpressionsPanel;