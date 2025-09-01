/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

const CropPanel: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 p-4 text-center animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-200">Crop & Straighten</h3>
      <p className="text-sm text-gray-400">
        Use the handles on the image to adjust the crop area. The aspect ratio is currently locked to 16:9.
      </p>
      <p className="text-sm text-gray-400 mt-4">
        When you are satisfied with your selection, click the "Apply Crop" button at the bottom of the panel to confirm the change.
      </p>
    </div>
  );
};

export default CropPanel;
