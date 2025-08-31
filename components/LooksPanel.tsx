/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';

interface LooksPanelProps {
  onApplyAdjustment: (prompt: string) => void;
  isLoading: boolean;
  intensity: number;
}

const looks = [
    { name: 'Natural Clean', description: 'A subtle enhancement for a clean, natural look. Balances exposure and adds a touch of vibrancy.' },
    { name: 'Headshot Pro', description: 'Professional lighting and sharpening for a crisp, corporate headshot look. Minimizes shadows and enhances detail.' },
    { name: 'Outdoor Golden', description: 'Applies a warm, golden-hour glow, perfect for outdoor portraits. Enhances warm tones.' },
    { name: 'Glam Night', description: 'A high-contrast, glamorous look with deep shadows and vibrant colors, suitable for evening shots.' },
    { name: 'Vintage Fade', description: 'A classic faded film look with muted colors and slightly reduced contrast for a nostalgic feel.' },
    { name: 'Crisp B&W', description: 'A sharp, high-contrast black and white conversion with deep blacks and bright whites.' },
    { name: 'Cinematic', description: 'Applies a teal-and-orange color grade for a modern cinematic look.' },
    { name: 'Soft Film', description: 'Mimics the look of soft-focus film stock with gentle grain and blooming highlights.' },
];

const LooksPanel: React.FC<LooksPanelProps> = ({ onApplyAdjustment, isLoading, intensity }) => {
    const [activeLook, setActiveLook] = useState<(typeof looks)[0] | null>(looks[0]);

    const handleApply = (look: (typeof looks)[0]) => {
        setActiveLook(look);
        const prompt = `Apply the "${look.name}" photo look. ${look.description} The desired intensity of this effect is ${intensity}%.`;
        onApplyAdjustment(prompt);
    };

    return (
        <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-4 animate-fade-in backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-center text-gray-300">Apply a Look</h3>
            
            <div className="flex flex-wrap justify-center gap-2">
                {looks.map(look => (
                <button
                    key={look.name}
                    onClick={() => handleApply(look)}
                    disabled={isLoading}
                    className={`bg-white/10 border border-transparent text-gray-200 font-semibold py-2 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/20 active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${activeLook?.name === look.name ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-blue-500' : ''}`}
                >
                    {look.name}
                </button>
                ))}
            </div>

            {activeLook && (
                <div className="animate-fade-in flex flex-col gap-4 pt-2">
                    <p className="text-sm text-gray-400 text-center">{activeLook.description}</p>
                </div>
            )}
        </div>
    );
};

export default LooksPanel;