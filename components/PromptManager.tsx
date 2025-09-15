
import React from 'react';
import type { Prompt } from '../types';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';

interface PromptManagerProps {
  prompts: Prompt[];
  setPrompts: React.Dispatch<React.SetStateAction<Prompt[]>>;
}

const PromptManager: React.FC<PromptManagerProps> = ({ prompts, setPrompts }) => {
  const addPrompt = () => {
    setPrompts([...prompts, { id: Date.now(), value: '' }]);
  };

  const removePrompt = (id: number) => {
    setPrompts(prompts.filter((prompt) => prompt.id !== id));
  };

  const updatePrompt = (id: number, value: string) => {
    setPrompts(
      prompts.map((prompt) => (prompt.id === id ? { ...prompt, value } : prompt))
    );
  };

  return (
    <div className="w-full bg-white p-6 rounded-xl border border-gray-200 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">2. Variations-Prompts hinzufügen</h3>
        <button
          onClick={addPrompt}
          className="flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          <PlusIcon className="w-4 h-4" />
          Prompt hinzufügen
        </button>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {prompts.map((prompt, index) => (
          <div key={prompt.id} className="flex items-center gap-3">
            <span className="text-gray-500 font-medium">{index + 1}.</span>
            <input
              type="text"
              value={prompt.value}
              onChange={(e) => updatePrompt(prompt.id, e.target.value)}
              placeholder="z.B. Hintergrund in eine Strandszene ändern"
              className="flex-grow bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
            />
            <button
              onClick={() => removePrompt(prompt.id)}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              aria-label="Prompt entfernen"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
         {prompts.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">Fügen Sie einen Prompt hinzu, um zu beginnen.</p>
        )}
      </div>
    </div>
  );
};

export default PromptManager;