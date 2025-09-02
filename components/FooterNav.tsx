/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion } from 'framer-motion';
import { toolData, Category } from '../data/tools';

interface FooterNavProps {
    onCategorySelect: (category: Category) => void;
}

const FooterNav: React.FC<FooterNavProps> = ({ onCategorySelect }) => {
    return (
        <motion.footer 
            className="w-full glass-panel flex-shrink-0"
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
        >
            <div className="mx-auto max-w-5xl px-4 py-2">
                <div className="flex justify-around items-center">
                    {toolData.map(category => (
                        <button 
                            key={category.id} 
                            onClick={() => onCategorySelect(category)}
                            className="flex flex-col items-center gap-1 text-text-secondary hover:text-white transition-colors p-2 rounded-lg w-20"
                        >
                            <category.icon className="w-6 h-6" />
                            <span className="text-xs font-semibold">{category.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </motion.footer>
    );
};

export default FooterNav;
