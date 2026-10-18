import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { playVictorySound, toggleAudio, isAudioEnabled } from '../utils/audio';

export const BreakTimer: React.FC = () => {
  const [duration, setDuration] = useState<number>(600); // 10 minutes default
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(isAudioEnabled());
  const [isAlerting, setIsAlerting] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsAlerting(true);
            playVictorySound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const setPreset = (seconds: number) => {
    setDuration(seconds);
    setTimeLeft(seconds);
    setIsRunning(false);
    setIsAlerting(false);
  };

  const resetTimer = () => {
    setTimeLeft(duration);
    setIsRunning(false);
    setIsAlerting(false);
  };

  const handleToggleSound = () => {
    const next = toggleAudio();
    setSoundOn(next);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-200">Chrono de Repos</span>
        </div>

        <button
          onClick={handleToggleSound}
          className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          title={soundOn ? 'Couper les sons' : 'Activer les sons'}
          aria-label={soundOn ? 'Désactiver le son' : 'Activer le son'}
        >
          {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Digital display */}
        <div className="flex items-baseline gap-2">
          <span className={`font-mono text-2xl font-bold tracking-tight tabular-nums ${isAlerting ? 'text-rose-400 animate-pulse' : 'text-slate-100'}`}>
            {formattedTime}
          </span>
          {isAlerting && (
            <span className="text-xs text-rose-400 font-medium">Fin de pause !</span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`p-2 rounded-lg font-medium text-xs transition-colors flex items-center gap-1 ${
              isRunning 
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30' 
                : 'bg-emerald-600 text-white hover:bg-emerald-500'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? 'Pause' : 'Lancer'}</span>
          </button>
          
          <button
            onClick={resetTimer}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Réinitialiser"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
        <div 
          className="bg-amber-400 h-full transition-all duration-300" 
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Preset buttons */}
      <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
        <span className="text-[11px] text-slate-500">Presets :</span>
        <button
          onClick={() => setPreset(300)}
          className={`px-2 py-0.5 rounded text-[11px] transition-colors ${duration === 300 ? 'bg-slate-700 text-amber-300 font-semibold' : 'hover:text-slate-200'}`}
        >
          5 min
        </button>
        <button
          onClick={() => setPreset(600)}
          className={`px-2 py-0.5 rounded text-[11px] transition-colors ${duration === 600 ? 'bg-slate-700 text-amber-300 font-semibold' : 'hover:text-slate-200'}`}
        >
          10 min
        </button>
        <button
          onClick={() => setPreset(900)}
          className={`px-2 py-0.5 rounded text-[11px] transition-colors ${duration === 900 ? 'bg-slate-700 text-amber-300 font-semibold' : 'hover:text-slate-200'}`}
        >
          15 min
        </button>
        <button
          onClick={() => setPreset(1500)}
          className={`px-2 py-0.5 rounded text-[11px] transition-colors ${duration === 1500 ? 'bg-slate-700 text-amber-300 font-semibold' : 'hover:text-slate-200'}`}
        >
          25 min
        </button>
      </div>
    </div>
  );
};
