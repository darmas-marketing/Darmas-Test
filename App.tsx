import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import PromptManager from './components/PromptManager';
import ResultsDisplay from './components/ResultsDisplay';
import { generateImageVariation } from './services/geminiService';
import type { Prompt, GeneratedImage, ImageFile } from './types';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<ImageFile | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([{ id: Date.now(), value: '' }]);
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGenerateVariations = useCallback(async () => {
    if (!originalImage || prompts.every(p => !p.value.trim())) {
      alert("Bitte laden Sie ein Bild hoch und geben Sie mindestens einen gültigen Prompt ein.");
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

    for (const prompt of validPrompts) {
        try {
            const base64Image = await generateImageVariation(originalImage, prompt.value);
            setResults(prev =>
                prev.map(r =>
                    r.prompt === prompt.value
                        ? { ...r, imageUrl: `data:image/png;base64,${base64Image}`, isLoading: false }
                        : r
                )
            );
        } catch (error) {
            let errorMessage = 'Bild konnte nicht erstellt werden.';
            if (error instanceof Error) {
                if (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')) {
                    errorMessage = "Ratenlimit erreicht. Bitte warten Sie einen Moment und versuchen Sie es erneut.";
                } else if (error.message.startsWith('API Error:')) {
                    errorMessage = error.message.replace('API Error: ', '');
                } else {
                    errorMessage = error.message;
                }
            }
            setResults(prev =>
                prev.map(r =>
                    r.prompt === prompt.value
                        ? { ...r, error: errorMessage, isLoading: false }
                        : r
                )
            );
        }
    }

    setIsGenerating(false);
  }, [originalImage, prompts]);

  const canGenerate = !isGenerating && originalImage !== null && prompts.some(p => p.value.trim() !== '');

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
                      Wird erstellt...
                    </>
                  ) : (
                    'Variationen erstellen'
                  )}
                </button>
              </div>
            </div>
          </aside>
          <div className="lg:col-span-8 xl:col-span-9 bg-white p-6 rounded-xl border border-gray-200 min-h-[600px]">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">3. Erstellte Variationen</h3>
            <ResultsDisplay results={results} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;