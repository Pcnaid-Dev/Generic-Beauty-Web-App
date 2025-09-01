/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { generateSuggestions } from '../services/geminiService';
import { type EditLayer } from '../App';
import { SparkleIcon } from './icons';

interface QuickFixesPanelProps {
  originalLayer: EditLayer | null;
  onApplySuggestion: (prompt: string) => void;
  isLoading: boolean;
}

const QuickFixesPanel: React.FC<QuickFixesPanelProps> = ({ originalLayer, onApplySuggestion, isLoading }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (originalLayer) {
        const fetchSuggestions = async () => {
            setIsFetching(true);
            try {
                const fetchedSuggestions = await generateSuggestions(originalLayer.image);
                setSuggestions(fetchedSuggestions);
            } catch (error) {
                console.error("Failed to fetch suggestions:", error);
                setSuggestions([]);
            } finally {
                setIsFetching(false);
            }
        };
        fetchSuggestions();
    } else {
        setSuggestions([]);
    }
  }, [originalLayer]);

  if (!originalLayer || (suggestions.length === 0 && !isFetching)) {
    return null;
  }

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-3 animate-fade-in backdrop-blur-sm shadow-lg">
        <h3 className="text-base font-semibold text-center text-gray-300 flex items-center justify-center gap-2">
            <SparkleIcon className="w-5 h-5 text-blue-400" />
            <span>AI Quick Fixes</span>
        </h3>
        {isFetching ? (
            <p className="text-gray-500 text-sm text-center h-9">Getting AI suggestions...</p>
        ) : (
            <div className="flex flex-wrap items-center justify-center gap-2">
                {suggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        onClick={() => onApplySuggestion(suggestion)}
                        disabled={isLoading}
                        className="bg-white/10 hover:bg-white/20 text-gray-200 font-medium py-1.5 px-3 rounded-md transition-colors text-sm disabled:opacity-50"
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
        )}
    </div>
  );
};

export default QuickFixesPanel;