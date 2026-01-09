import React, { useState } from 'react';
import { Camera, Music, Copy, Check, Hash } from 'lucide-react';
import { Shot } from '../types';

interface ShotCardProps {
  shot: Shot;
}

export const ShotCard: React.FC<ShotCardProps> = ({ shot }) => {
  const [isCopied, setIsCopied] = useState(false);
  
  const isVoiceOver = shot.audio_data.mode.toLowerCase().includes('voiceover');
  const isAmbience = shot.audio_data.mode.toLowerCase().includes('ambience');
  
  let badgeColor = 'bg-indigo-600';
  let badgeText = 'DIALOGUE';
  if (isVoiceOver) {
    badgeColor = 'bg-pink-600';
    badgeText = 'VOICEOVER';
  } else if (isAmbience) {
    badgeColor = 'bg-emerald-600';
    badgeText = 'AMBIENCE';
  }

  const handleCopyPrompt = () => {
    const textToCopy = `${shot.visual_prompt} --ar 9:16 --v 6.0`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl h-full group hover:border-indigo-500/50 transition-all duration-300">
      
      {/* HEADER: Visual Info */}
      <div className="relative p-6 bg-gradient-to-br from-neutral-800 to-neutral-900 border-b border-neutral-800">
        <div className="flex justify-between items-start mb-4">
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Shot</span>
              <span className="text-4xl font-black italic text-white leading-none">#{shot.shot_number}</span>
           </div>
           <div className="bg-white/5 backdrop-blur px-3 py-1 rounded-full border border-white/10 text-[10px] font-mono font-bold text-neutral-400">
             {shot.timing_sec}
           </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-neutral-300 uppercase tracking-wide bg-black/30 w-fit px-3 py-1.5 rounded-lg border border-white/5">
           <Camera size={14} className="text-indigo-500" />
           {shot.camera_angle}
        </div>
      </div>

      {/* BODY: Production Data */}
      <div className="p-6 flex flex-col gap-6 flex-grow">
        
        {/* Visual Direction */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                <Hash size={12}/> Visual Directions
            </h4>
            <button 
              onClick={handleCopyPrompt}
              className={`flex items-center gap-1.5 text-[9px] font-bold px-3 py-1 rounded-full transition-all border ${
                isCopied ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white hover:bg-neutral-700'
              }`}
            >
              {isCopied ? <Check size={10}/> : <Copy size={10}/>}
              {isCopied ? "COPIED" : "MIDJOURNEY PROMPT"}
            </button>
          </div>
          <div className="bg-black/20 p-4 rounded-xl border border-neutral-800 group-hover:bg-black/40 transition-colors">
            <p className="text-sm font-medium text-neutral-200 leading-relaxed italic">
              {shot.visual_prompt}
            </p>
          </div>
        </div>

        {/* Audio/Script Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className={`text-[9px] px-2.5 py-1 rounded-full font-black text-white tracking-widest ${badgeColor}`}>
              {badgeText}
            </span>
          </div>

          {shot.audio_data.transcript && (
            <div className={`relative p-4 rounded-xl border-l-4 ${isVoiceOver ? 'bg-pink-900/10 border-pink-500' : 'bg-indigo-900/10 border-indigo-500'}`}>
              <p className="text-base font-bold text-gray-100 leading-snug">
                "{shot.audio_data.transcript}"
              </p>
            </div>
          )}
          
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-800/50 border border-neutral-800 text-[11px] text-neutral-400 font-medium">
             <Music size={14} className="mt-0.5 text-neutral-600" />
             <span className="italic leading-relaxed">SFX: {shot.audio_data.sfx_ambience}</span>
          </div>
        </div>

        {/* Technical Analysis */}
        {shot.audio_data.production_analysis && (
          <div className="mt-auto grid grid-cols-1 gap-2">
             <div className="flex flex-col gap-2 p-3 rounded-xl bg-neutral-950/50 border border-neutral-800">
                {shot.audio_data.production_analysis.intonation && (
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-neutral-500 font-bold uppercase tracking-tighter">Direction</span>
                    <span className="text-indigo-400 font-black">{shot.audio_data.production_analysis.intonation}</span>
                  </div>
                )}
                {shot.audio_data.production_analysis.gesture && (
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-neutral-500 font-bold uppercase tracking-tighter">Action</span>
                    <span className="text-gray-300 font-black">{shot.audio_data.production_analysis.gesture}</span>
                  </div>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};