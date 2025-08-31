/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { generateSuggestions } from '../services/geminiService';
import { type EditLayer } from '../App';

interface SuggestionsPanelProps {
  originalLayer: EditLayer | null;
  onApplySuggestion: (prompt: string) => void;
  isLoading: boolean;
}

const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({ originalLayer, onApplySuggestion, isLoading }) => {
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
                setSuggestions([]); // Clear on error
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
    return null; // Don't render if no image, no suggestions, and not fetching
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-2 mb-2 animate-fade-in">
        <h3 className="text-sm font-semibold text-gray-400">Suggestions</h3>
        {isFetching ? (
            <p className="text-gray-500 text-sm h-9">Getting AI suggestions...</p>
        ) : (
            <div className="flex flex-wrap items-center justify-center gap-2">
                {suggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        onClick={() => onApplySuggestion(suggestion)}
                        disabled={isLoading}
                        className="bg-gray-700/80 hover:bg-gray-600/80 text-gray-200 font-medium py-1.5 px-3 rounded-full transition-colors text-xs disabled:opacity-50"
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
        )}
    </div>
  );
};

export default SuggestionsPanel;