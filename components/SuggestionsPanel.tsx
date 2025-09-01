/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from "react";
import { generateSuggestions } from "../services/geminiService";
import { type EditLayer } from "../App";
import { SparkleIcon } from "./icons";

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
                // Filter for beauty-specific suggestions or enhance them
                const beautySuggestions = fetchedSuggestions.map(suggestion => 
                    enhanceForBeauty(suggestion)
                ).filter(Boolean);
                setSuggestions(beautySuggestions);
            } catch (error) {
                console.error("Failed to fetch beauty suggestions:", error);
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

  // Helper function to enhance suggestions for beauty focus
  const enhanceForBeauty = (suggestion: string): string => {
    // Convert generic suggestions to beauty-focused ones
    const beautyKeywords = ["skin", "hair", "eyes", "lips", "face", "complexion", "glow", "smooth", "enhance", "brighten", "soften"];
    const isBeautyRelated = beautyKeywords.some(keyword => 
      suggestion.toLowerCase().includes(keyword)
    );
    
    if (isBeautyRelated) {
      return suggestion;
    }
    
    // Convert generic suggestions to beauty equivalents
    if (suggestion.toLowerCase().includes("vintage") || suggestion.toLowerCase().includes("film")) {
      return "Apply a natural beauty filter with soft, warm tones";
    }
    if (suggestion.toLowerCase().includes("background") || suggestion.toLowerCase().includes("blur")) {
      return "Create a beautiful portrait effect with background blur";
    }
    if (suggestion.toLowerCase().includes("lighting") || suggestion.toLowerCase().includes("light")) {
      return "Enhance facial lighting for a natural, glowing look";
    }
    
    // Return the original if no beauty enhancement is obvious
    return suggestion;
  };

  if (!originalLayer || (suggestions.length === 0 && !isFetching)) {
    return null;
  }

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-3 animate-fade-in backdrop-blur-sm shadow-lg">
        <h3 className="text-base font-semibold text-center text-gray-300 flex items-center justify-center gap-2">
            <SparkleIcon className="w-5 h-5 text-pink-400" />
            <span>AI Beauty Editor</span>
        </h3>
        {isFetching ? (
            <p className="text-gray-500 text-sm text-center h-9">Getting AI beauty suggestions...</p>
        ) : (
            <div className="flex flex-wrap items-center justify-center gap-2">
                {suggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        onClick={() => onApplySuggestion(suggestion)}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-400/30 text-gray-200 font-medium py-2 px-4 rounded-lg transition-all duration-200 ease-in-out text-sm disabled:opacity-50 hover:shadow-lg hover:shadow-pink-500/20"
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
