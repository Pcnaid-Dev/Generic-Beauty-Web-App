/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { generateEditedImage, generateFilteredImage, generateBackgroundChange, detectFaces, type Face, detectPeople, type Person, generateSuggestions } from './services/geminiService';
import Header from './components/Header';
import Spinner from './components/Spinner';
import LightAndColorPanel from './components/LightAndColorPanel';
import CropPanel from './components/CropPanel';
import StartScreen from './components/StartScreen';
import LooksPanel from './components/LooksPanel';
import PortraitPanel from './components/PortraitPanel';
import MakeupPanel from './components/MakeupPanel';
import HairPanel from './components/HairPanel';
import BodyPanel from './components/BodyPanel';
import BackgroundPanel from './components/BackgroundPanel';
import LayersPanel from './components/LayersPanel';
import MaskingCanvas from './components/MaskingCanvas';
import MaskingToolbar from './components/MaskingToolbar';
import SuggestionsPanel from './components/SuggestionsPanel';
import ImpressionsPanel from './components/ImpressionsPanel';
import ExpressionsPanel from './components/ExpressionsPanel';
import AgePanel from './components/AgePanel';
import Sidebar from './components/Sidebar';

// Helper to convert a data URL string to a File object
const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");

    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}

export type Tab = 'looks' | 'impressions' | 'portrait' | 'expressions' | 'age' | 'makeup' | 'hair' | 'body' | 'background' | 'light_color' | 'crop';

export interface EditLayer {
    id: string;
    name: string;
    image: File;
    isVisible: boolean;
    opacity: number;
    metadata: Record<string, any>;
}

interface ImageRenderState {
    renderedWidth: number;
    renderedHeight: number;
    offsetX: number;
    offsetY: number;
}

