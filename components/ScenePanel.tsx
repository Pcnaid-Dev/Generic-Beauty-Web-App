/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { BackgroundIcon, LightColorIcon } from './icons';

type SceneTabId = 'background' | 'light_color';

interface ScenePanelProps {
    activeTabId: SceneTabId;
    onTabSelect: (tabId: SceneTabId) => void;
    onBackgroundChange: (prompt: string) => void;
    onDetectPeople: () => void;
    isPersonRemovalMode: boolean;
    onConfirmRemovePeople: () => void;
    onCancelRemovePeople: () => void;
    onApplyGlobalAdjustment: (prompt: string) => void;
    onApplyFilter: (prompt: string) => void;
    isLoading: boolean;
}

const LightAndColorTools: React.FC<Pick<ScenePanelProps, 'onApplyGlobalAdjustment' | 'onApplyFilter' | 'isLoading'>> = ({ onApplyGlobalAdjustment, onApplyFilter, isLoading }) => {
  const [adjustments, setAdjustments] = useState({ brightness: 0, contrast: 0, saturation: 0, temperature: 0, sharpness: 0 });

  const handleApplyAdjustments = () => {
    const changes = Object.entries(adjustments)
      .filter(([, value]) => value !== 0)
      .map(([key, value]) => `${value > 0 ? 'increase' : 'decrease'} ${key} by ${Math.abs(value)}`);
    if (changes.length > 0) {
      onApplyGlobalAdjustment(`Perform the following photo adjustments: ${changes.join(', ')}.`);
      setAdjustments({ brightness: 0, contrast: 0, saturation: 0, temperature: 0, sharpness: 0 });
    }
  };

  const hasPendingAdjustments = Object.values(adjustments).some(v => v !== 0);

  const adjustmentControls = [
      { key: 'brightness', label: 'Brightness' }, { key: 'contrast', label: 'Contrast' },
      { key: 'saturation', label: 'Saturation' }, { key: 'temperature', label: 'Temperature' },
      { key: 'sharpness', label: 'Sharpness' },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {adjustmentControls.map(({ key, label }) => (
                <div key={key}>
                    <label htmlFor={key} className="text-sm font-medium text-gray-300 flex justify-between">
                        <span>{label}</span>
                        <span className="font-bold text-blue-400">{adjustments[key]}</span>
                    </label>
                    <input id={key} type="range" min="-50" max="50" value={adjustments[key]}
                        onChange={(e) => setAdjustments(prev => ({...prev, [key]: Number(e.target.value)}))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        disabled={isLoading}
                    />
                </div>
            ))}
        </div>
        {hasPendingAdjustments && (
             <button onClick={handleApplyAdjustments} disabled={isLoading}
                className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-blue-500 disabled:opacity-50">
                 Apply Adjustments
             </button>
        )}
    </div>
  );
}


const BackgroundTools: React.FC<Pick<ScenePanelProps, 'onBackgroundChange' | 'onDetectPeople' | 'isPersonRemovalMode' | 'onConfirmRemovePeople' | 'onCancelRemovePeople' | 'isLoading'>> = 
({ onBackgroundChange, onDetectPeople, isPersonRemovalMode, onConfirmRemovePeople, onCancelRemovePeople, isLoading }) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const presets = [
    { name: 'Blur Background', prompt: 'Apply a realistic depth-of-field effect, making the background blurry.' },
    { name: 'Bokeh Blur', prompt: 'Apply a realistic, creamy bokeh blur effect to the background, keeping the main subject in sharp focus. The blur should have beautiful, soft, circular highlights.' },
    { name: 'Sunset Sky', prompt: 'Replace the sky with a dramatic, golden-hour sunset sky.' },
    { name: 'Studio Backdrop', prompt: 'Replace the background with a clean, professional grey studio backdrop.' },
    { name: 'Forest Scene', prompt: 'Replace the background with a lush, green forest scene.'},
    { name: 'Expand Canvas', prompt: 'Expand the canvas of the image using generative fill to make it larger.'}
  ];

  if (isPersonRemovalMode) {
    return (
        <div className="w-full flex flex-col items-center gap-4 animate-fade-in">
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap justify-start gap-2">
        {presets.map(p => <button key={p.name} onClick={() => onBackgroundChange(p.prompt)} disabled={isLoading} className="bg-white/10 text-gray-200 font-semibold py-2 px-3 rounded-md text-sm hover:bg-white/20 disabled:opacity-50">{p.name}</button>)}
        <button onClick={onDetectPeople} disabled={isLoading} className="bg-white/10 text-gray-200 font-semibold py-2 px-3 rounded-md text-sm hover:bg-white/20 disabled:opacity-50">Remove People</button>
      </div>
      <div className="flex gap-2">
            <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Or describe a background change..."
                className="flex-grow bg-gray-900 border border-gray-600 text-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-sm"
                disabled={isLoading}
            />
            <button
                onClick={() => onBackgroundChange(customPrompt)}
                disabled={isLoading || !customPrompt.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 text-sm rounded-lg transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed"
            >
                Apply
            </button>
        </div>
    </div>
  )
}

const ScenePanel: React.FC<ScenePanelProps> = (props) => {
  const { activeTabId, onTabSelect } = props;

  const sceneTabs: { id: SceneTabId, label: string, icon: React.FC<{className?: string}> }[] = [
    { id: 'background', label: 'Background', icon: BackgroundIcon },
    { id: 'light_color', label: 'Light & Color', icon: LightColorIcon },
  ];

  return (
    <div className='flex-grow flex gap-6'>
        {/* Vertical Sub-navigation */}
        <div className='flex flex-col gap-2 w-48'>
            {sceneTabs.map(tab => (
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
            {activeTabId === 'background' && <BackgroundTools {...props} />}
            {activeTabId === 'light_color' && <LightAndColorTools {...props} />}
        </div>
    </div>
  );
};

export default ScenePanel;