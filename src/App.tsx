import React, { useState, useEffect, useRef } from 'react';
import SnakeGame from './components/SnakeGame';

const TRACKS = [
  { id: 1, title: 'Neon Grid (AI Generated)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'Cyber Pulse (AI Generated)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'Synthwave Dream (AI Generated)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
];

export default function App() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  // Audio Playback
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Autoplay prevented", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const skipForward = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };
  
  const skipBackward = () => {
    setCurrentTrackIndex((prev) => (prev === 0 ? TRACKS.length - 1 : prev - 1));
    setIsPlaying(true);
  };

  const currentTrack = TRACKS[currentTrackIndex];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans relative overflow-hidden">
      <header className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 shrink-0">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-[0.3em] neon-text-cyan opacity-80 mb-1">SYSTEM VERSION 4.2.0</span>
          <h1 className="text-5xl sm:text-7xl display-font italic">NEON<br/><span className="neon-text-magenta">RHYTHM</span></h1>
        </div>
        <div className="flex gap-4 sm:gap-8 items-end pb-2">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest opacity-50">Current Score</p>
            <p className="text-3xl sm:text-4xl font-black neon-text-cyan">{score.toString().padStart(5, '0')}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest opacity-50">High Score</p>
            <p className="text-3xl sm:text-4xl font-black text-white/40">{highScore.toString().padStart(5, '0')}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row p-4 sm:p-6 gap-6 min-h-0 overflow-y-auto lg:overflow-hidden">
        <div className="w-full lg:w-1/3 flex flex-col gap-4 shrink-0">
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex-1 flex flex-col min-h-[300px]">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-6 opacity-60">Audio Matrix</h2>
            <div className="space-y-4 flex-1">
              {TRACKS.map((track, index) => {
                const isActive = index === currentTrackIndex;
                return (
                  <div 
                    key={track.id}
                    onClick={() => {
                      setCurrentTrackIndex(index);
                      setIsPlaying(true);
                    }}
                    className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all ${
                      isActive ? 'bg-white/10 border border-white/20' : 'opacity-40 hover:opacity-100'
                    }`}
                  >
                    {isActive ? (
                      <div className="w-10 h-10 bg-cyan-500 rounded flex items-center justify-center shrink-0">
                        <div className={`w-1 h-4 bg-black/50 mx-0.5 ${isPlaying ? 'animate-pulse' : ''}`}></div>
                        <div className={`w-1 h-6 bg-black/50 mx-0.5 ${isPlaying ? 'animate-[pulse_0.75s_infinite]' : ''}`}></div>
                        <div className={`w-1 h-3 bg-black/50 mx-0.5 ${isPlaying ? 'animate-[pulse_1.2s_infinite]' : ''}`}></div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-white/10 rounded shrink-0"></div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{track.title}</p>
                      <p className="text-[10px] opacity-50 truncate">AI_GEN_SYNTH_0{index + 1}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-4">
                <button onClick={skipBackward} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                  ⏮
                </button>
                <button onClick={togglePlay} className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center font-bold hover:bg-gray-200 transition-colors text-xs">
                  {isPlaying ? 'PAUSE' : 'PLAY'}
                </button>
                <button onClick={skipForward} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                  ⏭
                </button>
              </div>
              <div className="text-right">
                <p className="text-[10px] opacity-50 mb-1">VOLUME</p>
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={isMuted ? 0 : volume} 
                    onChange={(e) => {
                        setVolume(parseFloat(e.target.value));
                        if (parseFloat(e.target.value) > 0) setIsMuted(false);
                    }}
                    className="w-20 sm:w-24 accent-cyan-400 h-1 bg-white/20 rounded appearance-none cursor-pointer"
                />
              </div>
            </div>
            <div className="h-1 w-full bg-white/10 mt-6 relative cursor-pointer" onClick={(e) => {
              if (audioRef.current) {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                audioRef.current.currentTime = pos * audioRef.current.duration;
              }
            }}>
              <div className="absolute top-0 left-0 h-full bg-[#ff00ff] pointer-events-none transition-all duration-100" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-grid border border-white/10 rounded-2xl relative overflow-hidden flex items-center justify-center min-h-[400px]">
          <div className="absolute inset-0 bg-[#00f3ff]/5 pointer-events-none"></div>
          <div className="absolute top-4 left-4 bg-black/80 px-4 py-2 rounded-full border border-white/20 z-20 pointer-events-none">
            <p className="text-xs font-bold tracking-widest text-white/80">GAME MODULE</p>
          </div>
          <div className="w-full h-full max-w-[600px] aspect-square relative z-10 flex items-center justify-center p-4 lg:p-8">
             <div className="w-full h-full neon-border-cyan rounded border bg-black/60 backdrop-blur">
                <SnakeGame score={score} setScore={setScore} />
             </div>
          </div>
        </div>
      </main>

      <footer className="px-4 sm:px-6 py-4 flex justify-between items-center border-t border-white/10 text-[8px] sm:text-[10px] tracking-[0.2em] font-bold opacity-40 shrink-0">
        <div className="hidden sm:block">CONNECTION: SECURE // BUFFER: 128MS</div>
        <div>DESIGN_TYPE: BOLD_TYPOGRAPHY_V1</div>
        <div className="hidden sm:block">&copy; 2026 NEON_ENTERTAINMENT</div>
      </footer>

      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onEnded={skipForward}
        onTimeUpdate={(e) => {
           const el = e.currentTarget;
           if (el.duration) {
               setProgress((el.currentTime / el.duration) * 100);
           }
        }}
      />
    </div>
  );
}