const App: React.FC = () => {
  const [layers, setLayers] = useState<EditLayer[]>([]);
  const [history, setHistory] = useState<EditLayer[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<Tab>('looks');
  
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>();
  
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(false);
  const [globalIntensity, setGlobalIntensity] = useState(70);

  // Advanced editing state
  const [detectedFaces, setDetectedFaces] = useState<Face[]>([]);
  const [selectedFace, setSelectedFace] = useState<Face | null>(null);
  const [isMasking, setIsMasking] = useState<boolean>(false);
  const [maskMode, setMaskMode] = useState<'brush' | 'erase'>('brush');
  const [brushSize, setBrushSize] = useState(30);
  const [imageRenderState, setImageRenderState] = useState<ImageRenderState | null>(null);
  const [detectedPeople, setDetectedPeople] = useState<Person[]>([]);
  const [peopleToRemove, setPeopleToRemove] = useState<number[]>([]);
  const [isPersonRemovalMode, setIsPersonRemovalMode] = useState<boolean>(false);


  const imgRef = useRef<HTMLImageElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const maskingCanvasRef = useRef<{ getMaskData: () => string | null }>(null);

  const originalImage = layers[0]?.image ?? null;

  const [layerImageUrls, setLayerImageUrls] = useState<Map<string, string>>(new Map());
  
  // Effect to manage object URLs for all layer images
  useEffect(() => {
    const newUrls = new Map<string, string>();
    layers.forEach(layer => {
      const url = URL.createObjectURL(layer.image);
      newUrls.set(layer.id, url);
    });
    setLayerImageUrls(newUrls);

    return () => {
      newUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [layers]);

  const updateLayersAndHistory = useCallback((updater: (prevLayers: EditLayer[]) => EditLayer[]) => {
    setLayers(prevLayers => {
        const newLayers = updater(prevLayers);

        setHistory(prevHistory => {
            const newHistorySlice = prevHistory.slice(0, historyIndex + 1);
            const updatedHistory = [...newHistorySlice, newLayers];
            setHistoryIndex(updatedHistory.length - 1);
            return updatedHistory;
        });

        return newLayers;
    });
  }, [historyIndex]);


  const addLayer = useCallback((newImageFile: File, name: string, metadata: Record<string, any> = {}) => {
    const newLayer: EditLayer = {
      id: `layer-${Date.now()}`,
      name,
      image: newImageFile,
      isVisible: true,
      opacity: 100,
      metadata,
    };
    
    updateLayersAndHistory(prevLayers => [...prevLayers, newLayer]);
    
    setCrop(undefined);
    setCompletedCrop(undefined);
  }, [updateLayersAndHistory]);

  const handleImageUpload = useCallback((file: File) => {
    setError(null);
    const initialLayer: EditLayer = {
      id: `layer-${Date.now()}`,
      name: 'Original Image',
      image: file,
      isVisible: true,
      opacity: 100,
      metadata: { type: 'original' }
    };
    const initialLayers = [initialLayer];
    setLayers(initialLayers);
    setHistory([initialLayers]);
    setHistoryIndex(0);
    setActiveTab('looks');
    setDetectedFaces([]);
    setSelectedFace(null);
    setIsMasking(false);
  }, []);

  const handleGenerate = useCallback(async (prompt: string, options: { face?: Face, mask?: string } = {}) => {
    const imageToEdit = layers[layers.length - 1]?.image;
    if (!imageToEdit) {
      setError('No image loaded to edit.');
      return;
    }
    
    if (!prompt.trim()) {
        setError('Please enter a description for your edit.');
        return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
        const editedImageUrl = await generateEditedImage(imageToEdit, prompt, options);
        const newImageFile = dataURLtoFile(editedImageUrl, `edited-${Date.now()}.png`);
        addLayer(newImageFile, prompt, { type: 'generative', prompt });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to generate the image. ${errorMessage}`);
        console.error(err);
    } finally {
        setIsLoading(false);
        setIsMasking(false);
    }
  }, [layers, addLayer]);
  
  const handleApplyFilter = useCallback(async (filterPrompt: string) => {
    const imageToEdit = layers[layers.length - 1]?.image;
    if (!imageToEdit) return;

    setIsLoading(true);
    setError(null);
    try {
        const filteredImageUrl = await generateFilteredImage(imageToEdit, filterPrompt);
        const newImageFile = dataURLtoFile(filteredImageUrl, `filtered-${Date.now()}.png`);
        addLayer(newImageFile, `Filter: ${filterPrompt.substring(0, 20)}...`, { type: 'filter', prompt: filterPrompt });
    } catch (err) {
        setError(`Failed to apply the filter. ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
        setIsLoading(false);
    }
  }, [layers, addLayer]);
  
  const handleApplyGlobalAdjustment = useCallback(async (adjustmentPrompt: string) => {
    const imageToEdit = layers[layers.length - 1]?.image;
    if (!imageToEdit) return;

    setIsLoading(true);
    setError(null);
    try {
        const adjustedImageUrl = await generateBackgroundChange(imageToEdit, adjustmentPrompt);
        const newImageFile = dataURLtoFile(adjustedImageUrl, `adjusted-${Date.now()}.png`);
        addLayer(newImageFile, `Adjustment: ${adjustmentPrompt.substring(0, 20)}...`, { type: 'adjustment', prompt: adjustmentPrompt });
    } catch (err) {
        setError(`Failed to apply the adjustment. ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
        setIsLoading(false);
    }
  }, [layers, addLayer]);

  const handleApplySuggestion = useCallback(async (suggestionPrompt: string) => {
    const imageToEdit = layers[layers.length - 1]?.image;
    if (!imageToEdit) return;

    setIsLoading(true);
    setError(null);
    try {
        const adjustedImageUrl = await generateBackgroundChange(imageToEdit, suggestionPrompt);
        const newImageFile = dataURLtoFile(adjustedImageUrl, `suggested-${Date.now()}.png`);
        addLayer(newImageFile, `Suggestion: ${suggestionPrompt.substring(0, 20)}...`, { type: 'suggestion', prompt: suggestionPrompt });
    // FIX: A typo 'aodn' was here instead of '{' for the catch block, causing a cascade of errors.
    } catch (err) {
        setError(`Failed to apply the suggestion. ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
        setIsLoading(false);
    }
  }, [layers, addLayer]);
  
    const handleApplyBackgroundChange = useCallback(async (prompt: string, peopleToRemove?: Person[]) => {
    const imageToEdit = layers[layers.length - 1]?.image;
    if (!imageToEdit) return;

    setIsLoading(true);
    setError(null);
    try {
        const adjustedImageUrl = await generateBackgroundChange(imageToEdit, prompt, peopleToRemove);
        const newImageFile = dataURLtoFile(adjustedImageUrl, `adjusted-${Date.now()}.png`);
        addLayer(newImageFile, `Background: ${prompt.substring(0, 20)}...`, { type: 'background', prompt });
    } catch (err) {
        setError(`Failed to apply the background change. ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
        setIsLoading(false);
        setDetectedPeople([]);
        setPeopleToRemove([]);
        setIsPersonRemovalMode(false);
    }
  }, [layers, addLayer]);


  const handleApplyCrop = useCallback(() => {
    const imageToCropUrl = layerImageUrls.get(layers[layers.length - 1]?.id);
    if (!completedCrop || !imgRef.current || !imageToCropUrl) return;

    const image = new Image();
    image.src = imageToCropUrl;
    image.onload = () => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        
        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(
          image,
          completedCrop.x * scaleX,
          completedCrop.y * scaleY,
          completedCrop.width * scaleX,
          completedCrop.height * scaleY,
          0,
          0,
          completedCrop.width,
          completedCrop.height,
        );
        
        const croppedImageUrl = canvas.toDataURL('image/png');
        const newImageFile = dataURLtoFile(croppedImageUrl, `cropped-${Date.now()}.png`);
        addLayer(newImageFile, 'Crop', { type: 'crop', crop: completedCrop });
    };
  }, [completedCrop, layerImageUrls, layers, addLayer]);

  const handleReset = useCallback(() => {
    updateLayersAndHistory(prevLayers => prevLayers.slice(0, 1));
  }, [updateLayersAndHistory]);

  const handleUploadNew = useCallback(() => {
      setLayers([]);
      setHistory([]);
      setHistoryIndex(-1);
      setError(null);
  }, []);
  
  const handleUndo = () => {
    if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setLayers(history[newIndex]);
    }
  };

  const handleRedo = () => {
      if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setLayers(history[newIndex]);
      }
  };

  const handleDownload = useCallback(async () => {
    if (layers.length === 0) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loadImage = (file: File): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    };

    const firstImage = await loadImage(layers[0].image);
    canvas.width = firstImage.naturalWidth;
    canvas.height = firstImage.naturalHeight;
    
    // Draw each layer respecting visibility and opacity
    for (const layer of layers) {
        if (layer.isVisible) {
            const img = await loadImage(layer.image);
            ctx.globalAlpha = layer.opacity / 100;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
    }

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `pixshop-edit-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [layers]);

  const handleToggleLayerVisibility = (layerId: string) => {
    updateLayersAndHistory(prevLayers => prevLayers.map(l => l.id === layerId ? { ...l, isVisible: !l.isVisible } : l));
  };
  
  const handleSetLayerOpacity = (layerId: string, opacity: number) => {
    updateLayersAndHistory(prevLayers => prevLayers.map(l => l.id === layerId ? { ...l, opacity } : l));
  };

  const handleReorderLayers = (startIndex: number, endIndex: number) => {
    updateLayersAndHistory(prevLayers => {
        const result = Array.from(prevLayers);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    });
  };
  
  const handleFileSelect = (files: FileList | null) => {
    if (files && files[0]) {
      handleImageUpload(files[0]);
    }
  };

  const handleSetAspect = (aspect: number | undefined) => {
      setAspect(aspect);
      if (imgRef.current && aspect) {
          const { width, height } = imgRef.current;
          const newCrop = centerCrop(
              makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height),
              width,
              height
          );
          setCrop(newCrop);
      }
  };

  // Effect to calculate the rendered image dimensions for accurate bounding box placement
  useEffect(() => {
    const calculateRenderState = () => {
      if (imgRef.current && imageContainerRef.current) {
        const { naturalWidth, naturalHeight } = imgRef.current;
        const { width: containerWidth, height: containerHeight } = imageContainerRef.current.getBoundingClientRect();

        // Don't calculate if image metadata isn't loaded yet
        if (naturalWidth === 0 || naturalHeight === 0) return;

        const scale = Math.min(containerWidth / naturalWidth, containerHeight / naturalHeight);
        const renderedWidth = naturalWidth * scale;
        const renderedHeight = naturalHeight * scale;
        const offsetX = (containerWidth - renderedWidth) / 2;
        const offsetY = (containerHeight - renderedHeight) / 2;

        setImageRenderState({ renderedWidth, renderedHeight, offsetX, offsetY });
      }
    };
    
    const imageElement = imgRef.current;

    // Run calculation once image is loaded, and on every window resize
    if (imageElement) {
        // The 'load' event might have already fired if the image was cached.
        // The 'complete' property checks for this.
        if (imageElement.complete) {
            calculateRenderState();
        } else {
            imageElement.addEventListener('load', calculateRenderState);
        }
    }
    
    window.addEventListener('resize', calculateRenderState);

    return () => {
        if (imageElement) {
            imageElement.removeEventListener('load', calculateRenderState);
        }
        window.removeEventListener('resize', calculateRenderState);
    };
  }, [layers]);


  useEffect(() => {
    const currentImage = layers[layers.length - 1]?.image;
    const isFaceTabActive = ['portrait', 'expressions', 'age'].includes(activeTab);

    if (isFaceTabActive && currentImage && detectedFaces.length === 0) {
      const performDetection = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const faces = await detectFaces(currentImage);
          setDetectedFaces(faces);
          if (faces.length > 0) {
            setSelectedFace(faces[0]);
          }
        } catch (err) {
          setError(`Failed to detect faces. ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
          setIsLoading(false);
        }
      };
      performDetection();
    } else if (!isFaceTabActive) {
      // Clear faces if we navigate away from the portrait tab
      if(detectedFaces.length > 0) {
        setDetectedFaces([]);
        setSelectedFace(null);
      }
    }
  }, [activeTab, layers, detectedFaces.length]);
  
  const handleSelectFace = (direction: 'next' | 'prev') => {
    if (detectedFaces.length === 0 || !selectedFace) return;
    const currentIndex = detectedFaces.findIndex(f => f.id === selectedFace.id);
    const nextIndex = direction === 'next' 
        ? (currentIndex + 1) % detectedFaces.length
        : (currentIndex - 1 + detectedFaces.length) % detectedFaces.length;
    setSelectedFace(detectedFaces[nextIndex]);
  };
  
  const handleApplyMask = (prompt: string) => {
    if (!maskingCanvasRef.current) return;
    const maskData = maskingCanvasRef.current.getMaskData();
    if (maskData && prompt) {
        handleGenerate(prompt, { mask: maskData });
    } else {
        setError("Please describe the edit you want to apply to the masked area.");
    }
  };

    const handleDetectPeople = async () => {
        const currentImage = layers[layers.length - 1]?.image;
        if (!currentImage) return;

        setIsLoading(true);
        setError(null);
        setDetectedPeople([]);
        setPeopleToRemove([]);
        try {
            const people = await detectPeople(currentImage);
            setDetectedPeople(people);
            setIsPersonRemovalMode(true);
        } catch (err) {
            setError(`Failed to detect people. ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const togglePersonForRemoval = (personId: number) => {
        setPeopleToRemove(prev => 
            prev.includes(personId) ? prev.filter(id => id !== personId) : [...prev, personId]
        );
    };

    const handleConfirmRemovePeople = () => {
        const peopleToActuallyRemove = detectedPeople.filter(p => peopleToRemove.includes(p.id));
        if (peopleToActuallyRemove.length > 0) {
            handleApplyBackgroundChange('Remove the selected people from the image.', peopleToActuallyRemove);
        } else {
            // Cancel the mode if no one is selected
            setIsPersonRemovalMode(false);
            setDetectedPeople([]);
            setPeopleToRemove([]);
        }
    };

  const renderContent = () => {
    if (error) {
       return (
           <div className="text-center animate-fade-in bg-red-500/10 border border-red-500/20 p-8 rounded-lg max-w-2xl mx-auto flex flex-col items-center gap-4">
            <h2 className="text-2xl font-bold text-red-300">An Error Occurred</h2>
            <p className="text-md text-red-400">{error}</p>
            <button
                onClick={() => setError(null)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
              >
                Try Again
            </button>
          </div>
        );
    }
    
    if (!originalImage) {
      return <StartScreen onFileSelect={handleFileSelect} />;
    }
    
    const imageToDisplayForCrop = layerImageUrls.get(layers[layers.length - 1]?.id);

    const imageDisplay = (
        <div className="relative w-full h-full">
            {layers.map((layer, index) => {
                const imageUrl = layerImageUrls.get(layer.id);
                if (!layer.isVisible || !imageUrl) return null;
                // For compare mode, only show the original image layer
                if (isComparing && index > 0) return null;

                return (
                    <img
                        key={layer.id}
                        src={imageUrl}
                        alt={layer.name}
                        className="absolute inset-0 w-full h-full object-contain"
                        style={{
                            opacity: layer.opacity / 100,
                            zIndex: index,
                        }}
                        ref={index === 0 ? imgRef : null} // a ref to the base image for calculations
                    />
                );
            })}
        </div>
    );
    
    const cropImageElement = imageToDisplayForCrop ? (
      <img 
        ref={imgRef}
        key={`crop-${imageToDisplayForCrop}`}
        src={imageToDisplayForCrop} 
        alt="Crop this image"
        className="w-full h-auto object-contain max-h-[70vh] rounded-xl"
      />
    ) : null;

    const showIntensitySlider = ['looks', 'impressions', 'makeup'].includes(activeTab);

    const getBoxStyle = (box: {x: number, y: number, width: number, height: number}): React.CSSProperties => {
        if (!imgRef.current || !imageRenderState) {
            return { display: 'none' };
        }
        
        const { naturalWidth, naturalHeight } = imgRef.current;
        const { renderedWidth, renderedHeight, offsetX, offsetY } = imageRenderState;

        const left = (box.x / naturalWidth) * renderedWidth + offsetX;
        const top = (box.y / naturalHeight) * renderedHeight + offsetY;
        const width = (box.width / naturalWidth) * renderedWidth;
        const height = (box.height / naturalHeight) * renderedHeight;

        return {
            position: 'absolute',
            left: `${left}px`,
            top: `${top}px`,
            width: `${width}px`,
            height: `${height}px`,
        };
    };

    return (
      <div className="w-full h-full flex flex-col items-center gap-4 animate-fade-in">
        <div ref={imageContainerRef} className="relative w-full shadow-2xl rounded-xl overflow-hidden bg-black/20 flex-grow aspect-[4/3] flex items-center justify-center">
            {isLoading && (
                <div className="absolute inset-0 bg-black/70 z-50 flex flex-col items-center justify-center gap-4 animate-fade-in">
                    <Spinner />
                    <p className="text-gray-300">AI is working its magic...</p>
                </div>
            )}
            
            {activeTab === 'crop' ? (
              <ReactCrop 
                crop={crop} 
                onChange={c => setCrop(c)} 
                onComplete={c => setCompletedCrop(c)}
                aspect={aspect}
                className="max-h-[70vh]"
              >
                {cropImageElement}
              </ReactCrop>
            ) : imageDisplay }
            
            {isMasking && imgRef.current && (
                <>
                    <MaskingCanvas 
                        ref={maskingCanvasRef}
                        imageElement={imgRef.current}
                        mode={maskMode}
                        brushSize={brushSize}
                    />
                    <MaskingToolbar
                        mode={maskMode}
                        onModeChange={setMaskMode}
                        brushSize={brushSize}
                        onBrushSizeChange={setBrushSize}
                        onApply={handleApplyMask}
                        onCancel={() => setIsMasking(false)}
                    />
                </>
            )}

            {selectedFace && !isMasking && (
                <div
                    className="border-4 border-blue-500 rounded-md pointer-events-none box-border shadow-lg"
                    style={getBoxStyle(selectedFace.box)}
                />
            )}
            {isPersonRemovalMode && detectedPeople.map(person => (
                 <div
                    key={person.id}
                    className={`rounded-md box-border shadow-lg cursor-pointer transition-colors ${peopleToRemove.includes(person.id) ? 'bg-red-500/50 border-4 border-red-400' : 'bg-transparent border-4 border-yellow-400'}`}
                    style={getBoxStyle(person.box)}
                    onClick={() => togglePersonForRemoval(person.id)}
                />
            ))}
        </div>
        
        <SuggestionsPanel
          originalLayer={layers[0] ?? null}
          onApplySuggestion={handleApplySuggestion}
          isLoading={isLoading}
        />
        
        {showIntensitySlider && (
             <div className="w-full max-w-md mx-auto flex flex-col gap-2 animate-fade-in">
                <label htmlFor="intensity" className="text-sm font-medium text-gray-300 flex justify-between">
                    <span>Global Intensity</span>
                    <span className="font-bold text-blue-400">{globalIntensity}%</span>
                </label>
                <input
                    id="intensity"
                    type="range"
                    min="1"
                    max="100"
                    value={globalIntensity}
                    onChange={(e) => setGlobalIntensity(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    disabled={isLoading}
                />
            </div>
        )}
        
        <div className="w-full">
            {activeTab === 'looks' && <LooksPanel onApplyAdjustment={handleApplyGlobalAdjustment} isLoading={isLoading} intensity={globalIntensity} />}
            {activeTab === 'impressions' && <ImpressionsPanel onApplyAdjustment={handleApplyGlobalAdjustment} isLoading={isLoading} intensity={globalIntensity} />}
            {activeTab === 'portrait' && (
                <PortraitPanel
                    onGenerate={handleGenerate}
                    isLoading={isLoading}
                    detectedFaces={detectedFaces}
                    selectedFace={selectedFace}
                    onSelectFace={handleSelectFace}
                    onStartMasking={() => setIsMasking(true)}
                />
            )}
            {activeTab === 'expressions' && (
                <ExpressionsPanel
                    onGenerate={handleGenerate}
                    isLoading={isLoading}
                    detectedFaces={detectedFaces}
                    selectedFace={selectedFace}
                    onSelectFace={handleSelectFace}
                />
            )}
            {activeTab === 'age' && (
                <AgePanel
                    onGenerate={handleGenerate}
                    isLoading={isLoading}
                    detectedFaces={detectedFaces}
                    selectedFace={selectedFace}
                    onSelectFace={handleSelectFace}
                />
            )}
            {activeTab === 'makeup' && <MakeupPanel onApplyAdjustment={handleGenerate} isLoading={isLoading} intensity={globalIntensity} />}
            {activeTab === 'hair' && <HairPanel onApplyAdjustment={handleGenerate} isLoading={isLoading} />}
            {activeTab === 'body' && <BodyPanel onApplyAdjustment={handleGenerate} isLoading={isLoading}/>}
            {activeTab === 'background' && 
                <BackgroundPanel 
                    onBackgroundChange={handleApplyBackgroundChange} 
                    onDetectPeople={handleDetectPeople}
                    isPersonRemovalMode={isPersonRemovalMode}
                    onConfirmRemovePeople={handleConfirmRemovePeople}
                    onCancelRemovePeople={() => { setIsPersonRemovalMode(false); setDetectedPeople([]); setPeopleToRemove([]); }}
                    isLoading={isLoading} 
                />}
            {activeTab === 'light_color' && <LightAndColorPanel onApplyAdjustment={handleApplyGlobalAdjustment} onApplyFilter={handleApplyFilter} isLoading={isLoading} />}
            {activeTab === 'crop' && <CropPanel onApplyCrop={handleApplyCrop} onSetAspect={handleSetAspect} isLoading={isLoading} isCropping={!!completedCrop?.width && completedCrop.width > 0} />}

        </div>

      </div>
    );
  };
  
  return (
    <div className="min-h-screen text-gray-100 flex flex-col">
      <Header 
        hasImage={!!originalImage}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onCompareStart={() => setIsComparing(true)}
        onCompareEnd={() => setIsComparing(false)}
        onLayersClick={() => setIsLayersPanelOpen(true)}
        onReset={handleReset}
        onUploadNew={handleUploadNew}
        onDownload={handleDownload}
      />
      <div className="flex flex-grow">
        {originalImage && <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
        <main className={`flex-grow w-full p-4 md:p-6 flex justify-center ${originalImage ? 'items-start' : 'items-center'}`}>
            {renderContent()}
        </main>
      </div>
      {isLayersPanelOpen && (
        <LayersPanel
          layers={layers}
          onToggleVisibility={handleToggleLayerVisibility}
          onSetOpacity={handleSetLayerOpacity}
          onReorder={handleReorderLayers}
          onClose={() => setIsLayersPanelOpen(false)}
        />
      )}
    </div>
  );
};

export default App;