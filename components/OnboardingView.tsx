import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface OnboardingViewProps {
  onComplete: (name: string) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError('Моля, въведи име.');
      return;
    }
    
    if (trimmedName.length > 20) {
      setError('Името трябва да е под 20 символа.');
      return;
    }

    onComplete(trimmedName);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-slate-900 px-6 animate-in fade-in duration-500 transition-colors">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Sparkles size={32} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-2">
          Добре дошъл!
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-10 text-lg">
          Как ти викат приятелите?
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Напиши името си тук..."
              className={`w-full px-6 py-4 text-lg text-slate-900 bg-slate-50 border-2 rounded-2xl outline-none transition-all placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 ${
                error 
                  ? 'border-red-300 focus:border-red-500 bg-red-50' 
                  : 'border-slate-100 focus:border-indigo-500'
              }`}
              autoFocus
            />
            {error && (
              <p className="absolute -bottom-6 left-0 text-sm text-red-500 font-medium animate-in slide-in-from-top-1">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2 group"
          >
            <span>Продължи</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
};