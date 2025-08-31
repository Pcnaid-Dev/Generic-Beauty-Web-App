/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { type Tab } from '../App';
import { 
    LooksIcon, ImpressionsIcon, PortraitIcon, ExpressionsIcon, AgeIcon, 
    MakeupIcon, HairIcon, BodyIcon, BackgroundIcon, LightColorIcon, CropIcon 
} from './TabIcons';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const tabConfig: { id: Tab; label: string, icon: React.FC<{className?: string}> }[] = [
    { id: 'looks', label: 'Looks', icon: LooksIcon },
    { id: 'impressions', label: 'Impressions', icon: ImpressionsIcon },
    { id: 'portrait', label: 'Portrait', icon: PortraitIcon },
    { id: 'expressions', label: 'Expressions', icon: ExpressionsIcon },
    { id: 'age', label: 'Age', icon: AgeIcon },
    { id: 'makeup', label: 'Makeup', icon: MakeupIcon },
    { id: 'hair', label: 'Hair', icon: HairIcon },
    { id: 'body', label: 'Body', icon: BodyIcon },
    { id: 'background', label: 'Background', icon: BackgroundIcon },
    { id: 'light_color', label: 'Light & Color', icon: LightColorIcon },
    { id: 'crop', label: 'Crop', icon: CropIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-48 bg-gray-800/30 border-r border-gray-700/80 p-2 flex-shrink-0">
        <nav>
            <ul>
                {tabConfig.map(tab => (
                    <li key={tab.id}>
                        <button
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 font-semibold p-2 my-0.5 rounded-md transition-all duration-200 text-xs whitespace-nowrap ${
                                activeTab === tab.id
                                ? 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-md shadow-cyan-500/30' 
                                : 'text-gray-300 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <tab.icon className="w-5 h-5 flex-shrink-0" />
                            <span>{tab.label}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    </aside>
  );
};

export default Sidebar;