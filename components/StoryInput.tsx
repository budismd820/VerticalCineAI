
import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Wand2, Sparkles, Globe, Clock, Clapperboard, Trash2, Zap, Trees } from 'lucide-react';

// --- KONFIGURASI MENU ---
const LANGUAGES = ['Indonesia', 'English', 'Korean'];

const DURATIONS = [
  { label: '20 Detik (Super Hook / TikTok)', value: '20s' },
  { label: '35 Detik (Storytelling Padat)', value: '35s' },
  { label: '60 Detik (Full Narrative)', value: '60s' },
];

const VISUAL_STYLES = [
  { 
    id: 'rainforest_noir', 
    label: 'Rainforest Noir (Dark & Sad)', 
    prompt: 'Cinematic Rainforest, dark moody atmosphere, thick fog, ancient soldiers, damp environment, sad emotional lighting, muted colors, teal and orange highlights, 8k masterpiece, photorealistic, epic scale, hyper-detailed moss and rain droplets.' 
  },
  { 
    id: 'cinematic', 
    label: 'Cinematic Movie (Netflix Look)', 
    prompt: 'Cinematic Movie Still, Arri Alexa LF, Anamorphic Lens, Professional Film Look, Netflix Aesthetic, Sophisticated Color Grading, High Dynamic Range, Volumetric Lighting, 8K Masterpiece, depth of field.' 
  },
  { 
    id: 'real', 
    label: 'Ultra Realistis HD (Live Action)', 
    prompt: 'Photorealistic 8K, Live Action Movie Still, Hyper-detailed textures, Realistic Skin Pores and Fabrics, Natural Cinematic Lighting, No CGI effect, Shot on iPhone 15 Pro Max 4K, RAW photo, Sharp Focus, authentic atmosphere.' 
  },
  { 
    id: 'anime', 
    label: 'Anime Masterpiece (Shinkai Style)', 
    prompt: 'Anime Masterpiece, Makoto Shinkai Style, CoMix Wave Films aesthetic, highly detailed background art, ethereal lighting, vibrant color palette, emotional atmosphere, 4k hand-drawn style, breathtaking scenery.' 
  },
  { 
    id: 'dark', 
    label: 'Dark / Horror / Mystery', 
    prompt: 'Dark moody atmosphere, thriller cinematic aesthetic, high contrast shadows, film noir influence, volumetric fog, unsettling lighting, eerie textures, grainy film stock look, intense suspenseful visuals.' 
  },
  { 
    id: '3d', 
    label: '3D Animation (Pixar/Disney)', 
    prompt: 'High-end 3D Render, Pixar and Disney Animation Style, Subsurface Scattering, Expressive Character Faces, Soft Cinematic Lighting, Octane Render, 8k Resolution, Vibrant and Clean Textures, Masterpiece 3D Art.' 
  },
  { 
    id: 'claymotion', 
    label: 'Claymotion', 
    prompt: 'Claymation style, stop-motion animation aesthetic, handcrafted clay textures, finger-molded details, Aardman style, playful tactile feel, studio lighting, 8k masterpiece.' 
  },
];

const NARRATOR_STYLES = ['Cinematic Narrator', 'Casual / Teman Curhat', 'Energetic / Hype', 'Horror / Seram', 'Inspirational', 'Poetic / Sad'];
const RATIOS = [
  { label: 'Vertical (9:16) - TikTok/Reels', value: '9:16' },
  { label: 'Horizontal (16:9) - YouTube', value: '16:9' }
];

interface StoryInputProps {
  onGenerate: (data: any) => void;
  isLoading: boolean;
}

