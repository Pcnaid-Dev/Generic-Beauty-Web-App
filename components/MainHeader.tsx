/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion } from 'framer-motion';
import { UploadIcon, EyeIcon, SaveIcon } from './icons';

interface MainHeaderProps {
    onUploadNew: () => void;
    onCompareStart: () => void;
    onCompareEnd: () => void;
    onSave: () => void;
}

const MainHeader: React.FC<MainHeaderProps> = ({ onUploadNew, onCompareStart, onCompareEnd, onSave }) => {
    
    const buttonVariants = {
        hover: { scale: 1.1, backgroundColor: "rgba(255,255,255,0.15)" },
        tap: { scale: 0.9 }
    };

    return (
        <motion.header 
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
        >
            <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                <motion.button 
                    onClick={onUploadNew} 
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    title="Upload New"
                >
                    <UploadIcon className="w-5 h-5" />
                </motion.button>
                <motion.button 
                    onMouseDown={onCompareStart} 
                    onMouseUp={onCompareEnd} 
                    onMouseLeave={onCompareEnd}
                    onTouchStart={onCompareStart}
                    onTouchEnd={onCompareEnd}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    title="Hold to Compare"
                >
                    <EyeIcon className="w-5 h-5" />
                </motion.button>
                <motion.button 
                    onClick={onSave} 
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    title="Save Image"
                >
                    <SaveIcon className="w-5 h-5" />
                </motion.button>
            </div>
        </motion.header>
    );
};

export default MainHeader;
