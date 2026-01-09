
import React, { useState, useEffect } from 'react';
import { Film, AlertCircle, Trash2, Printer, Wand2, Sparkles, LayoutPanelLeft, Quote, ScrollText, Loader2, ShieldAlert, Key, Clock9 } from 'lucide-react';
import StoryInput from './components/StoryInput';
import { ShotCard } from './components/ShotCard';
import { generateStoryboardFromStory, StoryParams } from './services/geminiService';
import { Shot } from './types';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [shots, setShots] = useState<Shot[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [fullNarrative, setFullNarrative] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("verticalcine_v4_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setShots(parsed.shots || []);
        setSummary(parsed.summary || null);
        setFullNarrative(parsed.fullNarrative || null);
      } catch (e) {
        console.error("Failed to load saved project", e);
      }
    }
  }, []);

  useEffect(() => {
    if (shots.length > 0 || summary || fullNarrative) {
      localStorage.setItem("verticalcine_v4_data", JSON.stringify({ shots, summary, fullNarrative }));
    }
  }, [shots, summary, fullNarrative]);

  useEffect(() => {
    let interval: any;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 30) return prev + 1;
          if (prev < 70) return prev + 0.5;
          if (prev < 95) return prev + 0.2;
          return prev;
        });
      }, 200);
    } else {
      setProgress(100);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleReset = () => {
    if (window.confirm("Hapus project ini?")) {
      setShots([]);
      setSummary(null);
      setFullNarrative(null);
      localStorage.removeItem("verticalcine_v4_data");
      window.location.reload();
    }
  };

  const handleGenerate = async (inputData: StoryParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await generateStoryboardFromStory(inputData);
      setShots(response.shots || []);
      setSummary(response.summary || null);
      setFullNarrative(response.full_narrative || null);
    } catch (err: any) {
      console.error("App Error:", err);
      setError(err.message || "Unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const isApiKeyError = error?.includes("API_KEY_MISSING");
  const isQuotaError = error?.includes("QUOTA_EXCEEDED");

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30 selection:text-indigo-200 pb-32">
      
      {/* HEADER */}
      <nav className="bg-black/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 shadow-2xl no-print">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-2.5 rounded-xl shadow-lg shadow-indigo-600/20">
              <Film className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black italic tracking-tighter text-white">
                VERTICAL<span className="text-indigo-500">CINE</span>
              </h1>
              <div className="flex items-center gap-1.5 -mt-1">
                 <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">PRO CONSISTENCY ENGINE v4.5</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
             {shots.length > 0 && (
                <>
                  <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-xl text-xs font-black border border-white/5 transition-all">
                    <Printer size={14}/> PRINT DOC
                  </button>
                  <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-red-950/20 hover:bg-red-950/40 text-red-500 rounded-xl text-xs font-black border border-red-900/30 transition-all">
                    <Trash2 size={14}/> TRASH
                  </button>
                </>
             )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        
        {/* LIGHT EFFECTS */}
        <div className="fixed inset-0 z-0 pointer-events-none no-print">
           <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/5 rounded-full blur-[160px]"></div>
           <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/5 rounded-full blur-[160px]"></div>
        </div>

        <div className="mb-20 relative z-10 no-print">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3 text-indigo-400 text-sm font-black uppercase tracking-widest">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />} 
                {loading ? "AI is deep-analyzing consistency & narrative..." : "Project Blueprint"}
             </div>
             {loading && (
                <div className="flex items-center gap-4">
                   <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                   </div>
                   <span className="text-xs font-mono font-bold text-indigo-400 tracking-tighter">{Math.floor(progress)}%</span>
                </div>
             )}
          </div>
          <StoryInput onGenerate={handleGenerate} isLoading={loading} />
        </div>

        {error && (
          <div className={`p-6 rounded-2xl mb-12 flex flex-col md:flex-row items-center gap-6 border relative z-10 animate-shake shadow-2xl transition-colors ${isApiKeyError ? 'bg-orange-950/30 border-orange-500/50 text-orange-400' : isQuotaError ? 'bg-amber-950/30 border-amber-500/50 text-amber-400' : 'bg-red-950/30 border-red-900/50 text-red-400'}`}>
            {isApiKeyError ? <Key size={48} className="opacity-50" /> : isQuotaError ? <Clock9 size={48} className="opacity-50" /> : <ShieldAlert size={48} className="opacity-50" />}
            <div className="flex-1">
              <p className="font-black text-sm uppercase tracking-widest mb-1">
                {isApiKeyError ? "Deployment Error" : isQuotaError ? "AI Quota Exhausted" : "Production Error"}
              </p>
              <p className="text-sm font-medium opacity-90">{error}</p>
              
              {isApiKeyError && (
                <div className="mt-4 p-4 bg-black/40 rounded-xl border border-white/5 text-xs text-neutral-300 leading-relaxed">
                  <p className="font-bold text-white mb-2 underline">Cara Fix Environment Variable:</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Buka <b>Vercel Settings</b> {" > "} <b>Environment Variables</b>.</li>
                    <li>Tambah <b>Key:</b> <code className="bg-neutral-800 px-1 rounded text-orange-300">API_KEY</code></li>
                    <li>Tambah <b>Value:</b> <code className="bg-neutral-800 px-1 rounded text-orange-300 italic">TEMPEL_KEY_ANDA_DISINI</code></li>
                    <li>Lakukan <b>Redeploy</b> project Anda agar perubahan tersimpan.</li>
                  </ol>
                </div>
              )}

              {isQuotaError && (
                <div className="mt-4 text-xs opacity-70 italic">
                  * Tip: Akun Gemini Free Tier memiliki batas limit per menit/hari. Tunggu 60 detik sebelum mencoba lagi, atau gunakan API Key berbayar untuk akses tanpa batas.
                </div>
              )}
            </div>
          </div>
        )}

        {(summary || fullNarrative || shots.length > 0) && (
          <div className="animate-fade-in-up relative z-10 space-y-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
               {summary && (
                  <section className="relative overflow-hidden group h-full">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-10"></div>
                    <div className="relative bg-neutral-900/80 backdrop-blur-md border border-white/5 p-8 rounded-3xl h-full flex flex-col">
                      <div className="flex items-center gap-3 mb-6">
                         <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                            <Quote size={18} fill="currentColor" />
                         </div>
                         <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Director's Treatment</h3>
                      </div>
                      <p className="text-xl font-black italic leading-relaxed text-white/90">
                        "{summary}"
                      </p>
                    </div>
                  </section>
               )}
               {fullNarrative && (
                  <section className="relative overflow-hidden group h-full">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-3xl blur opacity-10"></div>
                    <div className="relative bg-neutral-900/80 backdrop-blur-md border border-white/5 p-8 rounded-3xl h-full flex flex-col">
                      <div className="flex items-center gap-3 mb-6">
                         <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                            <ScrollText size={18} />
                         </div>
                         <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Full Production Script</h3>
                      </div>
                      <div className="bg-black/30 p-6 rounded-2xl border border-white/5 flex-grow">
                         <p className="text-sm font-bold text-neutral-300 leading-[1.8] font-mono whitespace-pre-wrap">
                            {fullNarrative}
                         </p>
                      </div>
                    </div>
                  </section>
               )}
            </div>

            {shots.length > 0 && (
              <section>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-white/5">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <LayoutPanelLeft className="text-indigo-500 w-5 h-5" />
                       <h2 className="text-4xl font-black italic text-white tracking-tighter uppercase">
                         Sequence Breakdown
                       </h2>
                    </div>
                    <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em]">High-Consistency Technical Directive</p>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="bg-indigo-500/10 text-indigo-400 px-6 py-3 rounded-2xl text-xs font-black border border-indigo-500/20 shadow-xl flex items-center gap-3">
                       <Sparkles size={14} />
                       {shots.length} MASTER SHOTS
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 print:grid-cols-2">
                  {shots.map((shot) => (
                    <div key={shot.shot_number} className="h-full break-inside-avoid animate-card-in" style={{ animationDelay: `${shot.shot_number * 0.1}s` }}>
                       <ShotCard shot={shot} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes card-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-card-in {
          animation: card-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        @media print {
          .no-print { display: none !important; }
          body { background-color: white !important; color: black !important; }
          main { padding: 0 !important; max-width: 100% !important; }
          .break-inside-avoid { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
};

export default App;
