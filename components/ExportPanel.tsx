/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { DownloadIcon } from './icons';

interface ExportPanelProps {
  onDownload: () => void;
  isLoading: boolean;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ onDownload, isLoading }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 text-center h-full animate-fade-in">
      <DownloadIcon className="w-16 h-16 text-blue-400" />
      <h3 className="text-2xl font-bold text-gray-100">Export Your Image</h3>
      <p className="text-gray-400 max-w-xs">
        Your masterpiece is ready. Click the button below to download the final image as a high-quality PNG file.
      </p>
      <button
        onClick={onDownload}
        disabled={isLoading}
        className="w-full max-w-sm bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-blue-800 disabled:to-blue-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? 'Processing...' : 'Download Image'}
      </button>
    </div>
  );
};

export default ExportPanel;
