/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Category, SubCategory, Tool } from '../data/tools';
import { ArrowLeftIcon, CloseIcon } from './icons';
import IntensitySlider from './IntensitySlider';

interface ToolDrawerProps {
    category: Category;
    onClose: () => void;
    onApplyEffect: (prompt: string, strength: number) => void;
}

const ToolDrawer: React.FC<ToolDrawerProps> = ({ category, onClose, onApplyEffect }) => {
    const [activeSubCategory, setActiveSubCategory] = useState<SubCategory | null>(category.subCategories?.[0] ?? null);
    const [strength, setStrength] = useState<number>(60);

    const handleToolClick = (tool: Tool) => {
        onApplyEffect(tool.prompt, strength);
    };

    const drawerVariants = {
        hidden: { y: "100%" },
        visible: { y: "0%" },
    };

    const content = category.subCategories ? activeSubCategory?.tools : category.tools;

    return (
        <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 h-[45%] glass-panel rounded-t-3xl z-40 flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold">{category.name}</h2>
                <div className="w-10"></div>
            </div>

            {/* Intensity Slider */}
            <IntensitySlider strength={strength} setStrength={setStrength} />
            
            {/* Main Content */}
            <div className="flex-grow flex flex-col overflow-hidden px-4 pb-4">
                {/* Sub-Category Tabs */}
                {category.subCategories && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-4 flex-shrink-0">
                        {category.subCategories.map(sub => (
                            <button 
                                key={sub.name}
                                onClick={() => setActiveSubCategory(sub)}
                                className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors whitespace-nowrap ${activeSubCategory?.name === sub.name ? 'bg-accent-pink text-white' : 'bg-white/10 hover:bg-white/20 text-text-primary'}`}
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Tool Selection */}
                <div className="overflow-y-auto flex-grow">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {content?.map(tool => (
                            <button 
                                key={tool.name} 
                                onClick={() => handleToolClick(tool)}
                                className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-3 text-center flex flex-col items-center justify-center gap-2 aspect-square"
                            >
                                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                                  <category.icon className="w-6 h-6 text-accent-pink" />
                                </div>
                                <span className="text-xs font-semibold">{tool.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ToolDrawer;
