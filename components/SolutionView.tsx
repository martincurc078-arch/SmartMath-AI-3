import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, Share2, ChevronDown, ChevronUp, Sun, Moon, Copy, Check, X } from 'lucide-react';
import { MathSolution } from '../types';
import { KaTeXRenderer } from './KaTeXRenderer';

interface SolutionViewProps {
  solution: MathSolution;
  onBack: () => void;
  onOpenTutor: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const SolutionView: React.FC<SolutionViewProps> = ({ solution, onBack, onOpenTutor, isDarkMode, toggleTheme }) => {
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const toggleStep = (index: number) => {
    setExpandedSteps(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'Лесно';
      case 'Medium': return 'Средно';
      case 'Hard': return 'Трудно';
      default: return diff;
    }
  };

  const generatePlainText = () => {
    const cleanLatex = (str: string) => str.replace(/\$+/g, '');
    
    let text = `--- SmartMath AI Решение ---\n\n`;
    text += `Тема: ${solution.topic}\n`;
    text += `Трудност: ${getDifficultyLabel(solution.difficulty)}\n\n`;
    text += `Задача:\n${cleanLatex(solution.latex_expression)}\n\n`;
    text += `--- Стъпки ---\n`;
    
    solution.steps.forEach((step, index) => {
      text += `${index + 1}. ${step.title}\n`;
      text += `${step.explanation}\n`;
      text += `=> ${cleanLatex(step.latex_result)}\n\n`;
    });

    text += `--- Краен Отговор ---\n`;
    text += `${cleanLatex(solution.final_answer)}\n`;
    
    return text;
  };

  const handleCopy = () => {
    const text = generatePlainText();
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 shadow-sm z-10 transition-colors">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-semibold text-slate-800 dark:text-white">Решение</h1>
        <button 
          onClick={() => setIsShareOpen(true)}
          className="p-2 -mr-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
        >
          <Share2 size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Main Problem Card */}
        <div className="bg-white dark:bg-slate-800 m-4 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center transition-colors">
          <div className="text-slate-500 dark:text-slate-400 text-sm mb-2 uppercase tracking-wide font-semibold">{solution.topic}</div>
          <div className="py-4 overflow-x-auto">
            <KaTeXRenderer expression={solution.latex_expression} block className="text-2xl text-slate-800 dark:text-white" />
          </div>
          <div className="h-px bg-slate-100 dark:bg-slate-700 w-full my-4"></div>
          <div className="flex justify-between items-center">
             <span className="text-slate-500 dark:text-slate-400 text-sm">Резултат</span>
             <span className={`text-xs px-2 py-1 rounded-full font-medium ${
               solution.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
               solution.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
               'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
             }`}>
               {getDifficultyLabel(solution.difficulty)}
             </span>
          </div>
          <div className="mt-2 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50 overflow-x-auto">
             <KaTeXRenderer expression={solution.final_answer} block className="text-3xl text-indigo-700 dark:text-indigo-400 font-bold" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 mb-6 flex gap-3">
          <button 
            onClick={onOpenTutor}
            className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl shadow-md shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <MessageCircle size={20} />
            <span>AI Учител</span>
          </button>
          
          {/* Theme Switcher */}
          <button 
            onClick={toggleTheme}
            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-3 px-4 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2 transition-all"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDarkMode ? 'Светло' : 'Тъмно'}</span>
          </button>
        </div>

        {/* Steps */}
        <div className="px-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 px-1">Решение стъпка по стъпка</h2>
          <div className="space-y-3">
            {solution.steps.map((step, index) => (
              <div 
                key={index} 
                className={`bg-white dark:bg-slate-800 rounded-xl border transition-all duration-300 overflow-hidden ${
                  expandedSteps.includes(index) 
                    ? 'border-indigo-200 dark:border-indigo-900 shadow-md' 
                    : 'border-slate-100 dark:border-slate-700 shadow-sm'
                }`}
              >
                <button 
                  onClick={() => toggleStep(index)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      expandedSteps.includes(index) 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-800 dark:text-slate-200">{step.title}</h3>
                    </div>
                  </div>
                  {expandedSteps.includes(index) ? (
                    <ChevronUp size={20} className="text-indigo-500" />
                  ) : (
                    <ChevronDown size={20} className="text-slate-400" />
                  )}
                </button>
                
                {expandedSteps.includes(index) && (
                  <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                    <p className="text-slate-600 dark:text-slate-400 mb-3 text-sm leading-relaxed">{step.explanation}</p>
                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-700 overflow-x-auto">
                      <KaTeXRenderer expression={step.latex_result} block className="text-lg text-slate-800 dark:text-slate-200" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {isShareOpen && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl flex flex-col max-h-[80%]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Сподели решение</h3>
              <button 
                onClick={() => setIsShareOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-hidden">
              <textarea 
                readOnly
                className="w-full h-full min-h-[200px] p-3 text-sm font-mono bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none resize-none"
                value={generatePlainText()}
              />
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-700">
              <button 
                onClick={handleCopy}
                className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                  isCopied 
                    ? 'bg-green-600 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isCopied ? <Check size={20} /> : <Copy size={20} />}
                <span>{isCopied ? 'Копирано!' : 'Копирай текста'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};