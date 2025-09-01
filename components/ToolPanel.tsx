/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { sections, getSectionForTab, TabId } from './Sidebar';
import { type Face, type Person } from '../services/geminiService';
import { CloseIcon } from './icons';

// Import tool UIs
import PresetsPanel from './PresetsPanel';
import FacePanel from './FacePanel';
import BodyPanel from './BodyPanel';
import ScenePanel from './ScenePanel';
import CropPanel from './CropPanel';
import ExportPanel from './ExportPanel';

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
  layoutMode: 'docked' | 'overlay' | 'bottom-sheet';
  width: number;
  onWidthChange: (newWidth: number) => void;
  onClose: () => void;
  onDownload: () => void;
}

const ToolPanel: React.FC<ToolPanelProps> = (props) => {
    const { activeTabId, onTabSelect, layoutMode, width, onWidthChange, onClose } = props;
    const [strength, setStrength] = useState(70);
    const [isResizing, setIsResizing] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const activeSection = getSectionForTab(activeTabId);
    const activeTab = activeSection?.tabs.find(t => t.id === activeTabId);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !panelRef.current) return;
            // For horizontal resize
            const newWidth = window.innerWidth - e.clientX;
            onWidthChange(newWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp, { once: true });
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, onWidthChange]);


    if (!activeSection || !activeTab) {
        return <div className="tool-panel p-8 text-center">Error: Tool not found.</div>;
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
                        />;
            case 'canvas':
                return <CropPanel />;
            case 'export':
                return <ExportPanel onDownload={props.onDownload} isLoading={props.isLoading} />;
            default:
                return <div className="p-4 text-center">Coming soon...</div>
        }
    };

    const needsStrengthSlider = activeSection.id === 'presets' || activeTabId === 'makeup';
    const hasApplyButton = activeTabId === 'crop';
    
    const panelStyle = layoutMode !== 'bottom-sheet' ? { width: `${width}px` } : {};
    const panelClasses = `tool-panel layout-${layoutMode}`;

    return (
        <aside ref={panelRef} className={panelClasses} style={panelStyle}>
            {layoutMode !== 'bottom-sheet' && (
                <div className="panel-resizer" onMouseDown={handleMouseDown}></div>
            )}
            <header className="panel-header">
                <div>
                  <div style={{fontSize:14, color:'var(--muted)'}}>{activeSection.label}</div>
                  <div style={{fontSize:18, fontWeight:700}}>{activeTab.label}</div>
                </div>
                 {layoutMode !== 'docked' ? (
                    <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10"><CloseIcon className="w-5 h-5"/></button>
                 ) : (
                    <button className="text-xs font-semibold text-gray-400 hover:text-white">Reset</button>
                 )}
            </header>

            <section className="panel-body">
                {renderContent()}
            </section>

            <div className="panel-apply">
               {needsStrengthSlider && (
                 <div className="flex-grow">
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
               {hasApplyButton && (
                  <button onClick={props.onApplyCrop} disabled={!props.isCropping} className="primary flex-grow">
                      Apply Crop
                  </button>
               )}
            </div>
        </aside>
    );
};

export default ToolPanel;