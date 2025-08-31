/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';

interface MakeupPanelProps {
  onApplyAdjustment: (prompt: string) => void;
  isLoading: boolean;
  intensity: number;
}

type SubCategory = 'sets' | 'base' | 'cheeks' | 'eyes' | 'lips';

const makeupTools: Record<SubCategory, { name: string, prompt: string, description?: string }[]> = {
    sets: [
        { name: 'Soft Glam', description: 'Apply a soft glam makeup look: neutral eyeshadow, peach blush, and a nude lip.', prompt: 'Apply a soft glam makeup look: neutral eyeshadow, peach blush, and a nude lip.' },
        { name: 'Bridal Glow', description: 'Apply a radiant bridal makeup look with glowing skin, soft pink tones, and defined lashes.', prompt: 'Apply a radiant bridal makeup look with glowing skin, soft pink tones, and defined lashes.' },
        { name: 'Office Minimal', description: 'Apply a minimal, professional makeup look suitable for an office environment.', prompt: 'Apply a minimal, professional makeup look suitable for an office environment. Clean skin, light mascara, and a tinted lip balm.' },
        { name: 'Smokey Night', description: 'Apply a dramatic smokey eye, contoured cheeks, and a matte nude lip for a night out.', prompt: 'Apply a dramatic smokey eye, contoured cheeks, and a matte nude lip for a night out.' },
        { name: 'Bold Red Lip', description: 'Apply a classic makeup look featuring a bold, matte red lip with clean, minimal eye makeup.', prompt: 'Apply a classic makeup look featuring a bold, matte red lip with clean, minimal eye makeup.' },
        { name: 'E-Girl Wing', description: 'Apply a trendy e-girl look with a sharp winged eyeliner, heavy blush, and glossy lips.', prompt: 'Apply a trendy e-girl look with a sharp winged eyeliner, heavy blush across the nose and cheeks, and glossy lips.' },
    ],
    base: [
        { name: 'Foundation', prompt: 'Apply a natural-looking foundation that matches the skin tone perfectly.' },
        { name: 'Concealer', prompt: 'Apply concealer under the eyes to brighten the area and cover any dark circles.' },
        { name: 'Contour', prompt: 'Apply a subtle cream contour to the cheekbones, jawline, and nose.' },
        { name: 'Bronzer', prompt: 'Apply a warm bronzer to the high points of the face for a sun-kissed look.' },
    ],
    cheeks: [
        { name: 'Peach Blush', prompt: 'Apply a soft peach blush to the apples of the cheeks.' },
        { name: 'Pink Blush', prompt: 'Apply a healthy pink blush to the cheeks.' },
        { name: 'Highlighter', prompt: 'Apply a shimmering highlighter to the cheekbones and brow bone.' },
        { name: 'Contour', prompt: 'Apply powder contour to sculpt the cheekbones.' },
    ],
    eyes: [
        { name: 'Nude Eyeshadow', prompt: 'Apply a neutral, nude-toned eyeshadow palette.' },
        { name: 'Smokey Eyeshadow', prompt: 'Apply a classic dark smokey eyeshadow look.' },
        { name: 'Winged Eyeliner', prompt: 'Apply a sharp, black winged eyeliner.' },
        { name: 'Natural Lashes', prompt: 'Apply natural-looking mascara to lengthen and define the eyelashes.' },
    ],
    lips: [
        { name: 'Nude Lip', prompt: 'Apply a satin-finish nude lipstick.' },
        { name: 'Red Lip', prompt: 'Apply a classic, matte red lipstick.' },
        { name: 'Pink Lip', prompt: 'Apply a soft pink lipstick with a glossy finish.' },
        { name: 'Dark Lip', prompt: 'Apply a bold, dark berry or plum colored lipstick.'},
        { name: 'Lip Gloss', prompt: 'Apply a clear, high-shine lip gloss.' },
        { name: 'Lip Liner', prompt: 'Apply a natural-toned lip liner to define the shape of the lips.'},
    ]
};


const MakeupPanel: React.FC<MakeupPanelProps> = ({ onApplyAdjustment, isLoading, intensity }) => {
  const [activeSubCategory, setActiveSubCategory] = useState<SubCategory>('sets');
  const [customPrompt, setCustomPrompt] = useState('');

  const tools = makeupTools[activeSubCategory];
  const subCategories: { id: SubCategory, label: string }[] = [
      { id: 'sets', label: 'Sets' },
      { id: 'base', label: 'Base' },
      { id: 'cheeks', label: 'Cheeks' },
      { id: 'eyes', label: 'Eyes' },
      { id: 'lips', label: 'Lips' },
  ];
  
  const handleApply = (prompt: string) => {
      const finalPrompt = `${prompt} The desired intensity of this effect is ${intensity}%. The makeup should look realistic and match the person's skin tone.`;
      onApplyAdjustment(finalPrompt);
  };
  
    const handleApplyCustom = () => {
      if (customPrompt.trim()) {
          handleApply(customPrompt);
          setCustomPrompt('');
      }
  }

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-4 animate-fade-in backdrop-blur-sm">
        <div className="w-full grid grid-cols-5 gap-1 bg-gray-900/50 rounded-lg p-1">
            {subCategories.map(cat => (
                 <button 
                    key={cat.id}
                    onClick={() => setActiveSubCategory(cat.id)}
                    className={`w-full capitalize font-semibold py-1 px-1.5 rounded-md transition-all duration-200 text-xs ${activeSubCategory === cat.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                >{cat.label}</button>
            ))}
        </div>
      
      <div className="flex flex-wrap justify-center gap-2">
          {tools.map(tool => (
          <button
              key={tool.name}
              onClick={() => handleApply(tool.prompt)}
              disabled={isLoading}
              className="bg-white/10 border border-transparent text-gray-200 font-semibold py-2 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/20 active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
              {tool.name}
          </button>
          ))}
      </div>

       <div className="h-px bg-gray-700/50"></div>

       <div className="flex flex-col gap-2">
         <p className="text-sm text-center text-gray-400">Or type a custom makeup look</p>
         <div className="flex gap-2">
            <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g., 'add glitter eyeshadow and a glossy lip'"
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

export default MakeupPanel;