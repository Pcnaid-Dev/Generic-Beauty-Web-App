import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { UploadIcon, ArrowLeftIcon, CompareIcon, SaveIcon } from './components/icons';
import { EDITOR_DATA } from './editorData';
import { applyBeautyEdit } from './services/geminiService';

// Main Application Component
export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setOriginalImage(result);
        setEditedImage(result);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToolSelect = async (toolName: string) => {
    setActiveTool(toolName);
    if (!editedImage) return;

    setIsLoading(true);
    setError(null);
    try {
      const newImage = await applyBeautyEdit(editedImage, toolName, intensity);
      setEditedImage(newImage);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred during AI processing.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = () => {
    if (!editedImage) return;
    const link = document.createElement('a');
    link.download = `ai-beauty-edit-${Date.now()}.png`;
    link.href = editedImage;
    link.click();
  };

  const openCategory = (categoryName: string) => {
    setActiveCategory(categoryName);
    const category = EDITOR_DATA.find(c => c.name === categoryName);
    if (category && category.subCategories) {
      setActiveSubCategory(Object.keys(category.subCategories)[0]);
    } else {
      setActiveSubCategory(null);
    }
  };

  const closeToolPanel = () => {
    setActiveCategory(null);
    setActiveSubCategory(null);
    setActiveTool(null);
    setError(null);
  };

  const resetState = () => {
    setOriginalImage(null);
    setEditedImage(null);
    closeToolPanel();
  }

  const currentCategoryData = EDITOR_DATA.find(c => c.name === activeCategory);
  const currentTools = activeSubCategory
    ? currentCategoryData?.subCategories?.[activeSubCategory]
    : currentCategoryData?.tools;

  // ---- UI Components ----

  const UploaderScreen = () => (
    <div className="w-full h-full flex items-center justify-center ambient-gradient-background">
      <div className="text-center p-8 border border-white/10 rounded-3xl bg-white/5 backdrop-blur-xl max-w-sm mx-4">
        <h1 className="text-4xl font-bold pink-gradient-text mb-2">AI Beauty Editor</h1>
        <p className="text-white/60 mb-8">Let generative AI bring a magical touch to your portraits.</p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-brand-pink text-white font-semibold py-3 px-6 rounded-xl hover:bg-pink-500 transition-all duration-300"
        >
          Select a photo
        </button>
      </div>
    </div>
  );

  const EditorScreen = () => (
    <div className="w-full h-full relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-500"
        style={{
          backgroundImage: `url(${editedImage})`,
          filter: 'blur(30px) brightness(0.4)',
          transform: 'scale(1.1)',
        }}
      />
      
      {/* Error Display */}
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-red-500/30 border border-red-500 text-white p-4 rounded-xl max-w-md w-full text-center shadow-lg backdrop-blur-sm">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
          <button onClick={() => setError(null)} className="mt-2 text-xs text-white/70 hover:text-white underline">Dismiss</button>
        </div>
      )}


      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Header */}
        <header className="absolute top-4 left-4 right-4 h-14 flex items-center justify-between p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <button onClick={resetState} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors" title="Upload New"><UploadIcon className="w-5 h-5" /></button>
          <button
            onMouseDown={() => setIsComparing(true)}
            onMouseUp={() => setIsComparing(false)}
            onTouchStart={() => setIsComparing(true)}
            onTouchEnd={() => setIsComparing(false)}
            className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            title="Hold to Compare"
          >
            <CompareIcon className="w-5 h-5" />
          </button>
          <button onClick={handleSave} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors" title="Save Image"><SaveIcon className="w-5 h-5" /></button>
        </header>

        {/* Image Display */}
        <div className="flex-grow flex items-center justify-center p-4 pt-24 pb-24">
          <div className="relative w-full max-w-md">
            <AnimatePresence>
              <motion.img
                key={isComparing ? originalImage : editedImage}
                src={isComparing ? originalImage ?? undefined : editedImage ?? undefined}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full object-contain rounded-3xl shadow-2xl aspect-[3/4]"
              />
            </AnimatePresence>
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-3xl">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        {/* Footer & Tool Panels */}
        <footer className="absolute bottom-4 left-4 right-4">
          <AnimatePresence>
            {!activeCategory ? (
              <motion.div
                key="categories"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 150 }}
                className="flex items-center justify-around h-20 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl"
              >
                {EDITOR_DATA.map(category => (
                  <button key={category.name} onClick={() => openCategory(category.name)} className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
                    <category.icon className="w-6 h-6" />
                    <span className="text-xs">{category.name}</span>
                  </button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="tool-panel"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                className="h-[45vh] bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4 flex flex-col"
              >
                {/* Panel Header */}
                <div className="flex items-center justify-between pb-3">
                  <button onClick={closeToolPanel} className="p-2 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
                  <h2 className="font-semibold text-lg">{activeCategory}</h2>
                  <div className="w-6"></div> {/* Spacer */}
                </div>

                {/* Intensity Slider */}
                <div className='flex items-center gap-4 py-2'>
                  <span className='text-sm text-white/60'>Amount</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-pink"
                  />
                </div>

                {/* Sub-Category Tabs */}
                {currentCategoryData?.subCategories && (
                  <div className="flex gap-2 py-3 overflow-x-auto">
                    {Object.keys(currentCategoryData.subCategories).map(subCat => (
                      <button
                        key={subCat}
                        onClick={() => setActiveSubCategory(subCat)}
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${activeSubCategory === subCat ? 'bg-brand-pink text-white' : 'bg-white/10 hover:bg-white/20'}`}
                      >
                        {subCat}
                      </button>
                    ))}
                  </div>
                )}

                {/* Tools */}
                <div className="flex-grow flex items-center gap-3 overflow-x-auto pb-2">
                  {currentTools?.map(tool => (
                    <button
                      key={tool.name}
                      onClick={() => handleToolSelect(tool.name)}
                      className="flex flex-col items-center gap-2 text-center flex-shrink-0"
                    >
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all ${activeTool === tool.name ? 'bg-brand-pink' : 'bg-white/10'}`}>
                        <tool.icon className="w-8 h-8" />
                      </div>
                      <span className="text-xs text-white/80">{tool.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </footer>
      </div>
    </div>
  );

  return (
    <main className="h-[100dvh] w-screen bg-black text-white">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
      {!editedImage ? <UploaderScreen /> : <EditorScreen />}
    </main>
  );
}
