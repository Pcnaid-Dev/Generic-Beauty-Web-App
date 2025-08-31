/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';

interface MaskingCanvasProps {
  imageElement: HTMLImageElement;
  mode: 'brush' | 'erase';
  brushSize: number;
}

const MaskingCanvas = forwardRef((props: MaskingCanvasProps, ref) => {
  const { imageElement, mode, brushSize } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Expose a function to the parent component to get the mask data
  useImperativeHandle(ref, () => ({
    getMaskData: (): string | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      // Create a new canvas to draw a black background for transparency
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = canvas.width;
      exportCanvas.height = canvas.height;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) return null;
      
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      ctx.drawImage(canvas, 0, 0);
      
      return exportCanvas.toDataURL('image/png');
    },
  }));

  // Initialize or resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && imageElement) {
      const rect = imageElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [imageElement]);

  const getCoords = (e: React.MouseEvent): { x: number, y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent) => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    const { x, y } = getCoords(e);
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    const { x, y } = getCoords(e);

    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = brushSize;
    
    if (mode === 'brush') {
      context.globalCompositeOperation = 'source-over';
      context.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    } else { // erase
      context.globalCompositeOperation = 'destination-out';
      context.strokeStyle = 'rgba(0, 0, 0, 1)';
    }

    context.lineTo(x, y);
    context.stroke();
    context.beginPath(); // a new path for next point
    context.moveTo(x, y);
  };

  const stopDrawing = () => {
    const context = canvasRef.current?.getContext('2d');
    if (context) context.closePath();
    setIsDrawing(false);
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full z-40 cursor-crosshair"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing} // Stop drawing if mouse leaves canvas
    />
  );
});

export default MaskingCanvas;
