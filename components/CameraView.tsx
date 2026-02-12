import React, { useRef, useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Loader2, RefreshCw, AlertCircle, Settings } from 'lucide-react';

interface CameraViewProps {
  onCapture: (imageData: string) => void;
  isProcessing: boolean;
  greeting: string;
  onChangeName: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, isProcessing, greeting, onChangeName }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const initCamera = async () => {
      try {
        setError(null);
        
        // Try environment camera first
        try {
          currentStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false,
          });
        } catch (envError) {
          console.warn("Environment camera not found, trying fallback...", envError);
          // Fallback to any camera
          currentStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        setStream(currentStream);
        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
        }
      } catch (err: any) {
        console.error("Error accessing camera:", err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError("Отказан достъп до камерата. Моля, разреши достъпа или използвай бутона за качване.");
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
           setError("Не е намерена камера. Моля, използвай галерията.");
        } else {
          setError("Грешка при достъп до камерата. Провери настройките или качи файл.");
        }
      }
    };

    initCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64, remove prefix
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64Data = dataUrl.split(',')[1];
        onCapture(base64Data);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        onCapture(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetry = () => {
    window.location.reload(); // Simple retry by reload for permissions
  };

  return (
    <div className="flex flex-col h-full bg-black relative animate-in fade-in slide-in-from-right duration-700 ease-out">
      {/* Greeting Header Overlay */}
      <div className="absolute top-0 left-0 w-full z-10 p-6 pt-8 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
        <div className="flex justify-between items-start pointer-events-auto">
          <h2 className="text-white text-2xl font-bold drop-shadow-md animate-in slide-in-from-top-4 duration-700 delay-200 fill-mode-both">
            {greeting}
          </h2>
          <button 
            onClick={onChangeName}
            className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
            title="Промени името"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Camera Preview */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-slate-900">
        {error ? (
          <div className="text-white text-center p-8 max-w-sm mx-auto flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Грешка с камерата</h3>
            <p className="text-slate-400 mb-6 text-sm leading-relaxed">{error}</p>
            
            <button 
              onClick={handleRetry}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-full font-medium transition-colors mb-8"
            >
              <RefreshCw size={18} />
              Опитай пак
            </button>

            <div className="w-full border-t border-white/10 pt-6">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-4">Или използвай галерия</p>
              <label className="flex items-center justify-center gap-2 w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl cursor-pointer transition-colors border border-white/5">
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isProcessing} />
                <ImageIcon size={20} />
                <span>Качи снимка</span>
              </label>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute min-w-full min-h-full object-cover"
          />
        )}
        
        {/* Detection Box Overlay */}
        {!error && !isProcessing && stream && (
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-1/3 border-2 border-indigo-400 rounded-lg shadow-[0_0_2000px_0_rgba(0,0,0,0.5)] transition-all duration-500 ease-out animate-in fade-in zoom-in-95 delay-500 fill-mode-both">
             <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white -mt-1 -ml-1"></div>
             <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white -mt-1 -mr-1"></div>
             <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white -mb-1 -ml-1"></div>
             <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white -mb-1 -mr-1"></div>
             <p className="text-white/80 text-xs text-center mt-2 font-medium bg-black/50 py-1 px-3 rounded-full absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap backdrop-blur-sm">
               Позиционирай задачата тук
             </p>
           </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 backdrop-blur-sm animate-in fade-in duration-200">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <p className="text-white font-medium text-lg">Анализиране...</p>
            <p className="text-white/50 text-sm mt-2">Моля, изчакай малко</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className={`bg-white p-6 rounded-t-3xl shadow-lg pb-10 transition-transform duration-300 ${error ? 'translate-y-full absolute bottom-0 w-full' : ''}`}>
        <div className="flex justify-between items-center px-8">
           {/* Gallery Upload */}
           <label className="flex flex-col items-center gap-1 cursor-pointer group">
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isProcessing} />
            <div className="p-3 bg-slate-100 rounded-full text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <ImageIcon size={24} />
            </div>
            <span className="text-xs text-slate-500 group-hover:text-indigo-600 transition-colors">Галерия</span>
          </label>

          {/* Shutter Button */}
          <button
            onClick={handleCapture}
            disabled={isProcessing || !!error || !stream}
            className="w-16 h-16 rounded-full bg-indigo-600 border-4 border-indigo-200 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            <Camera size={32} className="text-white" />
          </button>

          {/* Placeholder/History */}
          <div className="w-12 flex flex-col items-center justify-center opacity-0 pointer-events-none">
             {/* Invisible spacer for symmetry */}
             <div className="p-3"></div>
             <span className="text-xs">History</span>
          </div>
        </div>
      </div>

      {/* Hidden Canvas for Capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};