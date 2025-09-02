/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface IntensitySliderProps {
    strength: number;
    setStrength: (value: number) => void;
}

const IntensitySlider: React.FC<IntensitySliderProps> = ({ strength, setStrength }) => {
    return (
        <div className="w-full px-6 pt-4 pb-6">
             <div className="flex justify-between items-baseline mb-2">
                <label htmlFor="intensity" className="font-bold text-sm text-text-secondary">Amount</label>
                <span className="font-bold text-lg text-white">{strength}</span>
            </div>
            <input
                id="intensity"
                type="range"
                min="0"
                max="100"
                value={strength}
                onChange={(e) => setStrength(Number(e.target.value))}
                className="intensity-slider"
            />
        </div>
    );
};

export default IntensitySlider;
