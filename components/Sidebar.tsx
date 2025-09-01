/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { 
    PresetsIcon, FaceIcon, BodyIcon, SceneIcon, CanvasIcon, ExportIcon,
    LooksIcon, ImpressionsIcon, PortraitIcon, ExpressionsIcon, AgeIcon, 
    MakeupIcon, HairIcon, BackgroundIcon, LightColorIcon, CropIcon
} from './icons';

export type SectionId = 'presets' | 'face' | 'body' | 'scene' | 'canvas' | 'export';
export type TabId = 
  | 'looks' | 'impressions' 
  | 'portrait' | 'expressions' | 'age' | 'makeup' | 'hair'
  | 'body'
  | 'background' | 'light_color'
  | 'crop'
  | 'export';

interface TabConfig {
    id: TabId;
    label: string;
    icon: React.FC<{className?: string}>;
}

interface SectionConfig {
    id: SectionId;
    label: string;
    icon: React.FC<{className?: string}>;
    tabs: TabConfig[];
}

export const sections: SectionConfig[] = [
    { 
        id: 'presets', label: 'Presets', icon: PresetsIcon,
        tabs: [
            { id: 'looks', label: 'Looks', icon: LooksIcon },
            { id: 'impressions', label: 'Impressions', icon: ImpressionsIcon },
        ] 
    },
    { 
        id: 'face', label: 'Face', icon: FaceIcon,
        tabs: [
            { id: 'portrait', label: 'Retouch', icon: PortraitIcon },
            { id: 'expressions', label: 'Expressions', icon: ExpressionsIcon },
            { id: 'age', label: 'Age', icon: AgeIcon },
            { id: 'makeup', label: 'Makeup', icon: MakeupIcon },
            { id: 'hair', label: 'Hair', icon: HairIcon },
        ]
    },
    { 
        id: 'body', label: 'Body', icon: BodyIcon,
        tabs: [
            { id: 'body', label: 'Body', icon: BodyIcon },
        ]
    },
    { 
        id: 'scene', label: 'Scene', icon: SceneIcon,
        tabs: [
            { id: 'background', label: 'Background', icon: BackgroundIcon },
            { id: 'light_color', label: 'Light & Color', icon: LightColorIcon },
        ]
    },
    { 
        id: 'canvas', label: 'Canvas', icon: CanvasIcon,
        tabs: [
            { id: 'crop', label: 'Crop', icon: CropIcon },
        ]
    },
    { 
        id: 'export', label: 'Export', icon: ExportIcon,
        tabs: [
            { id: 'export', label: 'Export', icon: ExportIcon },
        ]
    },
];

export const getSectionForTab = (tabId: TabId): SectionConfig | undefined => {
    return sections.find(section => section.tabs.some(tab => tab.id === tabId));
};


interface SidebarProps {
  isCollapsed: boolean;
  activeTabId: TabId;
  onTabSelect: (tab: TabId) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, activeTabId, onTabSelect }) => {
  const activeSection = getSectionForTab(activeTabId);

  return (
    <aside className={`left-rail bg-gray-800/30 border-r border-gray-700/80 p-2 flex-shrink-0 flex flex-col gap-4 transition-all duration-300 ${isCollapsed ? 'w-16 items-center' : 'w-56'}`}>
        {sections.map((section, index) => (
            <div key={section.id} className="w-full">
                {index > 0 && <div className={`h-px bg-white/10 my-2 ${isCollapsed ? 'mx-2' : 'mx-4'}`}></div>}
                <h2 className={`px-2 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
                    <section.icon className="w-4 h-4 flex-shrink-0" />
                    {!isCollapsed && <span>{section.label}</span>}
                </h2>
                <ul>
                    {section.tabs.map(tab => (
                        <li key={tab.id}>
                            <button
                                title={isCollapsed ? tab.label : ''}
                                onClick={() => onTabSelect(tab.id)}
                                className={`w-full flex items-center gap-3 font-semibold p-2 my-0.5 rounded-md transition-all duration-200 text-sm whitespace-nowrap relative ${isCollapsed ? 'justify-center' : ''} ${
                                    activeTabId === tab.id
                                    ? 'bg-blue-600/20 text-blue-300' 
                                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                {activeTabId === tab.id && <div className="absolute left-0 top-1 bottom-1 w-1 bg-blue-400 rounded-r-full"></div>}
                                <tab.icon className={`w-5 h-5 flex-shrink-0 ${!isCollapsed ? 'ml-2' : ''}`} />
                                {!isCollapsed && <span>{tab.label}</span>}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        ))}
    </aside>
  );
};

export default Sidebar;