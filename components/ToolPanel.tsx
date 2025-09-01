/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { sections, getSectionForTab, TabId } from './Sidebar';
import { type Face, type Person } from '../services/geminiService';
import { EyeIcon } from './icons';

// Import tool UIs
import PresetsPanel from './PresetsPanel';
import FacePanel from './FacePanel';
import BodyPanel from './BodyPanel';
import ScenePanel from './ScenePanel';
// import CanvasPanel from './CanvasPanel';
// import ExportPanel from './ExportPanel';

interface ToolPanelProps {
  activeTabId: TabId;
  onTabSelect: (tabId: TabId) => void;
  isLoading: boolean;
  onGenerate: (prompt: string, options: { face?: Face, mask?: string }) => void;
  onApplyGlobalAdjustment: (prompt: string) => void;
  onApplyFilter: (prompt: string) => void;
  onApplyBackgroundChange: (prompt: string) => void;
  onDetectPeople: () => void;
  isPersonRemovalMode: boolean;
  onConfirmRemovePeople: () => void;
  onCancelRemovePeople: () => void;
  onApplyCrop: () => void;
  isCropping: boolean;
  detectedFaces: Face[];
  selectedFace: Face | null;
  onSelectFace: (direction: 'next' | 'prev') => void;
  onStartMasking: () => void;
}

const ToolPanel: React.FC<ToolPanelProps> = (props) => {
    const { activeTabId, onTabSelect } = props;
    const [strength, setStrength] = useState(70);

    const activeSection = getSectionForTab(activeTabId);
    const activeTab = activeSection?.tabs.find(t => t.id === activeTabId);

    if (!activeSection || !activeTab) {
        return <div className="w-full text-center p-8">Error: Tool not found.</div>;
    }

    const renderContent = () => {
        switch (activeSection.id) {
            case 'presets':
                return <PresetsPanel 
                            activeTabId={activeTabId as 'looks' | 'impressions'} 
                            onTabSelect={onTabSelect}
                            onApplyAdjustment={props.onApplyGlobalAdjustment}
                            isLoading={props.isLoading}
                            strength={strength}
                        />;
            case 'face':
                 return <FacePanel
                            activeTabId={activeTabId as 'portrait' | 'expressions' | 'age' | 'makeup' | 'hair'}
                            onTabSelect={onTabSelect}
                            onGenerate={props.onGenerate}
                            isLoading={props.isLoading}
                            detectedFaces={props.detectedFaces}
                            selectedFace={props.selectedFace}
                            onSelectFace={props.onSelectFace}
                            onStartMasking={props.onStartMasking}
                            strength={strength}
                        />;
            case 'body':
                return <BodyPanel onApplyAdjustment={props.onApplyGlobalAdjustment} isLoading={props.isLoading} />;
            case 'scene':
                // FIX: Pass props explicitly to ScenePanel to fix type errors
                return <ScenePanel 
                            activeTabId={activeTabId as 'background' | 'light_color'}
                            onTabSelect={onTabSelect}
                            onBackgroundChange={props.onApplyBackgroundChange}
                            onDetectPeople={props.onDetectPeople}
                            isPersonRemovalMode={props.isPersonRemovalMode}
                            onConfirmRemovePeople={props.onConfirmRemovePeople}
                            onCancelRemovePeople={props.onCancelRemovePeople}
                            onApplyGlobalAdjustment={props.onApplyGlobalAdjustment}
                            onApplyFilter={props.onApplyFilter}
                            isLoading={props.isLoading}
                        />
            // case 'canvas':
            //     return <CanvasPanel activeTabId={activeTabId} onTabSelect={onTabSelect} {...props} />;
            // case 'export':
            //     return <ExportPanel />;
            default:
                return <div className="p-4 text-center">Coming soon...</div>
        }
    };

    const needsStrengthSlider = activeSection.id === 'presets' || activeTabId === 'makeup';

    return (
        <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex flex-col gap-4 animate-fade-in backdrop-blur-sm">
            {/* Breadcrumb Header */}
            <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-400">
                    {activeSection.label} <span className="text-gray-500">/</span> <span className="text-white">{activeTab.label}</span>
                </p>
                <button className="text-xs font-semibold text-gray-400 hover:text-white">Reset</button>
            </div>
            
            {/* Main Content */}
            <div className="flex-grow">
                {renderContent()}
            </div>

            {/* Sticky Footer Action Bar */}
            <div className="border-t border-white/10 pt-4 flex flex-col gap-4">
               {needsStrengthSlider && (
                 <div className="w-full flex flex-col gap-2">
                    <label htmlFor="strength" className="text-sm font-medium text-gray-300 flex justify-between">
                        <span>Strength</span>
                        <span className="font-bold text-blue-400">{strength}%</span>
                    </label>
                    <input
                        id="strength"
                        type="range"
                        min="1"
                        max="100"
                        value={strength}
                        onChange={(e) => setStrength(Number(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        disabled={props.isLoading}
                    />
                </div>
               )}
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-md hover:bg-white/10 text-gray-300" title="Preview (Hold)">
                        <EyeIcon className="w-5 h-5"/>
                    </button>
                    <button className="flex-grow bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-blue-500/40 active:scale-95 disabled:opacity-50">
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ToolPanel;