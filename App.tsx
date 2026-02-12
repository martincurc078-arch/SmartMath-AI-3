import React, { useState, useEffect } from 'react';
import { CameraView } from './components/CameraView';
import { SolutionView } from './components/SolutionView';
import { TutorChat } from './components/TutorChat';
import { OnboardingView } from './components/OnboardingView';
import { AppView, MathSolution } from './types';
import { solveMathProblemFromImage } from './services/geminiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.ONBOARDING);
  const [isProcessing, setIsProcessing] = useState(false);
  const [solution, setSolution] = useState<MathSolution | null>(null);
  const [nickname, setNickname] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check storage on mount for nickname and theme preference
  useEffect(() => {
    const storedName = localStorage.getItem('smartmath_nickname');
    if (storedName) {
      setNickname(storedName);
      setCurrentView(AppView.CAMERA);
    } else {
      setCurrentView(AppView.ONBOARDING);
    }

    // Check system preference or saved theme could go here
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return `Добро утро, ${nickname} ☀️`;
    if (hour >= 12 && hour < 18) return `Здрасти, ${nickname} 👋`;
    if (hour >= 18 && hour < 23) return `Добър вечер, ${nickname} 🌙`;
    return `Още си буден, ${nickname}? 👀`;
  };

  const handleOnboardingComplete = (name: string) => {
    localStorage.setItem('smartmath_nickname', name);
    setNickname(name);
    setCurrentView(AppView.CAMERA);
  };

  const handleChangeName = () => {
    setCurrentView(AppView.ONBOARDING);
  };

  const handleImageCapture = async (base64Image: string) => {
    setIsProcessing(true);
    try {
      const result = await solveMathProblemFromImage(base64Image);
      setSolution(result);
      setCurrentView(AppView.SOLUTION);
    } catch (error) {
      console.error("Failed to solve problem:", error);
      alert("Опа! Не можахме да разпознаем задачата. Моля, опитай отново.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToCamera = () => {
    setCurrentView(AppView.CAMERA);
    setSolution(null);
  };

  const handleBackToSolution = () => {
    setCurrentView(AppView.SOLUTION);
  };

  const handleOpenTutor = () => {
    setCurrentView(AppView.TUTOR);
  };

  return (
    <div className="w-full h-screen max-w-md mx-auto bg-white dark:bg-slate-900 overflow-hidden shadow-2xl relative transition-colors duration-300">
      {/* Mobile Frame Simulation on Desktop */}
      <div className="absolute inset-0 z-0 bg-slate-100 dark:bg-slate-800 md:hidden"></div>
      
      <main className="h-full w-full relative z-10 flex flex-col">
        {currentView === AppView.ONBOARDING && (
          <OnboardingView onComplete={handleOnboardingComplete} />
        )}

        {currentView === AppView.CAMERA && (
          <CameraView 
            onCapture={handleImageCapture} 
            isProcessing={isProcessing} 
            greeting={getGreeting()}
            onChangeName={handleChangeName}
          />
        )}

        {currentView === AppView.SOLUTION && solution && (
          <SolutionView 
            solution={solution} 
            onBack={handleBackToCamera} 
            onOpenTutor={handleOpenTutor}
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
          />
        )}

        {currentView === AppView.TUTOR && solution && (
          <TutorChat 
            onBack={handleBackToSolution}
            solutionContext={solution}
          />
        )}
      </main>
    </div>
  );
};

export default App;