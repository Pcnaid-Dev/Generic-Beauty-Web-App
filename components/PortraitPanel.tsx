/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { type Face } from '../services/geminiService';

interface PortraitPanelProps {
  onGenerate: (prompt: string, options: { face?: Face, mask?: string }) => void;
  isLoading: boolean;
  detectedFaces: Face[];
  selectedFace: Face | null;
  onSelectFace: (direction: 'next' | 'prev') => void;
  onStartMasking: () => void;
}

type SubCategory = 'skin' | 'eyes' | 'brows' | 'lips' | 'nose' | 'cheeks';

const portraitTools: Record<SubCategory, { name: string, prompt: string }[]> = {
    skin: [
        { name: 'Remove Blemish', prompt: 'Remove any obvious blemishes like pimples or spots from the skin on the selected face.' },
        { name: 'Smooth Skin', prompt: 'Apply a gentle but effective skin smoothing effect to the selected face, reducing fine lines and pores for a clear complexion.'},
        { name: 'Even Tone', prompt: 'Even out the skin tone on the selected face for a smoother, more uniform appearance.' },
        { name: 'Reduce Shine', prompt: 'Reduce oily shine from the skin on the selected face, giving it a more matte finish.' },
        { name: 'Soften Wrinkles', prompt: 'Subtly soften the appearance of wrinkles on the selected face.' },
        { name: 'Add Tan', prompt: 'Apply a natural-looking tan to the skin of the selected face.'},
    ],
    eyes: [
        { name: 'Whiten Sclera', prompt: 'Slightly whiten the sclera (the white part) of the eyes on the selected face to make them look brighter.' },
        { name: 'De-puff / Bags', prompt: 'Reduce the appearance of puffiness or bags under the eyes on the selected face.' },
        { name: 'Sharpen Iris', prompt: 'Enhance the detail and sharpness of the iris on the selected face.' },
        { name: 'Add Catchlights', prompt: 'Add natural-looking catchlights to the eyes on the selected face to make them pop.' },
        { name: 'Fix Red-eye', prompt: 'Remove the red-eye effect from the eyes on the selected face.' },
        { name: 'Enlarge Eyes', prompt: 'Slightly enlarge the eyes on the selected face for a more expressive look. The effect should be subtle and natural.'},
        { name: 'Change Eye Color', prompt: 'Change the eye color of the selected face to a striking hazel. The effect must be photorealistic.'},
    ],
    brows: [
        { name: 'Shape Brows', prompt: 'Gently shape and tidy the eyebrows on the selected face.' },
        { name: 'Fill Brows', prompt: 'Fill in any sparse areas of the eyebrows on the selected face to make them look fuller.' },
        { name: 'Thicken Brows', prompt: 'Make the eyebrows on the selected face appear slightly thicker.' },
        { name: 'Darken Brows', prompt: 'Subtly darken the color of the eyebrows on the selected face to make them more defined.'},
        { name: 'Lift Brows', prompt: 'Subtly lift the arch of the eyebrows on the selected face for a more awake look.' },
    ],
    lips: [
        { name: 'Plump Lips', prompt: 'Subtly plump the lips on the selected face for a fuller appearance.' },
        { name: 'Add Lip Tint', prompt: 'Apply a natural-looking color tint to the lips on the selected face.' },
        { name: 'Define Lips', prompt: 'Enhance the definition and outline of the lips on the selected face.'},
        { name: 'Add Gloss', prompt: 'Add a glossy finish to the lips on the selected face.' },
        { name: 'Whiten Teeth', prompt: 'Whiten the teeth of the person in the selected face. The effect should be natural.' },
    ],
    nose: [
        { name: 'Refine Width', prompt: 'Subtly refine the width of the nose on the selected face.' },
        { name: 'Refine Bridge', prompt: 'Subtly refine the bridge of the nose on the selected face.' },
        { name: 'Refine Tip', prompt: 'Subtly refine the tip of the nose on the selected face.' },
        { name: 'Lift Nose Tip', prompt: 'Subtly lift the tip of the nose on the selected face.'},
    ],
    cheeks: [
        { name: 'Slim Face', prompt: 'Subtly slim the overall face shape and jawline for the person in the selected face.' },
        { name: 'Sculpt Jawline', prompt: 'Add definition and a subtle shadow to sculpt the jawline of the selected face.'},
        { name: 'Add Contour', prompt: 'Add subtle contouring to the cheekbones of the selected face to enhance definition.' },
        { name: 'Lift Cheekbones', prompt: 'Subtly lift the appearance of the cheekbones on the selected face.' },
    ]
};

