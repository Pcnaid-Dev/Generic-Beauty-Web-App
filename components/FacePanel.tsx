/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { type Face } from '../services/geminiService';
import { PortraitIcon, ExpressionsIcon, AgeIcon, MakeupIcon, HairIcon, SkinIcon, EyesIcon, BrowsIcon, LipsIcon, NoseIcon, CheeksIcon } from './icons';

type FaceTabId = 'portrait' | 'expressions' | 'age' | 'makeup' | 'hair';
type PortraitSubTab = 'skin' | 'eyes' | 'brows' | 'lips' | 'nose' | 'cheeks';
type MakeupSubTab = 'sets' | 'base' | 'cheeks' | 'eyes' | 'lips';
type HairSubTab = 'color' | 'style' | 'volume' | 'texture';

interface FacePanelProps {
    activeTabId: FaceTabId;
    onTabSelect: (tabId: FaceTabId) => void;
    onGenerate: (prompt: string, options: { face?: Face, mask?: string }) => void;
    isLoading: boolean;
    detectedFaces: Face[];
    selectedFace: Face | null;
    onSelectFace: (direction: 'next' | 'prev') => void;
    onStartMasking: () => void;
    strength: number;
}

const portraitTools: Record<PortraitSubTab, { name: string, prompt: string }[]> = {
    skin: [
        { name: 'Remove Blemish', prompt: 'Remove any obvious blemishes like pimples, spots, or acne scars from the skin on the selected face. The result should be natural and preserve skin texture.' },
        { name: 'Smooth Skin', prompt: 'Apply a gentle but effective skin smoothing effect to the selected face, reducing the appearance of fine lines and pores for a clear, healthy complexion. Preserve natural skin texture.'},
        { name: 'Even Tone', prompt: 'Even out the skin tone on the selected face, reducing redness or blotchiness for a smoother, more uniform appearance.' },
        { name: 'Reduce Shine', prompt: 'Reduce oily shine from the skin on the selected face, giving it a more natural, matte finish.' },
        { name: 'Soften Wrinkles', prompt: 'Subtly soften the appearance of wrinkles and crow\'s feet on the selected face. The goal is to reduce, not eliminate, for a natural look.' },
        { name: 'Add Tan', prompt: 'Apply a natural-looking, healthy tan to the skin of the selected face, ensuring it blends with the neck.'},
    ],
    eyes: [
        { name: 'Whiten Sclera', prompt: 'Slightly and naturally whiten the sclera (the white part) of the eyes on the selected face. The goal is to make the eyes look brighter and healthier, not artificially white.' },
        { name: 'De-puff / Bags', prompt: 'Reduce the appearance of puffiness or bags under the eyes on the selected face for a more rested look.' },
        { name: 'Sharpen Iris', prompt: 'Enhance the detail, color, and sharpness of the iris on the selected face to make the eyes more captivating.' },
        { name: 'Add Catchlights', prompt: 'Add natural-looking catchlights (reflections of light) to the eyes on the selected face to make them sparkle and pop.' },
        { name: 'Fix Red-eye', prompt: 'Remove the red-eye effect from the eyes on the selected face, restoring a natural eye color.' },
        { name: 'Enlarge Eyes', prompt: 'Slightly enlarge the eyes on the selected face for a more expressive look. The effect must be subtle and natural.'},
        { name: 'Change Eye Color', prompt: 'Change the eye color of the selected face to a striking hazel. The effect must be photorealistic, with natural color variations.'},
    ],
    brows: [
        { name: 'Shape Brows', prompt: 'Gently shape and tidy the eyebrows on the selected face, removing stray hairs for a clean arch.' },
        { name: 'Fill Brows', prompt: 'Fill in any sparse areas of the eyebrows on the selected face to make them look fuller and more defined.' },
        { name: 'Thicken Brows', prompt: 'Make the eyebrows on the selected face appear slightly thicker and bolder, while maintaining a natural look.' },
        { name: 'Darken Brows', prompt: 'Subtly darken the color of the eyebrows on the selected face to make them more defined and frame the eyes.'},
        { name: 'Lift Brows', prompt: 'Subtly lift the arch of the eyebrows on the selected face for a more awake and youthful look.' },
    ],
    lips: [
        { name: 'Plump Lips', prompt: 'Subtly plump the lips on the selected face for a fuller, more voluminous appearance. The result must look natural and not exaggerated.' },
        { name: 'Add Lip Tint', prompt: 'Apply a natural-looking, sheer color tint to the lips on the selected face, as if from a lip stain.' },
        { name: 'Define Lips', prompt: 'Enhance the definition and outline of the lips on the selected face for a cleaner, more polished look.'},
        { name: 'Add Gloss', prompt: 'Add a realistic, glossy finish to the lips on the selected face, giving them a hydrated look.' },
        { name: 'Whiten Teeth', prompt: 'Whiten the teeth of the person in the selected face. The effect should be natural and not overly bright.' },
    ],
    nose: [
        { name: 'Refine Width', prompt: 'Subtly refine and narrow the width of the nose on the selected face for a more sculpted look.' },
        { name: 'Refine Bridge', prompt: 'Subtly refine and straighten the bridge of the nose on the selected face.' },
        { name: 'Refine Tip', prompt: 'Subtly refine the tip of the nose on the selected face, making it appear slightly more defined.' },
        { name: 'Lift Nose Tip', prompt: 'Subtly lift the tip of the nose on the selected face for a refined profile.'},
    ],
    cheeks: [
        { name: 'Slim Face', prompt: 'Subtly slim the overall face shape and jawline for the person in the selected face, creating a more V-shaped contour.' },
        { name: 'Sculpt Jawline', prompt: 'Add definition and a subtle shadow to sculpt and sharpen the jawline of the selected face.'},
        { name: 'Add Contour', prompt: 'Add subtle contouring to the hollows of the cheekbones on the selected face to enhance definition.' },
        { name: 'Lift Cheekbones', prompt: 'Subtly lift and define the appearance of the cheekbones on the selected face for a more sculpted look.' },
    ]
};
const expressions = [
    { name: 'Smile', prompt: 'Add a subtle, natural-looking closed-mouth smile to the selected face. The result must be photorealistic.' },
    { name: 'Wide Smile', prompt: 'Add a wide, happy smile showing teeth to the selected face. The teeth should look natural and fit the person.' },
    { name: 'Smirk', prompt: 'Add a confident, subtle smirk to the lips of the selected face.' },
    { name: 'Frown', prompt: 'Subtly change the expression of the selected face to a slight frown.' },
    { name: 'Surprised', prompt: 'Slightly widen the eyes and part the lips of the selected face for a surprised expression.' },
];
const ageAdjustments = [
    { name: 'Younger', prompt: 'Make the selected person look noticeably younger. Smooth skin, reduce wrinkles, and restore a youthful facial structure.' },
    { name: 'Teenager', prompt: 'Transform the selected person to look like a teenager, with appropriate skin texture and facial features.' },
    { name: 'Older', prompt: 'Make the selected person look significantly older. Add realistic wrinkles, age spots, and sagging to the skin. Alter hair to be thinner and grayer.' },
];
const makeupTools: Record<MakeupSubTab, { name: string, prompt: string, description?: string }[]> = {
    sets: [
        { name: 'Soft Glam', description: 'Neutral eyeshadow, peach blush, and a nude lip.', prompt: 'Apply a photorealistic "soft glam" makeup look to the selected face. This should include soft neutral eyeshadow, a hint of peach blush, and a natural nude lipstick.' },
        { name: 'Bridal Glow', description: 'Glowing skin, soft pink tones, and defined lashes.', prompt: 'Apply a radiant "bridal glow" makeup look to the selected face. This features glowing skin, soft pink tones on the cheeks and lips, and well-defined eyelashes.' },
        { name: 'Smokey Night', description: 'Dramatic smokey eye, contoured cheeks, and a matte nude lip.', prompt: 'Apply a dramatic "smokey night" makeup look to the selected face. This includes a classic dark smokey eye, sculpted contour on the cheeks, and a matte nude lip.' },
        { name: 'Bold Red Lip', description: 'A classic, matte red lip with clean, minimal eye makeup.', prompt: 'Apply a classic makeup look to the selected face, featuring a bold, matte red lip as the centerpiece, with clean, minimal eye makeup to balance it.' },
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
        { name: 'Lip Gloss', prompt: 'Apply a clear, high-shine lip gloss.' },
    ]
};
const hairTools: Record<HairSubTab, { name: string, prompt: string }[]> = {
    color: [
        { name: 'Blonde', prompt: 'Change the hair color of the selected person to a natural-looking blonde. Ensure the new color has realistic highlights and lowlights.' },
        { name: 'Brunette', prompt: 'Change the hair color of the selected person to a rich, dark brunette. Ensure the new color has depth and shine.' },
        { name: 'Redhead', prompt: 'Change the hair color of the selected person to a natural-looking auburn or copper red.' },
        { name: 'Balayage', prompt: 'Add a subtle, natural-looking balayage highlight effect to the hair, with lighter ends blending smoothly into the roots.' },
        { name: 'Pastel Pink', prompt: 'Change the hair color to a light, trendy pastel pink, ensuring it looks like a realistic hair dye job.'},
    ],
    style: [
        { name: 'Straight', prompt: 'Make the hair straight, sleek, and smooth, as if styled with a flat iron.' },
        { name: 'Wavy', prompt: 'Give the hair natural-looking, soft beach waves.' },
        { name: 'Curly', prompt: 'Transform the hair to have defined, voluminous curls.' },
        { name: 'Add Bangs', prompt: 'Add stylish bangs to the hair that suit the face shape and existing hairstyle.' },
        { name: 'Bob Cut', prompt: 'Give the subject a stylish bob haircut that realistically frames the face.'},
    ],
    volume: [
        { name: 'Add Volume', prompt: 'Add significant volume and body to the hair, especially at the roots, making it look fuller and bouncier.' },
        { name: 'Thicken', prompt: 'Make the hair appear thicker and more dense overall, increasing the number of visible hair strands.' },
        { name: 'Extend Length', prompt: 'Subtly extend the length of the hair by a few inches, ensuring it blends seamlessly.' },
    ],
    texture: [
        { name: 'Reduce Frizz', prompt: 'Reduce frizz and flyaways for a smoother, sleeker hair texture.' },
        { name: 'Add Shine', prompt: 'Add a healthy, glossy shine to the hair, as if light is reflecting off it.' },
        { name: 'Clean Flyaways', prompt: 'Clean up and remove small, distracting flyaway hairs around the head for a neater silhouette.' },
    ]
};


