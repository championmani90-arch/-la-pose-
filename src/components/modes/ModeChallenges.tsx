import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, CheckCircle2, XCircle, Plus, Clock, Flame, BookOpen, Scale, Eye, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Player, ChallengePack, ChallengeItem, DiceTheme } from '../../types/game';
import { DEFAULT_CHALLENGES } from '../../data/challenges';
import { Dice3D } from '../Dice3D';
import { playDiceRollSound, playDiceClackSound, playVictorySound, playClickSound } from '../../utils/audio';

interface ModeChallengesProps {
  players: Player[];
  activePlayerIndex: number;
  onNextPlayer: () => void;
  onAddScore: (playerIndex: number, points: number) => void;
  diceTheme: DiceTheme;
}

const CATEGORY_MAP: Record<number, { key: ChallengeItem['category']; title: string; color: string; icon: React.ReactNode }> = {
  1: { key: 'VERITE', title: 'Vérité Piquante', color: 'text-amber-400', icon: <Eye className="w-4 h-4" /> },
  2: { key: 'DILEMME', title: 'Dilemme Absurde', color: 'text-sky-400', icon: <Scale className="w-4 h-4" /> },
  3: { key: 'ANECDOTE', title: 'Anecdote Vraie', color: 'text-emerald-400', icon: <BookOpen className="w-4 h-4" /> },
  4: { key: 'DEFI', title: 'Défi Chrono', color: 'text-purple-400', icon: <Zap className="w-4 h-4" /> },
  5: { key: 'DEBAT', title: 'Mini-Débat', color: 'text-rose-400', icon: <Flame className="w-4 h-4" /> },
  6: { key: 'GAGE_EXPRESS', title: 'Gage Immédiat', color: 'text-orange-400', icon: <Sparkles className="w-4 h-4" /> },
};