const PortraitPanel: React.FC<PortraitPanelProps> = ({ 
    onGenerate, isLoading, detectedFaces, selectedFace, onSelectFace, onStartMasking
}) => {
  const [activeSubCategory, setActiveSubCategory] = useState<SubCategory>('skin');
  const [lastAppliedPrompt, setLastAppliedPrompt] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');

  const handleToolSelect = (toolPrompt: string) => {
    if (selectedFace) {
      onGenerate(toolPrompt, { face: selectedFace });
      setLastAppliedPrompt(toolPrompt);
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
    if (detectedFaces.length > 1 && selectedFace) return `Editing Face ${selectedFace.id + 1} of ${detectedFaces.length}.`;
    if (detectedFaces.length === 1 && selectedFace) return `Editing Face 1. Select a tool or describe an edit.`;
    if (detectedFaces.length > 0 && !selectedFace) return 'Multiple faces detected. Please select one to begin editing.';
    return 'Select a tool, mask an area, or type a custom edit.';
  }
  
  const subCategories: { id: SubCategory, label: string }[] = [
    {id: 'skin', label: 'Skin'}, 
    {id: 'eyes', label: 'Eyes'}, 
    {id: 'brows', label: 'Brows'}, 
    {id: 'lips', label: 'Lips'}, 
    {id: 'nose', label: 'Nose'}, 
    {id: 'cheeks', label: 'Cheeks'}
  ];
  
  const activeTools = portraitTools[activeSubCategory];

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-4 animate-fade-in backdrop-blur-sm">
        
        {detectedFaces.length > 1 && (
            <div className="flex items-center justify-center gap-4 bg-gray-900/50 rounded-lg p-2">
                <button onClick={() => onSelectFace('prev')} className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20">&lt;</button>
                <span className="font-semibold text-gray-200">
                    {`Face ${selectedFace ? selectedFace.id + 1 : '-' } of ${detectedFaces.length}`}
                </span>
                <button onClick={() => onSelectFace('next')} className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20">&gt;</button>
            </div>
        )}

        <div className="w-full grid grid-cols-3 md:grid-cols-6 gap-1 bg-gray-900/50 rounded-lg p-1">
            {subCategories.map(cat => (
                 <button 
                    key={cat.id}
                    onClick={() => setActiveSubCategory(cat.id)}
                    className={`w-full capitalize font-semibold py-1 px-1.5 rounded-md transition-all duration-200 text-xs ${activeSubCategory === cat.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                >{cat.label}</button>
            ))}
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 animate-fade-in">
            {activeTools.map(tool => (
                <button
                    key={tool.name}
                    onClick={() => handleToolSelect(tool.prompt)}
                    disabled={isLoading || !selectedFace}
                    className={`bg-white/10 border border-transparent text-gray-200 font-semibold py-2 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/20 active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${lastAppliedPrompt === tool.prompt ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-blue-500' : ''}`}
                >
                    {tool.name}
                </button>
            ))}
        </div>

        <div className="h-px bg-gray-700/50"></div>

        <div className="flex flex-col gap-2">
            <p className="text-sm text-center text-gray-400">{getMessage()}</p>
            <div className="flex gap-2">
                <button
                    onClick={onStartMasking}
                    className="bg-white/10 text-gray-200 font-semibold py-2 px-4 text-sm rounded-lg hover:bg-white/20 transition-colors flex-shrink-0"
                    disabled={isLoading}
                >
                    Mask Area
                </button>
                <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Or type a custom edit for the face..."
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

export default PortraitPanel;