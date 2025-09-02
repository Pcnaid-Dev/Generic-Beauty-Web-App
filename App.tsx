/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { applyAiEffect } from './services/geminiService';
import StartScreen from './components/StartScreen';
import MainHeader from './components/MainHeader';
import FooterNav from './components/FooterNav';
import ToolDrawer from './components/ToolDrawer';
import Spinner from './components/Spinner';
import { Category } from './data/tools';
import 'react-image-crop/dist/ReactCrop.css';

// Fix: Export EditLayer interface so other components can import it.
export interface EditLayer {
    id: string;
    name: string;
    image: File;
    isVisible: boolean;
    opacity: number;
}

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

const App: React.FC = () => {
    const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
    const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
    const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isComparing, setIsComparing] = useState<boolean>(false);
    
    const [activeCategory, setActiveCategory] = useState<Category | null>(null);

    // Effect to revoke object URLs on cleanup
    useEffect(() => {
        return () => {
            if (originalImageUrl) URL.revokeObjectURL(originalImageUrl);
            // editedImageUrl is also an object URL initially, so revoke it too
            if (editedImageUrl && editedImageUrl.startsWith('blob:')) URL.revokeObjectURL(editedImageUrl);
        };
    }, [originalImageUrl, editedImageUrl]);

    const handleImageUpload = useCallback((file: File) => {
        if (originalImageUrl) URL.revokeObjectURL(originalImageUrl);
        if (editedImageUrl && editedImageUrl.startsWith('blob:')) URL.revokeObjectURL(editedImageUrl);

        const url = URL.createObjectURL(file);
        setOriginalImageFile(file);
        setOriginalImageUrl(url);
        setEditedImageUrl(url);
        setError(null);
        setActiveCategory(null);
    }, [originalImageUrl, editedImageUrl]);

    const handleApplyEffect = useCallback(async (prompt: string, strength: number) => {
        if (!editedImageUrl) {
            setError('No image is loaded to apply an effect to.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const currentImageFile = dataURLtoFile(editedImageUrl, 'current_edit.png');
            const newImageDataBase64 = await applyAiEffect(currentImageFile, prompt, strength);
            
            // We don't need to create a new blob URL, the service returns a base64 data URL
            setEditedImageUrl(newImageDataBase64);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to apply effect. ${errorMessage}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [editedImageUrl]);

    const handleUploadNew = () => {
        setOriginalImageFile(null);
        setOriginalImageUrl(null);
        setEditedImageUrl(null);
        setActiveCategory(null);
    };

    const handleSave = () => {
        if (!editedImageUrl) return;
        const link = document.createElement('a');
        link.href = editedImageUrl;
        link.download = `edited-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderContent = () => {
        if (!originalImageFile || !editedImageUrl) {
            return <StartScreen onImageSelected={handleImageUpload} />;
        }

        const displayedImage = isComparing ? originalImageUrl : editedImageUrl;

        return (
            <div className="w-full h-full flex flex-col">
                <MainHeader 
                    onUploadNew={handleUploadNew}
                    onCompareStart={() => setIsComparing(true)}
                    onCompareEnd={() => setIsComparing(false)}
                    onSave={handleSave}
                />
                <main className="flex-grow flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
                     {/* Image Display */}
                    <AnimatePresence>
                        <motion.img
                            key={displayedImage}
                            src={displayedImage ?? ''}
                            alt={isComparing ? "Original" : "Edited"}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="max-w-full max-h-full w-auto h-auto object-contain rounded-3xl shadow-2xl shadow-black/50"
                            style={{ aspectRatio: '3/4', objectFit: 'cover' }}
                        />
                    </AnimatePresence>
                </main>
                <FooterNav onCategorySelect={setActiveCategory} />
                <AnimatePresence>
                    {activeCategory && (
                        <ToolDrawer 
                            category={activeCategory}
                            onClose={() => setActiveCategory(null)}
                            onApplyEffect={handleApplyEffect}
                        />
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div className="h-screen w-screen bg-bg-dark text-text-primary flex flex-col relative">
            {/* Background */}
            <div 
                className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-500 ease-in-out"
                style={{
                    backgroundImage: originalImageUrl ? `url(${originalImageUrl})` : 'none',
                    filter: 'blur(30px) brightness(0.4)',
                    transform: 'scale(1.1)',
                }}
            />

            {isLoading && (
                <div className="absolute inset-0 bg-black/70 z-[100] flex flex-col items-center justify-center gap-4 animate-fade-in glass-panel">
                    <Spinner />
                    <p className="text-text-secondary">Applying AI magic...</p>
                </div>
            )}
            
            {error && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/80 text-white p-4 rounded-lg shadow-lg z-[101] max-w-md w-full text-center glass-panel border-red-500">
                    <p className="font-bold">Error</p>
                    <p className="text-sm">{error}</p>
                    <button onClick={() => setError(null)} className="mt-2 text-xs font-bold underline">DISMISS</button>
                </div>
            )}

            {renderContent()}
        </div>
    );
};

export default App;