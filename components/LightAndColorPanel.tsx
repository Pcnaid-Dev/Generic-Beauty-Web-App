/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';

interface LightAndColorPanelProps {
  onApplyAdjustment: (prompt: string) => void;
  onApplyFilter: (prompt: string) => void;
  isLoading: boolean;
}

interface Adjustment {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  sharpness: number;
}

interface CustomPreset {
    name: string;
    adjustments: Adjustment;
}

const LightAndColorPanel: React.FC<LightAndColorPanelProps> = ({ onApplyAdjustment, onApplyFilter, isLoading }) => {
  const [adjustments, setAdjustments] = useState<Adjustment>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,
    sharpness: 0,
  });
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([]);

  useEffect(() => {
    try {
      const savedPresets = localStorage.getItem('pixshopCustomPresets');
      if (savedPresets) {
        setCustomPresets(JSON.parse(savedPresets));
      }
    } catch (error) {
      console.error("Failed to load custom presets from localStorage:", error);
    }
  }, []);

  const handleAdjustmentChange = (key: keyof Adjustment, value: number) => {
    setAdjustments(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyAdjustments = () => {
    const changes = Object.entries(adjustments)
      .filter(([, value]) => value !== 0)
      .map(([key, value]) => {
        const direction = value > 0 ? 'increase' : 'decrease';
        return `${direction} ${key} by ${Math.abs(value)}`;
      });
    
    if (changes.length > 0) {
      const prompt = `Perform the following photo adjustments: ${changes.join(', ')}.`;
      onApplyAdjustment(prompt);
      setAdjustments({ brightness: 0, contrast: 0, saturation: 0, temperature: 0, sharpness: 0 });
    }
  };

  const handleSavePreset = () => {
    const presetName = prompt("Enter a name for your preset:");
    if (presetName && presetName.trim() !== '') {
        const newPreset = { name: presetName, adjustments };
        const updatedPresets = [...customPresets, newPreset];
        setCustomPresets(updatedPresets);
        localStorage.setItem('pixshopCustomPresets', JSON.stringify(updatedPresets));
    }
  };
  
  const handleApplyPreset = (preset: CustomPreset) => {
      setAdjustments(preset.adjustments);
  };

  const hasPendingAdjustments = Object.values(adjustments).some(v => v !== 0);

  // --- Filter State & Logic ---
  const [selectedFilterPreset, setSelectedFilterPreset] = useState<string | null>(null);
  const [customFilter, setCustomFilter] = useState('');
  const activeFilterPrompt = selectedFilterPreset || customFilter;
  
  const filterPresets = [
    { name: 'Synthwave', prompt: 'Apply a vibrant 80s synthwave aesthetic with neon magenta and cyan glows, and subtle scan lines.' },
    { name: 'Anime', prompt: 'Give the image a vibrant Japanese anime style, with bold outlines, cel-shading, and saturated colors.' },
    { name: 'Lomo', prompt: 'Apply a Lomography-style cross-processing film effect with high-contrast, oversaturated colors, and dark vignetting.' },
    { name: 'Glitch', prompt: 'Transform the image into a futuristic holographic projection with digital glitch effects and chromatic aberration.' },
  ];
  
  const handleFilterPresetClick = (prompt: string) => {
    setSelectedFilterPreset(prompt);
    setCustomFilter('');
  };
  const handleCustomFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomFilter(e.target.value);
    setSelectedFilterPreset(null);
  };
  const handleApplyFilter = () => {
    if (activeFilterPrompt) {
      onApplyFilter(activeFilterPrompt);
    }
  };
  
  const adjustmentControls = [
      { key: 'brightness', label: 'Brightness' },
      { key: 'contrast', label: 'Contrast' },
      { key: 'saturation', label: 'Saturation' },
      { key: 'temperature', label: 'Temperature' },
      { key: 'sharpness', label: 'Sharpness' },
  ];

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-6 animate-fade-in backdrop-blur-sm">
      {/* Adjustments Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-center text-gray-300">Manual Adjustments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {adjustmentControls.map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-2">
              <label htmlFor={key} className="text-sm font-medium text-gray-300 flex justify-between">
                <span>{label}</span>
                <span className="font-bold text-blue-400">{adjustments[key as keyof Adjustment]}</span>
              </label>
              <input
                id={key}
                type="range"
                min="-50"
                max="50"
                value={adjustments[key as keyof Adjustment]}
                onChange={(e) => handleAdjustmentChange(key as keyof Adjustment, Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                disabled={isLoading}
              />
            </div>
          ))}
        </div>
        
        {hasPendingAdjustments && (
          <div className="animate-fade-in flex flex-col sm:flex-row gap-2">
              <button
                  onClick={handleApplyAdjustments}
                  className="flex-grow bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-sm disabled:from-blue-800 disabled:to-blue-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isLoading}
              >
                  Apply Adjustments
              </button>
              <button
                  onClick={handleSavePreset}
                  className="bg-white/10 text-gray-200 font-semibold py-2 px-4 text-sm rounded-lg hover:bg-white/20 transition-colors"
                  disabled={isLoading}
              >
                  Save Preset
              </button>
          </div>
        )}
      </div>

      {customPresets.length > 0 && (
        <>
            <div className="h-px bg-gray-700/50"></div>
            <div className="flex flex-col gap-2">
                <h3 className="text-md font-semibold text-center text-gray-400">Your Custom Presets</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                    {customPresets.map((preset) => (
                        <button key={preset.name} onClick={() => handleApplyPreset(preset)} className="bg-white/10 text-gray-200 font-semibold py-1.5 px-3 rounded-lg hover:bg-white/20 transition-colors text-sm">
                            {preset.name}
                        </button>
                    ))}
                </div>
            </div>
        </>
      )}

      <div className="h-px bg-gray-700/50"></div>

      {/* Filters Section */}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-center text-gray-300">Creative Filters</h3>
        <div className="flex flex-wrap justify-center gap-2">
          {filterPresets.map(preset => (
            <button
              key={preset.name}
              onClick={() => handleFilterPresetClick(preset.prompt)}
              disabled={isLoading}
              className={`bg-white/10 border border-transparent text-gray-200 font-semibold py-2 px-4 rounded-md transition-all duration-200 ease-in-out hover:bg-white/20 hover:border-white/20 active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${selectedFilterPreset === preset.prompt ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-blue-500' : ''}`}
            >
              {preset.name}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={customFilter}
          onChange={handleCustomFilterChange}
          placeholder="Or describe a custom filter..."
          className="flex-grow bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base"
          disabled={isLoading}
        />
        {activeFilterPrompt && (
          <div className="animate-fade-in flex flex-col">
            <button
              onClick={handleApplyFilter}
              className="w-full bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-sm disabled:from-blue-800 disabled:to-blue-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
              disabled={isLoading || !activeFilterPrompt.trim()}
            >
              Apply Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LightAndColorPanel;