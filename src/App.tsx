import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Mic, Square, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type ProcessStatus = 'idle' | 'recording' | 'processing' | 'success' | 'error';

interface TranslationResult {
  transcript_source: string;
  transcript_zh: string;
  summary_zh: string;
}

type ThemeConfig = {
  bgGradient: string;
  textColor: string;
  textMuted: string;
  borderColor: string;
  iconColor: string;
  iconBg: string;
  cardBg: string;
  particleShape: string;
  particleColor: string;
  emoji: string;
};

const THEMES: Record<string, ThemeConfig> = {
  '日文': {
    bgGradient: 'from-pink-50 via-rose-50 to-pink-100',
    textColor: 'text-rose-900',
    textMuted: 'text-rose-600/70',
    borderColor: 'border-rose-200',
    iconColor: 'text-pink-500',
    iconBg: 'bg-pink-100',
    cardBg: 'bg-rose-100/60',
    particleShape: 'shape-petal',
    particleColor: 'linear-gradient(135deg, #ffb7c5 0%, #ff8da1 100%)',
    emoji: '🌸',
  },
  '韓文': {
    bgGradient: 'from-blue-50 via-indigo-50 to-blue-100',
    textColor: 'text-indigo-900',
    textMuted: 'text-indigo-600/70',
    borderColor: 'border-indigo-200',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100',
    cardBg: 'bg-indigo-100/60',
    particleShape: 'shape-circle',
    particleColor: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
    emoji: '❄️',
  },
  '越南文': {
    bgGradient: 'from-emerald-50 via-teal-50 to-emerald-100',
    textColor: 'text-teal-900',
    textMuted: 'text-teal-600/70',
    borderColor: 'border-teal-200',
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-100',
    cardBg: 'bg-teal-100/60',
    particleShape: 'shape-leaf',
    particleColor: 'linear-gradient(135deg, #a7f3d0 0%, #34d399 100%)',
    emoji: '🪷',
  },
  '美語': {
    bgGradient: 'from-slate-50 via-blue-50 to-red-50',
    textColor: 'text-slate-900',
    textMuted: 'text-slate-600/70',
    borderColor: 'border-blue-200',
    iconColor: 'text-red-500',
    iconBg: 'bg-blue-100',
    cardBg: 'bg-slate-200/60',
    particleShape: 'shape-star',
    particleColor: 'linear-gradient(135deg, #93c5fd 0%, #fca5a5 100%)',
    emoji: '⭐',
  },
  '西班牙文': {
    bgGradient: 'from-orange-50 via-amber-50 to-orange-100',
    textColor: 'text-orange-900',
    textMuted: 'text-orange-600/70',
    borderColor: 'border-orange-200',
    iconColor: 'text-amber-500',
    iconBg: 'bg-orange-100',
    cardBg: 'bg-orange-100/60',
    particleShape: 'shape-petal',
    particleColor: 'linear-gradient(135deg, #fdba74 0%, #f87171 100%)',
    emoji: '💃',
  },
  '馬來西亞語': {
    bgGradient: 'from-yellow-50 via-red-50 to-yellow-100',
    textColor: 'text-red-900',
    textMuted: 'text-red-600/70',
    borderColor: 'border-red-200',
    iconColor: 'text-yellow-500',
    iconBg: 'bg-red-100',
    cardBg: 'bg-red-100/60',
    particleShape: 'shape-petal',
    particleColor: 'linear-gradient(135deg, #fef08a 0%, #fca5a5 100%)',
    emoji: '🌺',
  },
  '菲律賓語': {
    bgGradient: 'from-sky-50 via-yellow-50 to-sky-100',
    textColor: 'text-sky-900',
    textMuted: 'text-sky-600/70',
    borderColor: 'border-sky-200',
    iconColor: 'text-yellow-500',
    iconBg: 'bg-sky-100',
    cardBg: 'bg-sky-100/60',
    particleShape: 'shape-star',
    particleColor: 'linear-gradient(135deg, #fde047 0%, #7dd3fc 100%)',
    emoji: '☀️',
  },
  '印尼語': {
    bgGradient: 'from-red-50 via-stone-50 to-red-100',
    textColor: 'text-red-950',
    textMuted: 'text-red-700/70',
    borderColor: 'border-red-200',
    iconColor: 'text-red-500',
    iconBg: 'bg-red-100',
    cardBg: 'bg-red-100/60',
    particleShape: 'shape-circle',
    particleColor: 'linear-gradient(135deg, #fca5a5 0%, #ef4444 100%)',
    emoji: '🇮🇩',
  },
  '泰語': {
    bgGradient: 'from-purple-50 via-fuchsia-50 to-purple-100',
    textColor: 'text-purple-900',
    textMuted: 'text-purple-600/70',
    borderColor: 'border-purple-200',
    iconColor: 'text-fuchsia-500',
    iconBg: 'bg-purple-100',
    cardBg: 'bg-purple-100/60',
    particleShape: 'shape-leaf',
    particleColor: 'linear-gradient(135deg, #fde047 0%, #d8b4fe 100%)',
    emoji: '🐘',
  }
};

