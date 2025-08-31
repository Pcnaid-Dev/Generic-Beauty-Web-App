/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { UndoIcon, RedoIcon, EyeIcon, HistoryIcon, DownloadIcon, UploadIcon, ResetIcon } from './icons';

interface HeaderProps {
    hasImage: boolean;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
    onCompareStart: () => void;
    onCompareEnd: () => void;
    onLayersClick: () => void;
    onReset: () => void;
    onUploadNew: () => void;
    onDownload: () => void;
}

const SparkleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.624l-.219.874-.219-.874a1.5 1.5 0 00-1.023-1.023l-.874-.219.874-.219a1.5 1.5 0 001.023-1.023l.219-.874.219.874a1.5 1.5 0 001.023 1.023l.874.219-.874.219a1.5 1.5 0 00-1.023 1.023z" />
  </svg>
);

const Header: React.FC<HeaderProps> = ({
    hasImage, canUndo, canRedo, onUndo, onRedo, 
    onCompareStart, onCompareEnd, onLayersClick,
    onReset, onUploadNew, onDownload
}) => {
  return (
    <header className="w-full py-3 px-4 md:px-6 border-b border-gray-700 bg-gray-800/50 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between">
      <div className="flex items-center justify-center gap-3">
          <SparkleIcon className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold tracking-tight text-gray-100">
            Pixshop
          </h1>
      </div>
      
      {hasImage && (
        <div className="flex items-center gap-2 animate-fade-in">
            <button onClick={onUndo} disabled={!canUndo} className="p-1.5 rounded-md hover:bg-white/10 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Undo"><UndoIcon className="w-5 h-5" /></button>
            <button onClick={onRedo} disabled={!canRedo} className="p-1.5 rounded-md hover:bg-white/10 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Redo"><RedoIcon className="w-5 h-5" /></button>
            
            <div className="h-6 w-px bg-gray-600 mx-1"></div>
            
            <button onMouseDown={onCompareStart} onMouseUp={onCompareEnd} onMouseLeave={onCompareEnd} onTouchStart={onCompareStart} onTouchEnd={onCompareEnd} className="p-1.5 rounded-md hover:bg-white/10 text-gray-300" aria-label="Compare with original"><EyeIcon className="w-5 h-5" /></button>
            <button onClick={onLayersClick} className="p-1.5 rounded-md hover:bg-white/10 text-gray-300" aria-label="View layers"><HistoryIcon className="w-5 h-5" /></button>
            <button onClick={onReset} disabled={!canUndo} className="p-1.5 rounded-md hover:bg-white/10 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Reset all changes"><ResetIcon className="w-5 h-5" /></button>
            
            <div className="h-6 w-px bg-gray-600 mx-1"></div>
            
            <button onClick={onUploadNew} className="p-1.5 rounded-md hover:bg-white/10 text-gray-300" aria-label="Upload new image"><UploadIcon className="w-5 h-5" /></button>
            <button onClick={onDownload} className="ml-2 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-1.5 px-3 rounded-md transition-colors text-xs" aria-label="Download image">
              <DownloadIcon className="w-5 h-5" />
              <span>Export</span>
            </button>
        </div>
      )}
    </header>
  );
};

export default Header;