export const ModeChallenges: React.FC<ModeChallengesProps> = ({
  players,
  activePlayerIndex,
  onNextPlayer,
  onAddScore,
  diceTheme,
}) => {
  const [pack, setPack] = useState<ChallengePack>('BUREAU_CAFE');
  const [challenges, setChallenges] = useState<ChallengeItem[]>(DEFAULT_CHALLENGES);
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeItem | null>(null);

  // Dice states
  const [categoryDie, setCategoryDie] = useState<number>(1);
  const [intensityDie, setIntensityDie] = useState<number>(2);
  const [isRolling, setIsRolling] = useState<boolean>(false);

  // Challenge timer
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  // Custom challenge modal
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<ChallengeItem['category']>('VERITE');

  const activePlayer = players[activePlayerIndex] || players[0];

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && timerSeconds !== null && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev !== null && prev <= 1) {
            setTimerRunning(false);
            playVictorySound();
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timerSeconds]);

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    setCurrentChallenge(null);
    setTimerSeconds(null);
    setTimerRunning(false);
    playDiceRollSound();

    setTimeout(() => {
      const newCat = Math.floor(Math.random() * 6) + 1;
      const newInt = Math.floor(Math.random() * 6) + 1;
      setCategoryDie(newCat);
      setIntensityDie(newInt);
      setIsRolling(false);
      playDiceClackSound();

      // Pick matching challenge
      const targetCategory = CATEGORY_MAP[newCat].key;
      const pool = challenges.filter((c) => c.category === targetCategory && c.pack === pack);
      const fallbackPool = challenges.filter((c) => c.category === targetCategory);
      const chosenPool = pool.length > 0 ? pool : fallbackPool;

      if (chosenPool.length > 0) {
        const picked = chosenPool[Math.floor(Math.random() * chosenPool.length)];
        setCurrentChallenge(picked);
        if (picked.timerSeconds) {
          setTimerSeconds(picked.timerSeconds);
        }
      }
    }, 700);
  };

  const handleSuccess = () => {
    playVictorySound();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
    });
    // Add points based on intensity
    onAddScore(activePlayerIndex, intensityDie * 10);
    onNextPlayer();
    setCurrentChallenge(null);
  };

  const handleFailOrPass = () => {
    playClickSound();
    onNextPlayer();
    setCurrentChallenge(null);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    const newItem: ChallengeItem = {
      id: `custom-${Date.now()}`,
      category: customCategory,
      pack: pack,
      text: customText.trim(),
      intensity: 2,
    };

    setChallenges([newItem, ...challenges]);
    setCustomText('');
    setShowCustomModal(false);
    playClickSound();
  };

  const categoryMeta = CATEGORY_MAP[categoryDie];

  return (
    <div className="space-y-6">
      {/* Pack selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-slate-900/80 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => {
              playClickSound();
              setPack('BUREAU_CAFE');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              pack === 'BUREAU_CAFE'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ☕ Pause Café & Bureau
          </button>
          <button
            onClick={() => {
              playClickSound();
              setPack('APERO_POTES');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              pack === 'APERO_POTES'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🍻 Apéro & Amis
          </button>
          <button
            onClick={() => {
              playClickSound();
              setPack('SANS_FILTRE');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              pack === 'SANS_FILTRE'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🔥 Sans Filtre Adultes
          </button>
        </div>

        <button
          onClick={() => setShowCustomModal(true)}
          className="text-xs text-slate-300 hover:text-amber-300 px-3 py-1.5 flex items-center gap-1 transition-colors self-end sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Créer un défi</span>
        </button>
      </div>

      {/* Main dice arena */}
      <div className="relative rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-6 md:p-8 overflow-hidden shadow-xl">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-xl mx-auto flex flex-col items-center text-center">
          {/* Active player announcement */}
          <div className="flex items-center gap-2 mb-6 text-sm text-slate-400">
            <span>Au tour de</span>
            <span className="font-semibold text-amber-300 flex items-center gap-1">
              <span>{activePlayer.avatar}</span>
              <span>{activePlayer.name}</span>
            </span>
          </div>

          {/* 3D Dice Display */}
          <div className="flex items-center justify-center gap-10 md:gap-14 my-4">
            <Dice3D
              value={categoryDie}
              isRolling={isRolling}
              theme={diceTheme}
              size="lg"
              label="DÉ CATÉGORIE"
            />
            <Dice3D
              value={intensityDie}
              isRolling={isRolling}
              theme={diceTheme}
              size="lg"
              label="DÉ ENJEU / GORGÉES"
            />
          </div>

          {/* Roll action button */}
          <button
            onClick={rollDice}
            disabled={isRolling}
            className="mt-6 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl shadow-lg hover:from-amber-400 hover:to-amber-500 active:scale-98 transition-all flex items-center gap-2.5 text-sm uppercase tracking-wider disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
            <span>{isRolling ? 'Les dés roulent...' : 'Lancer les Dés'}</span>
          </button>
        </div>

        {/* Challenge card presentation */}
        {currentChallenge && !isRolling && (
          <div className="mt-8 max-w-xl mx-auto bg-slate-800/90 border border-slate-700/80 rounded-xl p-6 shadow-2xl animate-fade-in backdrop-blur-sm">
            {/* Header info without pills */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3 border-b border-slate-700/50 pb-3">
              <div className={`flex items-center gap-1.5 font-semibold ${categoryMeta.color}`}>
                {categoryMeta.icon}
                <span>{categoryMeta.title}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 font-mono">
                <span>Enjeu : {intensityDie} {intensityDie > 1 ? 'gorgées / ×10 pts' : 'gorgée / 10 pts'}</span>
              </div>
            </div>

            {/* Prompt text */}
            <p className="text-lg md:text-xl font-medium text-slate-100 leading-relaxed my-4">
              "{currentChallenge.text}"
            </p>

            {/* Timed challenge countdown */}
            {timerSeconds !== null && (
              <div className="flex items-center justify-between bg-slate-900/60 rounded-lg p-3 my-4 border border-slate-700/40">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Temps imparti :</span>
                  <span className="font-mono text-base font-bold text-amber-300 tabular-nums">
                    {timerSeconds}s
                  </span>
                </div>

                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-xs font-semibold hover:bg-amber-500/30 transition-colors"
                >
                  {timerRunning ? 'Pause chrono' : 'Démarrer chrono'}
                </button>
              </div>
            )}

            {/* Verdict buttons */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-700/50">
              <button
                onClick={handleFailOrPass}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Passer / Gage subi</span>
              </button>

              <button
                onClick={handleSuccess}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Défi relevé (+{intensityDie * 10} pts)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Challenge Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 mb-1">
              Ajouter une question ou un défi
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Personnalisez le jeu avec une anecdote de boîte ou un défi propre à votre groupe.
            </p>

            <form onSubmit={handleAddCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Catégorie
                </label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as ChallengeItem['category'])}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  <option value="VERITE">Vérité Piquante</option>
                  <option value="DILEMME">Dilemme Absurde</option>
                  <option value="ANECDOTE">Anecdote Vraie</option>
                  <option value="DEFI">Défi Chrono</option>
                  <option value="DEBAT">Mini-Débat</option>
                  <option value="GAGE_EXPRESS">Gage Immédiat</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Votre question ou défi
                </label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Ex : Quel collègue met le plus de temps à répondre sur Slack ?..."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!customText.trim()}
                  className="px-4 py-1.5 bg-amber-500 text-slate-950 font-semibold rounded-lg text-xs hover:bg-amber-400 disabled:opacity-50"
                >
                  Ajouter au jeu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
