
import React, { useState, useCallback, useRef } from 'react';
import { generateSpeech } from './services/geminiService';
import { playAudio, createWavBlob, decodeBase64 } from './utils/audioUtils';
import { VOICE_OPTIONS, EMOTION_OPTIONS, VIBE_OPTIONS } from './constants';
import type { VoiceOption, StyleOption } from './types';
import { Header } from './components/Header';
import { Button } from './components/Button';
import { Spinner } from './components/Spinner';
import { DownloadIcon, PlayIcon, SparklesIcon } from './components/IconComponents';

const App: React.FC = () => {
  const [text, setText] = useState<string>('नमस्ते दुनिया! आज का दिन बहुत अच्छा है। How are you doing?');
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [selectedVoice, setSelectedVoice] = useState<string>(VOICE_OPTIONS[0].value);
  const [selectedEmotion, setSelectedEmotion] = useState<string>(EMOTION_OPTIONS[0].value);
  const [selectedVibe, setSelectedVibe] = useState<string>(VIBE_OPTIONS[0].value);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewLoadingVoice, setPreviewLoadingVoice] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const stopCurrentAudio = () => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch (e) {
        // Ignore errors if the source has already stopped
      }
      currentSourceRef.current = null;
    }
  };

  const playGeneratedAudio = useCallback(async (base64: string) => {
    stopCurrentAudio();
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    try {
      const source = await playAudio(base64, audioContextRef.current);
      currentSourceRef.current = source;
      source.onended = () => {
        if (currentSourceRef.current === source) {
          currentSourceRef.current = null;
        }
      };
    } catch (e) {
      console.error('Error playing audio:', e);
      setError('Failed to play audio.');
    }
  }, []);
  
  const handlePreviewVoice = useCallback(async (voice: VoiceOption) => {
    setPreviewLoadingVoice(voice.value);
    setError(null);
    try {
      const base64Audio = await generateSpeech(voice.previewText, 'Speak in a clear, neutral voice', voice.value);
      await playGeneratedAudio(base64Audio);
    } catch (e) {
      console.error('Error generating preview audio:', e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred during preview.');
    } finally {
      setPreviewLoadingVoice(null);
    }
  }, [playGeneratedAudio]);

  const constructStylePrompt = useCallback(() => {
    const parts: string[] = [];
    if (selectedEmotion) parts.push(selectedEmotion);
    if (selectedVibe) parts.push(selectedVibe);
    if (customInstructions) parts.push(customInstructions);

    if (parts.length === 0) {
      return 'Speak in a clear, friendly, and confident male voice';
    }
    return `Speak in a ${parts.join(', ')} voice`;
  }, [selectedEmotion, selectedVibe, customInstructions]);

  const handleGenerateAudio = useCallback(async () => {
    if (!text) {
      setError('Please enter some text to generate audio.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAudioData(null);
    
    const finalStylePrompt = constructStylePrompt();

    try {
      const base64Audio = await generateSpeech(text, finalStylePrompt, selectedVoice);
      setAudioData(base64Audio);
      await playGeneratedAudio(base64Audio);
    } catch (e) {
      console.error('Error generating audio:', e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [text, constructStylePrompt, selectedVoice, playGeneratedAudio]);

  const handleDownload = useCallback(() => {
    if (!audioData) return;

    try {
      const rawData = decodeBase64(audioData);
      const blob = createWavBlob(rawData);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'generated_audio.wav';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error creating download link:', e);
      setError('Failed to create audio file for download.');
    }
  }, [audioData]);
  
  const handlePreview = useCallback(async () => {
    if (!audioData) return;
    await playGeneratedAudio(audioData);
  }, [audioData, playGeneratedAudio]);
  
  const selectClasses = "w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none bg-no-repeat bg-right pr-8";
  const selectBgImage = {
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
      backgroundPosition: 'right 0.5rem center',
      backgroundSize: '1.5em 1.5em'
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-3xl">
        <Header />
        <main className="mt-8 p-6 sm:p-8 bg-gray-800/50 rounded-2xl shadow-2xl border border-gray-700 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                  <label htmlFor="emotion" className="block text-sm font-medium text-gray-300 mb-2">Emotion</label>
                  <select id="emotion" value={selectedEmotion} onChange={(e) => setSelectedEmotion(e.target.value)} className={selectClasses} style={selectBgImage}>
                    {EMOTION_OPTIONS.map((option: StyleOption) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="vibe" className="block text-sm font-medium text-gray-300 mb-2">Vibe / Style</label>
                  <select id="vibe" value={selectedVibe} onChange={(e) => setSelectedVibe(e.target.value)} className={selectClasses} style={selectBgImage}>
                    {VIBE_OPTIONS.map((option: StyleOption) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </div>
            </div>
          
            <div>
              <label htmlFor="style" className="block text-sm font-medium text-gray-300 mb-2">
                Additional Instructions
              </label>
              <input
                id="style"
                type="text"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g., with a slight echo"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-300 mb-2">
                Text to Convert (Hindi, English, or Hinglish)
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                placeholder="Enter your text here..."
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Select Voice</label>
              <div className="space-y-2">
                {VOICE_OPTIONS.map((option: VoiceOption) => (
                  <div
                    key={option.value}
                    onClick={() => setSelectedVoice(option.value)}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${selectedVoice === option.value ? 'bg-indigo-900/50 border-indigo-500' : 'bg-gray-900/50 border-gray-700 hover:border-gray-500'}`}
                  >
                    <div className="flex items-center">
                       <div className={`w-4 h-4 rounded-full border-2 mr-4 flex-shrink-0 ${selectedVoice === option.value ? 'bg-indigo-500 border-indigo-400' : 'border-gray-500'}`}></div>
                       <span className="font-medium">{option.label}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePreviewVoice(option); }}
                      disabled={previewLoadingVoice === option.value}
                      className="p-2 rounded-full text-gray-300 hover:bg-gray-700 disabled:text-gray-500 disabled:cursor-wait transition-colors"
                      aria-label={`Preview ${option.label}`}
                    >
                      {previewLoadingVoice === option.value ? <Spinner /> : <PlayIcon />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {error && <div className="mt-6 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">{error}</div>}

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button onClick={handleGenerateAudio} disabled={isLoading} className="w-full sm:w-auto flex-grow">
              {isLoading ? <Spinner /> : <SparklesIcon />}
              {isLoading ? 'Generating...' : 'Generate Audio'}
            </Button>
            {audioData && !isLoading && (
              <>
                 <Button onClick={handlePreview} variant="secondary" className="w-full sm:w-auto">
                    <PlayIcon />
                    Preview
                 </Button>
                <Button onClick={handleDownload} variant="secondary" className="w-full sm:w-auto">
                    <DownloadIcon />
                    Download (.wav)
                </Button>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
