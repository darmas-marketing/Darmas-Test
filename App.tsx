import React, { useState, useCallback } from 'react';
import JSZip from 'jszip';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import PromptManager from './components/PromptManager';
import ResultsDisplay from './components/ResultsDisplay';
import DownloadIcon from './components/icons/DownloadIcon';
import { generateImageVariation } from './services/geminiService';
import type { Prompt, GeneratedImage, ImageFile } from './types';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<ImageFile | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([{ id: Date.now(), value: '' }]);
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const handleGenerateVariations = useCallback(async () => {
    if (!originalImage || prompts.every(p => !p.value.trim())) {
      alert("Please upload an image and add at least one valid prompt.");
      return;
    }

    setIsGenerating(true);
    const validPrompts = prompts.filter(p => p.value.trim());

    const initialResults: GeneratedImage[] = validPrompts.map(prompt => ({
      prompt: prompt.value,
      imageUrl: null,
      error: null,
      isLoading: true,
    }));
    setResults(initialResults);

    const generationPromises = validPrompts.map((prompt, index) =>
      generateImageVariation(originalImage, prompt.value)
        .then(base64Image => {
          setResults(prev =>
            prev.map((r, i) =>
              i === index ? { ...r, imageUrl: `data:image/png;base64,${base64Image}`, isLoading: false } : r
            )
          );
        })
        .catch(error => {
          let errorMessage = 'Failed to generate image.';
          if (error instanceof Error) {
              if (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')) {
                  errorMessage = "Rate limit reached. Please wait a moment and try again.";
              } else if (error.message.startsWith('API Error:')) {
                  errorMessage = error.message.replace('API Error: ', '');
              } else {
                  errorMessage = error.message;
              }
          }
          setResults(prev =>
            prev.map((r, i) =>
              i === index ? { ...r, error: errorMessage, isLoading: false } : r
            )
          );
        })
    );

    await Promise.allSettled(generationPromises);
    setIsGenerating(false);
  }, [originalImage, prompts]);

  const handleDownloadAll = async () => {
    const successfulResults = results.filter(r => r.imageUrl);
    if (successfulResults.length === 0) {
      alert("No successful images to download.");
      return;
    }

    setIsZipping(true);

    try {
        const zip = new JSZip();

        const promises = successfulResults.map(async (result) => {
            if (result.imageUrl) {
                const base64Data = result.imageUrl.split(',')[1];
                const sanitizedPrompt = result.prompt.replace(/[^a-z0-9]/gi, '_').slice(0, 50);
                const fileName = `${sanitizedPrompt}_${Math.random().toString(36).substring(2, 8)}.png`;
                zip.file(fileName, base64Data, { base64: true });
            }
        });

        await Promise.all(promises);

        const content = await zip.generateAsync({ type: "blob" });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'generated_variations.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

    } catch (error) {
        console.error("Error creating ZIP file:", error);
        alert("An error occurred while creating the ZIP file.");
    } finally {
        setIsZipping(false);
    }
  };

  const canGenerate = !isGenerating && originalImage !== null && prompts.some(p => p.value.trim() !== '');
  const canDownload = !isZipping && results.some(r => r.imageUrl);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-8">
              <ImageUploader onImageUpload={setOriginalImage} />
              <PromptManager prompts={prompts} setPrompts={setPrompts} />
              <div className="mt-6">
                <button
                  onClick={handleGenerateVariations}
                  disabled={!canGenerate}
                  className={`w-full flex items-center justify-center gap-2 text-white font-bold py-3 px-4 rounded-lg transition-all ${
                    canGenerate ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md' : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isGenerating ? (
                    <>
                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                      Generating...
                    </>
                  ) : (
                    'Generate Variations'
                  )}
                </button>
              </div>
            </div>
          </aside>
          <div className="lg:col-span-8 xl:col-span-9 bg-white p-6 rounded-xl border border-gray-200 min-h-[600px]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">3. Generated Variations</h3>
                <button
                    onClick={handleDownloadAll}
                    disabled={!canDownload}
                    className="flex items-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 font-semibold py-2 px-4 rounded-lg transition-colors text-sm disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                    aria-label="Download all generated images as a ZIP file"
                >
                    {isZipping ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Zipping...
                        </>
                    ) : (
                        <>
                            <DownloadIcon className="w-4 h-4" />
                            Download All (.zip)
                        </>
                    )}
                </button>
            </div>
            <ResultsDisplay results={results} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
