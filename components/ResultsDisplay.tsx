
import React from 'react';
import type { GeneratedImage } from '../types';
import Loader from './Loader';

interface ResultsDisplayProps {
  results: GeneratedImage[];
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-300 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>

        <h3 className="text-xl font-semibold text-gray-700">Ihre generierten Bilder werden hier angezeigt.</h3>
        <p className="mt-2 max-w-md">Laden Sie ein Bild hoch, fügen Sie einige Prompts hinzu und klicken Sie auf „Variationen erstellen“, um die Magie zu erleben.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
      {results.map((result, index) => (
        <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
          <div className="aspect-square bg-gray-100 flex items-center justify-center">
            {result.isLoading && <Loader />}
            {result.error && (
              <div className="p-4 text-center text-red-600">
                <p className="font-semibold">Erstellung fehlgeschlagen</p>
                <p className="text-sm">{result.error}</p>
              </div>
            )}
            {result.imageUrl && (
              <img
                src={result.imageUrl}
                alt={`Variation für: ${result.prompt}`}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="p-4 border-t border-gray-200 bg-gray-50 h-full">
            <p className="text-sm font-medium text-gray-800 break-words">{result.prompt}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResultsDisplay;