/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { UndoIcon, RedoIcon, EyeIcon, HistoryIcon, DownloadIcon, UploadIcon, ResetIcon, SparkleIcon, GridIcon, ZoomInIcon, ZoomOutIcon, FitToScreenIcon, MenuIcon, PanelRightIcon } from './icons';

interface HeaderProps {
    hasImage: boolean;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
    onCompareStart: () => void;
    onCompareEnd: () => void;
    onHistoryClick: () => void;
    onReset: () => void;
    onUploadNew: () => void;
    onDownload: () => void;
    onExportClick: () => void;
    onToggleSidebar: () => void;
    isPanelOpen: boolean;
    isPanelDocked: boolean;
    onTogglePanel: () => void;
}

const Header: React.FC<HeaderProps> = ({
    hasImage, canUndo, canRedo, onUndo, onRedo, 
    onCompareStart, onCompareEnd, onHistoryClick,
    onReset, onUploadNew, onDownload, onExportClick,
    onToggleSidebar, isPanelOpen, isPanelDocked, onTogglePanel
}) => {
  return (
    <header className="w-full py-3 px-4 md:px-6 border-b border-gray-700 bg-gray-800/50 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between flex-shrink-0 shadow-lg">
      <div className="flex items-center justify-center gap-2">
          {hasImage && <button onClick={onToggleSidebar} className="p-2 rounded-md hover:bg-white/10 text-gray-300 -ml-2" title="Toggle Sidebar (L)"><MenuIcon className="w-5 h-5"/></button>}
          <SparkleIcon className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold tracking-tight text-gray-100">
            Pixshop
          </h1>
      </div>
      
      {hasImage && (
        <div className="flex items-center gap-1.5 animate-fade-in">
            <button onClick={onUndo} disabled={!canUndo} className="p-2 rounded-md hover:bg-white/10 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" title="Undo (Ctrl+Z)"><UndoIcon className="w-5 h-5" /></button>
            <button onClick={onRedo} disabled={!canRedo} className="p-2 rounded-md hover:bg-white/10 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" title="Redo (Ctrl+Y)"><RedoIcon className="w-5 h-5" /></button>
            
            <div className="h-6 w-px bg-gray-600 mx-2"></div>

            <button onMouseDown={onCompareStart} onMouseUp={onCompareEnd} onMouseLeave={onCompareEnd} onTouchStart={onCompareStart} onTouchEnd={onCompareEnd} className="p-2 rounded-md hover:bg-white/10 text-gray-300" title="Compare with original (Hold)"><EyeIcon className="w-5 h-5" /></button>
            <button className="p-2 rounded-md hover:bg-white/10 text-gray-300" title="Zoom In (Ctrl +)"><ZoomInIcon className="w-5 h-5" /></button>
            <button className="p-2 rounded-md hover:bg-white/10 text-gray-300" title="Zoom Out (Ctrl -)"><ZoomOutIcon className="w-5 h-5" /></button>
            <button className="p-2 rounded-md hover:bg-white/10 text-gray-300" title="Fit to Screen (Ctrl 0)"><FitToScreenIcon className="w-5 h-5" /></button>
            <button className="p-2 rounded-md hover:bg-white/10 text-gray-300" title="Toggle Grid (G)"><GridIcon className="w-5 h-5" /></button>
            <button onClick={onHistoryClick} className="p-2 rounded-md hover:bg-white/10 text-gray-300" title="History / Edits Stack (H)"><HistoryIcon className="w-5 h-5" /></button>
            
            <div className="h-6 w-px bg-gray-600 mx-2"></div>
            
            <button onClick={onReset} disabled={!canUndo} className="p-2 rounded-md hover:bg-white/10 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" title="Reset all changes"><ResetIcon className="w-5 h-5" /></button>
            <button onClick={onUploadNew} className="p-2 rounded-md hover:bg-white/10 text-gray-300" title="Upload new image"><UploadIcon className="w-5 h-5" /></button>
            
            {!isPanelDocked && (
                <button onClick={onTogglePanel} className="ml-2 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-1.5 px-4 rounded-md transition-colors text-sm" title="Toggle Panel (P)">
                  <PanelRightIcon className="w-5 h-5" />
                  <span>Panel</span>
                </button>
            )}

            <button onClick={onExportClick} className="ml-2 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-1.5 px-4 rounded-md transition-colors text-sm" title="Export Image (Ctrl+E)">
              <span>Export</span>
            </button>
        </div>
      )}
    </header>
  );
};

export default Header;