const FacePanel: React.FC<FacePanelProps> = ({ 
    activeTabId, onTabSelect, onGenerate, isLoading, 
    detectedFaces, selectedFace, onSelectFace, onStartMasking, strength
}) => {
  const [portraitSubTab, setPortraitSubTab] = useState<PortraitSubTab>('skin');
  const [makeupSubTab, setMakeupSubTab] = useState<MakeupSubTab>('sets');
  const [hairSubTab, setHairSubTab] = useState<HairSubTab>('color');
  const [customPrompt, setCustomPrompt] = useState('');

  const faceTabs: { id: FaceTabId, label: string, icon: React.FC<{className?: string}> }[] = [
    { id: 'portrait', label: 'Retouch', icon: PortraitIcon },
    { id: 'expressions', label: 'Expressions', icon: ExpressionsIcon },
    { id: 'age', label: 'Age', icon: AgeIcon },
    { id: 'makeup', label: 'Makeup', icon: MakeupIcon },
    { id: 'hair', label: 'Hair', icon: HairIcon },
  ];

  const handleToolClick = (prompt: string) => {
    if (selectedFace) {
      onGenerate(prompt, { face: selectedFace });
    }
  };

  const handleMakeupClick = (prompt: string) => {
    const finalPrompt = `${prompt} The desired intensity of this effect is ${strength}%. The makeup should look realistic and match the person's skin tone.`;
    handleToolClick(finalPrompt);
  }

  const handleCustomApply = () => {
    if (customPrompt.trim() && selectedFace) {
      handleToolClick(customPrompt);
      setCustomPrompt('');
    }
  };

  const renderFaceSelector = () => {
    if (detectedFaces.length <= 1) return null;
    return (
        <div className="flex items-center justify-center gap-4 bg-gray-900/50 rounded-lg p-2 mb-4">
            <button onClick={() => onSelectFace('prev')} className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20">&lt;</button>
            <span className="font-semibold text-gray-200 text-sm">
                {`Face ${selectedFace ? selectedFace.id + 1 : '-' } of ${detectedFaces.length}`}
            </span>
            <button onClick={() => onSelectFace('next')} className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20">&gt;</button>
        </div>
    )
  }

  const renderPortraitTools = () => {
    const subTabs: { id: PortraitSubTab, label: string, icon: React.FC<{className?: string}> }[] = [
        { id: 'skin', label: 'Skin', icon: SkinIcon },
        { id: 'eyes', label: 'Eyes', icon: EyesIcon },
        { id: 'brows', label: 'Brows', icon: BrowsIcon },
        { id: 'lips', label: 'Lips', icon: LipsIcon },
        { id: 'nose', label: 'Nose', icon: NoseIcon },
        { id: 'cheeks', label: 'Cheeks', icon: CheeksIcon },
    ];
    return (
        <div className='flex-grow flex flex-col gap-4'>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-1 bg-gray-900/50 rounded-lg p-1">
                {subTabs.map(t => <button key={t.id} onClick={() => setPortraitSubTab(t.id)} className={`capitalize font-semibold py-1.5 px-2 rounded-md transition-all duration-200 text-xs ${portraitSubTab === t.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>{t.label}</button>)}
            </div>
            <div className="flex flex-wrap justify-start gap-2 animate-fade-in">
                {portraitTools[portraitSubTab].map(tool => (
                    <button key={tool.name} onClick={() => handleToolClick(tool.prompt)} disabled={isLoading || !selectedFace} className="bg-white/10 text-gray-200 font-semibold py-2 px-3 rounded-md text-sm hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed">{tool.name}</button>
                ))}
            </div>
        </div>
    )
  }

  const renderExpressionsTools = () => (
    <div className='flex-grow flex flex-col gap-4'>
        <p className="text-sm text-center text-gray-400">Select an expression for Face {selectedFace ? selectedFace.id + 1 : ''}.</p>
        <div className="flex flex-wrap justify-center gap-2">
            {expressions.map(tool => (
                <button key={tool.name} onClick={() => handleToolClick(tool.prompt)} disabled={isLoading || !selectedFace} className="bg-white/10 text-gray-200 font-semibold py-2 px-3 rounded-md text-sm hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed">{tool.name}</button>
            ))}
        </div>
    </div>
  );

  const renderAgeTools = () => (
    <div className='flex-grow flex flex-col gap-4'>
        <p className="text-sm text-center text-gray-400">Select an age adjustment for Face {selectedFace ? selectedFace.id + 1 : ''}.</p>
        <div className="flex flex-wrap justify-center gap-2">
            {ageAdjustments.map(tool => (
                <button key={tool.name} onClick={() => handleToolClick(tool.prompt)} disabled={isLoading || !selectedFace} className="bg-white/10 text-gray-200 font-semibold py-2 px-3 rounded-md text-sm hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed">{tool.name}</button>
            ))}
        </div>
    </div>
  );

  const renderMakeupTools = () => {
      const subTabs: { id: MakeupSubTab, label: string }[] = [
          {id: 'sets', label: 'Sets'}, {id: 'base', label: 'Base'}, {id: 'cheeks', label: 'Cheeks'}, {id: 'eyes', label: 'Eyes'}, {id: 'lips', label: 'Lips'}
      ];
      return (
        <div className='flex-grow flex flex-col gap-4'>
            <div className="grid grid-cols-5 gap-1 bg-gray-900/50 rounded-lg p-1">
                {subTabs.map(t => <button key={t.id} onClick={() => setMakeupSubTab(t.id)} className={`capitalize font-semibold py-1.5 px-2 rounded-md transition-all duration-200 text-xs ${makeupSubTab === t.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>{t.label}</button>)}
            </div>
            <div className="flex flex-wrap justify-start gap-2 animate-fade-in">
                {makeupTools[makeupSubTab].map(tool => (
                    <button key={tool.name} onClick={() => handleMakeupClick(tool.prompt)} disabled={isLoading || !selectedFace} className="bg-white/10 text-gray-200 font-semibold py-2 px-3 rounded-md text-sm hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed">{tool.name}</button>
                ))}
            </div>
        </div>
    )
  }
  
  const renderHairTools = () => {
    const subTabs: { id: HairSubTab, label: string }[] = [
        {id: 'color', label: 'Color'}, {id: 'style', label: 'Style'}, {id: 'volume', label: 'Volume'}, {id: 'texture', label: 'Texture'}
    ];
    return (
        <div className='flex-grow flex flex-col gap-4'>
            <div className="grid grid-cols-4 gap-1 bg-gray-900/50 rounded-lg p-1">
                {subTabs.map(t => <button key={t.id} onClick={() => setHairSubTab(t.id)} className={`capitalize font-semibold py-1.5 px-2 rounded-md transition-all duration-200 text-xs ${hairSubTab === t.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>{t.label}</button>)}
            </div>
            <div className="flex flex-wrap justify-start gap-2 animate-fade-in">
                {hairTools[hairSubTab].map(tool => (
                    <button key={tool.name} onClick={() => handleToolClick(tool.prompt)} disabled={isLoading || !selectedFace} className="bg-white/10 text-gray-200 font-semibold py-2 px-3 rounded-md text-sm hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed">{tool.name}</button>
                ))}
            </div>
        </div>
      )
  }

  const renderContent = () => {
    switch (activeTabId) {
        case 'portrait': return renderPortraitTools();
        case 'expressions': return renderExpressionsTools();
        case 'age': return renderAgeTools();
        case 'makeup': return renderMakeupTools();
        case 'hair': return renderHairTools();
        default: return null;
    }
  }

  return (
    <div className='flex-grow flex gap-6'>
        {/* Vertical Sub-navigation */}
        <div className='flex flex-col gap-2 w-40'>
            {faceTabs.map(tab => (
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
        <div className="flex-grow flex flex-col gap-4">
            {renderFaceSelector()}
            {renderContent()}
            <div className="border-t border-white/10 pt-4 mt-auto">
                <p className="text-sm text-center text-gray-400 mb-2">Or describe a custom edit for the selected face</p>
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
                        placeholder="e.g., 'make the shirt green'"
                        className="flex-grow bg-gray-900 border border-gray-600 text-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-sm"
                        disabled={isLoading || !selectedFace}
                    />
                    <button
                        onClick={handleCustomApply}
                        disabled={isLoading || !customPrompt.trim() || !selectedFace}
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

export default FacePanel;