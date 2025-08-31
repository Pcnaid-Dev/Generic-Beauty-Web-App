/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useState, useRef } from 'react';
import { type EditLayer } from '../App';
import { EyeIcon } from './icons';

interface LayersPanelProps {
  layers: EditLayer[];
  onToggleVisibility: (layerId: string) => void;
  onSetOpacity: (layerId: string, opacity: number) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
  onClose: () => void;
}

const LayersPanel: React.FC<LayersPanelProps> = ({ layers, onToggleVisibility, onSetOpacity, onReorder, onClose }) => {
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    const newUrls = new Map<string, string>();
    layers.forEach(layer => {
      const url = URL.createObjectURL(layer.image);
      newUrls.set(layer.id, url);
    });
    setImageUrls(newUrls);

    return () => {
      newUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [layers]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
        // We reorder from the reversed list index to the original list index
        const reversedStartIndex = layers.length - 1 - dragItem.current;
        const reversedEndIndex = layers.length - 1 - dragOverItem.current;
        onReorder(reversedStartIndex, reversedEndIndex);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const reversedLayers = [...layers].reverse();

  return (
    <div 
        className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-end p-4 animate-fade-in backdrop-blur-sm"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-sm h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Layers</h2>
            <button
                onClick={onClose}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold py-0.5 px-2 rounded-lg transition-colors text-xs"
            >
                Close
            </button>
        </div>
        
        <div className="flex-grow p-2 overflow-y-auto">
            <div className="flex flex-col gap-2">
            {reversedLayers.map((layer, index) => (
                <div
                    key={layer.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className="flex flex-col gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-grab active:cursor-grabbing"
                >
                    <div className="flex items-center gap-3">
                        <img 
                            src={imageUrls.get(layer.id)} 
                            alt={layer.name} 
                            className="w-16 h-16 object-cover rounded-md bg-gray-700 flex-shrink-0"
                        />
                        <span className="flex-grow font-medium text-gray-200 text-sm truncate">{layer.name}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleVisibility(layer.id);
                            }}
                            className={`p-2 rounded-full ${layer.isVisible ? 'text-blue-400 hover:bg-blue-500/20' : 'text-gray-500 hover:bg-white/20'}`}
                            aria-label={layer.isVisible ? 'Hide layer' : 'Show layer'}
                        >
                            <EyeIcon className="w-5 h-5" />
                        </button>
                    </div>
                    {/* Opacity Slider */}
                    <div className="flex items-center gap-2 px-2">
                        <label htmlFor={`opacity-${layer.id}`} className="text-xs text-gray-400">Opacity</label>
                        <input
                            id={`opacity-${layer.id}`}
                            type="range"
                            min="0"
                            max="100"
                            value={layer.opacity}
                            onChange={(e) => onSetOpacity(layer.id, Number(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                         <span className="text-xs font-semibold text-gray-300 w-8 text-right">{layer.opacity}%</span>
                    </div>
                </div>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default LayersPanel;