const StoryInput: React.FC<StoryInputProps> = ({ onGenerate, isLoading }) => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [duration, setDuration] = useState(DURATIONS[0]); 
  const [selectedStyle, setSelectedStyle] = useState(VISUAL_STYLES[0]);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [narratorStyle, setNarratorStyle] = useState(NARRATOR_STYLES[0]);
  const [ratio, setRatio] = useState(RATIOS[0].value);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length > 3) {
        alert("Maksimal upload 3 referensi saja.");
        return;
      }
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!text) return;
    onGenerate({
      promptText: text,
      duration: duration.value,
      stylePrompt: selectedStyle.prompt,
      language,
      narratorStyle,
      ratio,
      mediaFiles: files
    });
  };

  const selectClass = "w-full p-3 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:ring-2 focus:ring-indigo-600 appearance-none cursor-pointer hover:bg-neutral-800 transition-colors";
  const optionClass = "bg-[#1a1a1a] text-white py-2";

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-6 shadow-2xl border border-neutral-800 max-w-4xl mx-auto relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-purple-600 to-indigo-600 opacity-80"></div>

      <div className="mb-6">
        <label className="flex justify-between text-xs font-bold text-neutral-400 uppercase mb-2 tracking-widest">
           <span>1. Ide Konten / Premis</span>
           <span className="text-red-500 flex items-center gap-1 animate-pulse"><Zap size={12}/> AI Hook Optimizer Active</span>
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tulis ide kontenmu... (Contoh: 'Pasukan Romawi baris di hutan hujan, suasana gelap dan sedih')"
          className="w-full p-4 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-600 focus:ring-2 focus:ring-indigo-600 focus:border-transparent h-32 resize-none transition-all font-medium"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1 flex items-center gap-1">
            <Trees size={10}/> Visual Style
          </label>
          <select value={selectedStyle.id} onChange={(e) => setSelectedStyle(VISUAL_STYLES.find(s => s.id === e.target.value) || VISUAL_STYLES[0])} className={selectClass}>
            {VISUAL_STYLES.map(s => <option key={s.id} value={s.id} className={optionClass}>{s.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1 flex items-center gap-1"><Globe size={10}/> Project Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className={selectClass}>
            {LANGUAGES.map(l => <option key={l} value={l} className={optionClass}>{l}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Narrator Style</label>
          <select value={narratorStyle} onChange={(e) => setNarratorStyle(e.target.value)} className={selectClass}>
            {NARRATOR_STYLES.map(n => <option key={n} value={n} className={optionClass}>{n}</option>)}
          </select>
        </div>

        <div className="lg:col-span-2">
          <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1 flex items-center gap-1 text-red-400">
            <Clock size={10}/> Target Duration
          </label>
          <select value={duration.value} onChange={(e) => setDuration(DURATIONS.find(d => d.value === e.target.value) || DURATIONS[0])} className={`${selectClass} border-red-900/50 bg-red-900/10 text-red-200 font-bold`}>
            {DURATIONS.map(d => <option key={d.value} value={d.value} className={optionClass}>{d.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Ratio</label>
          <select value={ratio} onChange={(e) => setRatio(e.target.value)} className={selectClass}>
            {RATIOS.map(r => <option key={r.value} value={r.value} className={optionClass}>{r.label}</option>)}
          </select>
        </div>
        
        <div className="lg:col-span-3">
           <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Referensi Visual (Max 3 Foto)</label>
           <div className="flex gap-3 flex-wrap">
             {files.length < 3 && (
               <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-neutral-700 rounded-lg p-3 flex items-center justify-center cursor-pointer hover:bg-neutral-800 hover:border-indigo-500/50 transition-all group/upload flex-1 min-w-[150px]">
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" multiple onChange={handleFileChange} />
                  <span className="text-xs text-neutral-500 flex gap-2 items-center group-hover/upload:text-indigo-400">
                    <Upload size={14} /> Upload Reference
                  </span>
               </div>
             )}
             {files.map((f, i) => (
                <div key={i} className="bg-neutral-800 border border-neutral-700 rounded-lg p-2 flex items-center gap-2 pr-3 animate-fade-in">
                   <div className="w-8 h-8 bg-neutral-900 rounded flex items-center justify-center text-indigo-500">
                      <ImageIcon size={14}/>
                   </div>
                   <span className="text-[10px] text-gray-300 truncate max-w-[80px]">{f.name}</span>
                   <button onClick={() => removeFile(i)} className="text-neutral-500 hover:text-red-400"><Trash2 size={12}/></button>
                </div>
             ))}
           </div>
        </div>
      </div>

      <button onClick={handleSubmit} disabled={isLoading || !text} className="w-full bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30 active:scale-[0.99]">
        {isLoading ? <span className="animate-pulse">Analyzing Cinematography...</span> : <><Wand2 size={20} /> GENERATE STORYBOARD</>}
      </button>
    </div>
  );
};

export default StoryInput;