const ThemeBackground = ({ theme }: { theme: ThemeConfig }) => {
  const [particles, setParticles] = useState<Array<any>>([]);

  useEffect(() => {
    // Generate random particles
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      startX: `${Math.random() * 100}vw`,
      endX: `${Math.random() * 100 - 20}vw`, // Drift slightly left
      rotation: `${Math.random() * 360 + 360}deg`,
      scale: Math.random() * 0.6 + 0.4,
      duration: `${Math.random() * 6 + 6}s`,
      delay: `${Math.random() * 8}s`,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`particle ${theme.particleShape}`}
          style={{
            '--start-x': p.startX,
            '--end-x': p.endX,
            '--rotation': p.rotation,
            '--scale': p.scale,
            background: theme.particleColor,
            animationDuration: p.duration,
            animationDelay: p.delay,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default function App() {
  const [status, setStatus] = useState<ProcessStatus>('idle');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [sourceLanguage, setSourceLanguage] = useState<string>('日文');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          const base64 = base64data.split(',')[1];
          processAudio(base64, audioBlob.type);
        };
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setStatus('recording');
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setStatus('error');
      setErrorMessage('無法存取麥克風，請確認權限設定。');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setStatus('processing');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setStatus('processing');
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      const base64 = base64data.split(',')[1];
      processAudio(base64, file.type);
    };
    reader.onerror = () => {
      setStatus('error');
      setErrorMessage('讀取檔案失敗。');
    };
  };

  const processAudio = async (base64Audio: string, mimeType: string) => {
    try {
      setStatus('processing');
      setErrorMessage('');
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Audio,
                mimeType: mimeType
              }
            },
            {
              text: `請聆聽這段${sourceLanguage}語音。1. 將語音轉錄為${sourceLanguage}逐字稿。2. 將${sourceLanguage}逐字稿翻譯成繁體中文。3. 提供一段繁體中文的重點摘要。請以 JSON 格式回傳。`
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              transcript_source: { type: Type.STRING, description: `${sourceLanguage}逐字稿 (Source transcript)` },
              transcript_zh: { type: Type.STRING, description: "繁體中文翻譯 (Traditional Chinese translation)" },
              summary_zh: { type: Type.STRING, description: "繁體中文重點摘要 (Traditional Chinese summary)" }
            },
            required: ["transcript_source", "transcript_zh", "summary_zh"]
          }
        }
      });
      
      if (response.text) {
        let jsonStr = response.text.trim();
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }
        const parsedResult = JSON.parse(jsonStr) as TranslationResult;
        setResult(parsedResult);
        setStatus('success');
      } else {
        throw new Error("No response text");
      }
      
    } catch (error) {
      console.error('Error processing audio:', error);
      setStatus('error');
      setErrorMessage('AI 處理過程中發生錯誤，請稍後再試。');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const reset = () => {
    setStatus('idle');
    setResult(null);
    setErrorMessage('');
    setRecordingTime(0);
  };

  const currentTheme = THEMES[sourceLanguage] || THEMES['日文'];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bgGradient} ${currentTheme.textColor} font-sans p-6 md:p-12 relative overflow-hidden transition-colors duration-1000`}>
      <ThemeBackground theme={currentTheme} />
      
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        <header className="text-center space-y-4">
          <h1 className={`text-3xl md:text-4xl font-bold tracking-tight ${currentTheme.textColor} drop-shadow-sm transition-colors duration-1000`}>
            語音翻譯與摘要小幫手
          </h1>
          <p className={`${currentTheme.textMuted} max-w-xl mx-auto font-medium transition-colors duration-1000`}>
            選擇語言並上傳音檔或直接錄音，AI 將自動為您轉錄、翻譯成繁體中文，並生成重點摘要。
          </p>
        </header>

        <div className="flex justify-center">
          <div className="bg-white/80 backdrop-blur-md p-2 rounded-xl shadow-sm border border-white/60 inline-flex items-center space-x-3 transition-colors duration-1000">
            <label htmlFor="language-select" className={`${currentTheme.textColor} font-medium pl-2 transition-colors duration-1000`}>來源語言：</label>
            <select
              id="language-select"
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
              disabled={status === 'processing' || status === 'recording'}
              className={`bg-white/50 border ${currentTheme.borderColor} ${currentTheme.textColor} text-sm rounded-lg focus:ring-2 focus:ring-opacity-50 block p-2 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-1000`}
            >
              {Object.keys(THEMES).map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Card */}
          <motion.div 
            whileHover={{ y: -4 }}
            className={`bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl shadow-black/5 border border-white/60 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer hover:${currentTheme.borderColor} transition-colors duration-1000`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className={`w-16 h-16 ${currentTheme.iconBg} ${currentTheme.iconColor} rounded-full flex items-center justify-center mb-2 shadow-inner transition-colors duration-1000`}>
              <Upload size={28} />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${currentTheme.textColor} transition-colors duration-1000`}>上傳音檔</h3>
              <p className={`text-sm ${currentTheme.textMuted} mt-1 transition-colors duration-1000`}>支援 MP3, WAV, M4A 等格式</p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="audio/*" 
              onChange={handleFileUpload}
              disabled={status === 'processing' || status === 'recording'}
            />
          </motion.div>

          {/* Record Card */}
          <motion.div 
            whileHover={status === 'idle' ? { y: -4 } : {}}
            className={`bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl shadow-black/5 border flex flex-col items-center justify-center text-center space-y-4 transition-colors duration-1000 ${
              status === 'recording' ? 'border-red-300 bg-red-50/80' : `border-white/60 hover:${currentTheme.borderColor} cursor-pointer`
            }`}
            onClick={() => {
              if (status === 'idle' || status === 'success' || status === 'error') startRecording();
              else if (status === 'recording') stopRecording();
            }}
          >
            {status === 'recording' ? (
              <>
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-2 animate-pulse shadow-inner transition-colors duration-1000">
                  <Square size={24} fill="currentColor" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-600 transition-colors duration-1000">錄音中...</h3>
                  <p className="text-xl font-mono text-red-500 mt-1 transition-colors duration-1000">{formatTime(recordingTime)}</p>
                </div>
                <p className="text-sm text-red-400 transition-colors duration-1000">點擊停止錄音並開始分析</p>
              </>
            ) : (
              <>
                <div className={`w-16 h-16 ${currentTheme.iconBg} ${currentTheme.iconColor} rounded-full flex items-center justify-center mb-2 shadow-inner transition-colors duration-1000`}>
                  <Mic size={28} />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${currentTheme.textColor} transition-colors duration-1000`}>開始錄音</h3>
                  <p className={`text-sm ${currentTheme.textMuted} mt-1 transition-colors duration-1000`}>直接透過麥克風錄製{sourceLanguage}</p>
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* Status & Results Area */}
        <AnimatePresence mode="wait">
          {status === 'processing' && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 backdrop-blur-md p-12 rounded-2xl shadow-xl shadow-black/5 border border-white/60 flex flex-col items-center justify-center space-y-6 transition-colors duration-1000"
            >
              <Loader2 size={40} className={`${currentTheme.iconColor} animate-spin transition-colors duration-1000`} />
              <div className="text-center">
                <h3 className={`text-lg font-medium ${currentTheme.textColor} transition-colors duration-1000`}>AI 正在處理中...</h3>
                <p className={`${currentTheme.textMuted} mt-2 transition-colors duration-1000`}>這可能需要幾十秒的時間，請稍候。</p>
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50/90 backdrop-blur-md p-6 rounded-2xl border border-red-200 flex items-start space-x-4 shadow-lg shadow-red-100/50 transition-colors duration-1000"
            >
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-medium">發生錯誤</h3>
                <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
                <button 
                  onClick={reset}
                  className="mt-4 px-4 py-2 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors shadow-sm"
                >
                  重試
                </button>
              </div>
            </motion.div>
          )}

          {status === 'success' && result && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-sm transition-colors duration-1000">
                <h2 className={`text-2xl font-semibold flex items-center gap-2 ${currentTheme.textColor} transition-colors duration-1000`}>
                  <CheckCircle2 className={currentTheme.iconColor} />
                  分析結果
                </h2>
                <button 
                  onClick={reset}
                  className={`text-sm ${currentTheme.textColor} hover:opacity-70 font-medium px-4 py-2 rounded-lg ${currentTheme.iconBg} transition-colors duration-1000`}
                >
                  處理新音檔
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Summary Card - Spans full width on mobile, 2 cols on desktop */}
                <div className={`md:col-span-2 ${currentTheme.cardBg} backdrop-blur-md p-6 rounded-2xl border ${currentTheme.borderColor} shadow-lg shadow-black/5 transition-colors duration-1000`}>
                  <h3 className={`text-sm font-bold ${currentTheme.textColor} uppercase tracking-wider mb-3 flex items-center gap-2 transition-colors duration-1000`}>
                    {currentTheme.emoji} AI 重點摘要
                  </h3>
                  <p className={`text-neutral-900 leading-relaxed text-lg font-medium transition-colors duration-1000`}>
                    {result.summary_zh}
                  </p>
                </div>

                {/* Source Transcript */}
                <div className="md:col-span-1 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl shadow-black/5 border border-white/60 transition-colors duration-1000">
                  <h3 className={`text-sm font-bold ${currentTheme.textColor} opacity-70 uppercase tracking-wider mb-3 transition-colors duration-1000`}>{sourceLanguage}逐字稿</h3>
                  <div className="prose prose-sm max-w-none text-neutral-800 whitespace-pre-wrap">
                    {result.transcript_source}
                  </div>
                </div>

                {/* Chinese Translation */}
                <div className="md:col-span-1 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl shadow-black/5 border border-white/60 transition-colors duration-1000">
                  <h3 className={`text-sm font-bold ${currentTheme.textColor} opacity-70 uppercase tracking-wider mb-3 transition-colors duration-1000`}>繁體中文翻譯</h3>
                  <div className="prose prose-sm max-w-none text-neutral-800 whitespace-pre-wrap text-base">
                    {result.transcript_zh}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
