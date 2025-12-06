import React, { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { ImageUpload } from './components/ImageUpload';
import { Button } from './components/Button';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { analyzeImage } from './services/geminiService';
import { AppStatus, ImageState } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [imageState, setImageState] = useState<ImageState>({
    file: null,
    previewUrl: null,
    base64: null,
  });
  const [prompt, setPrompt] = useState<string>('Identify what is in this image and describe it in detail, covering visual elements, style, and context.');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = useCallback((file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setImageState({
      file,
      previewUrl: objectUrl,
      base64: null, // Base64 is generated on demand in service
    });
    setStatus(AppStatus.IDLE);
    setResult('');
    setError(null);
  }, []);

  const handleClearImage = useCallback(() => {
    if (imageState.previewUrl) {
      URL.revokeObjectURL(imageState.previewUrl);
    }
    setImageState({ file: null, previewUrl: null, base64: null });
    setStatus(AppStatus.IDLE);
    setResult('');
    setError(null);
  }, [imageState.previewUrl]);

  const handleAnalyze = async () => {
    if (!imageState.file) return;

    setStatus(AppStatus.ANALYZING);
    setError(null);
    setResult('');

    try {
      const analysisText = await analyzeImage(imageState.file, prompt);
      setResult(analysisText);
      setStatus(AppStatus.SUCCESS);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
      setStatus(AppStatus.ERROR);
    }
  };

  const isAnalyzing = status === AppStatus.ANALYZING;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 selection:bg-brand-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Gemini Vision
            </h1>
          </div>
          <div className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
            gemini-3-pro-preview
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start h-full">
          
          {/* Left Column: Input & Preview */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="bg-slate-900/50 p-1 rounded-2xl border border-slate-800 shadow-xl">
              <ImageUpload 
                previewUrl={imageState.previewUrl}
                onImageSelected={handleImageSelected}
                onClear={handleClearImage}
                disabled={isAnalyzing}
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="prompt" className="block text-sm font-medium text-slate-400 ml-1">
                Prompt / Instruction
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isAnalyzing}
                rows={3}
                className="w-full bg-slate-800 border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-brand-500 focus:border-brand-500 block p-4 transition-all resize-none shadow-sm"
                placeholder="Ask something about the image..."
              />
            </div>

            <Button 
              onClick={handleAnalyze} 
              disabled={!imageState.file || isAnalyzing}
              isLoading={isAnalyzing}
              className="w-full h-12 text-lg shadow-brand-500/20"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                </svg>
              }
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
            </Button>
            
            {error && (
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-900/50 text-red-200 text-sm flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {error}
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-xl font-semibold text-white">Analysis Result</h2>
              {status === AppStatus.SUCCESS && (
                <span className="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
                  Completed
                </span>
              )}
            </div>

            <div className={`flex-1 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl transition-all duration-500 ${status === AppStatus.ANALYZING ? 'animate-pulse' : ''}`}>
               {status === AppStatus.IDLE && !result && (
                 <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 py-20">
                   <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-2">
                     <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                     </svg>
                   </div>
                   <p className="text-center">Upload an image and click analyze<br/>to see the results here.</p>
                 </div>
               )}

               {status === AppStatus.ANALYZING && (
                 <div className="space-y-4 py-8">
                   <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                   <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                   <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                   <div className="space-y-2 pt-4">
                     <div className="h-4 bg-slate-800 rounded w-full"></div>
                     <div className="h-4 bg-slate-800 rounded w-full"></div>
                     <div className="h-4 bg-slate-800 rounded w-2/3"></div>
                   </div>
                 </div>
               )}

               {result && (
                 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <MarkdownRenderer content={result} />
                 </div>
               )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
