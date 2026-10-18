import React, { useState } from 'react';
import { RefreshCw, PiggyBank, Flame, AlertTriangle, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Player, DiceTheme } from '../../types/game';
import { Dice3D } from '../Dice3D';
import { playDiceRollSound, playDiceClackSound, playVictorySound, playBustSound, playClickSound } from '../../utils/audio';

interface ModeFarkleProps {
  players: Player[];
  activePlayerIndex: number;
  onNextPlayer: () => void;
  onAddScore: (playerIndex: number, points: number) => void;
  diceTheme: DiceTheme;
}

interface FarkleDie {
  id: number;
  value: number;
  isKept: boolean; // kept from earlier roll
  isSelected: boolean; // currently selected in this roll
}

export const ModeFarkle: React.FC<ModeFarkleProps> = ({
  players,
  activePlayerIndex,
  onNextPlayer,
  onAddScore,
  diceTheme,
}) => {
  const [dice, setDice] = useState<FarkleDie[]>([
    { id: 1, value: 1, isKept: false, isSelected: false },
    { id: 2, value: 5, isKept: false, isSelected: false },
    { id: 3, value: 2, isKept: false, isSelected: false },
    { id: 4, value: 3, isKept: false, isSelected: false },
    { id: 5, value: 4, isKept: false, isSelected: false },
    { id: 6, value: 6, isKept: false, isSelected: false },
  ]);

  const [turnScore, setTurnScore] = useState<number>(0);
  const [hasRolled, setHasRolled] = useState<boolean>(false);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [isFarkle, setIsFarkle] = useState<boolean>(false);
  const [showRules, setShowRules] = useState<boolean>(false);

  const activePlayer = players[activePlayerIndex] || players[0];

  // Helper to score a set of dice values
  const calculateSelectionScore = (values: number[]): { score: number; valid: boolean } => {
    if (values.length === 0) return { score: 0, valid: false };

    const counts: Record<number, number> = {};
    values.forEach((v) => (counts[v] = (counts[v] || 0) + 1));

    // Check 1-6 straight
    if (values.length === 6 && [1, 2, 3, 4, 5, 6].every((n) => counts[n] === 1)) {
      return { score: 1500, valid: true };
    }

    // Check 3 pairs
    const pairs = Object.values(counts).filter((c) => c === 2).length;
    if (values.length === 6 && pairs === 3) {
      return { score: 1500, valid: true };
    }

    let score = 0;
    let usedCount = 0;

    // Check 3-of-a-kind, 4-of-a-kind etc.
    for (let num = 1; num <= 6; num++) {
      const c = counts[num] || 0;
      if (c >= 3) {
        const base = num === 1 ? 1000 : num * 100;
        const multiplier = Math.pow(2, c - 3);
        score += base * multiplier;
        usedCount += c;
      } else if (num === 1) {
        score += c * 100;
        usedCount += c;
      } else if (num === 5) {
        score += c * 50;
        usedCount += c;
      }
    }

    // Must only have selected scoring dice
    const valid = usedCount === values.length && score > 0;
    return { score, valid };
  };

  // Check if unkept dice have ANY scoring options (to detect Farkle)
  const hasAnyScoringDice = (values: number[]): boolean => {
    const counts: Record<number, number> = {};
    values.forEach((v) => (counts[v] = (counts[v] || 0) + 1));

    if (counts[1] > 0 || counts[5] > 0) return true;
    for (let num = 1; num <= 6; num++) {
      if ((counts[num] || 0) >= 3) return true;
    }
    if (values.length === 6 && [1, 2, 3, 4, 5, 6].every((n) => counts[n] === 1)) return true;
    const pairs = Object.values(counts).filter((c) => c === 2).length;
    if (values.length === 6 && pairs === 3) return true;

    return false;
  };

  const handleRoll = () => {
    if (isRolling) return;

    // If rolling after previous roll, commit current selected dice to turnScore
    const selectedDice = dice.filter((d) => d.isSelected);
    if (hasRolled) {
      const { score, valid } = calculateSelectionScore(selectedDice.map((d) => d.value));
      if (!valid) return;
      setTurnScore((prev) => prev + score);
    }

    setIsRolling(true);
    playDiceRollSound();

    setTimeout(() => {
      // Check if all dice were kept/selected -> Hot Dice!
      const unkeptCount = dice.filter((d) => !d.isKept && !d.isSelected).length;
      const isHotDice = hasRolled && unkeptCount === 0;

      let nextDice: FarkleDie[];
      if (isHotDice) {
        // Reset all 6 dice for rolling
        nextDice = dice.map((d) => ({
          ...d,
          value: Math.floor(Math.random() * 6) + 1,
          isKept: false,
          isSelected: false,
        }));
      } else {
        nextDice = dice.map((d) => {
          if (d.isKept || d.isSelected) {
            return { ...d, isKept: true, isSelected: false };
          }
          return {
            ...d,
            value: Math.floor(Math.random() * 6) + 1,
            isSelected: false,
          };
        });
      }

      setDice(nextDice);
      setIsRolling(false);
      setHasRolled(true);
      playDiceClackSound();

      // Check for Farkle
      const rollValues = nextDice.filter((d) => !d.isKept).map((d) => d.value);
      if (!hasAnyScoringDice(rollValues)) {
        setIsFarkle(true);
        playBustSound();
      }
    }, 600);
  };

  const toggleSelectDie = (id: number) => {
    if (!hasRolled || isRolling || isFarkle) return;
    const target = dice.find((d) => d.id === id);
    if (!target || target.isKept) return;

    playClickSound();
    setDice((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isSelected: !d.isSelected } : d))
    );
  };

  const selectedValues = dice.filter((d) => d.isSelected).map((d) => d.value);
  const currentSelectionEval = calculateSelectionScore(selectedValues);
  const potentialTotal = turnScore + (currentSelectionEval.valid ? currentSelectionEval.score : 0);

  const handleBankPoints = () => {
    if (!hasRolled || isRolling || isFarkle) return;
    const { score, valid } = calculateSelectionScore(selectedValues);
    if (selectedValues.length > 0 && !valid) return;

    const finalPoints = turnScore + (valid ? score : 0);
    if (finalPoints === 0) return;

    playVictorySound();
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
    onAddScore(activePlayerIndex, finalPoints);
    resetAndNext();
  };

  const handleFarkleConfirm = () => {
    playClickSound();
    resetAndNext();
  };

  const resetAndNext = () => {
    setDice([
      { id: 1, value: 1, isKept: false, isSelected: false },
      { id: 2, value: 5, isKept: false, isSelected: false },
      { id: 3, value: 2, isKept: false, isSelected: false },
      { id: 4, value: 3, isKept: false, isSelected: false },
      { id: 5, value: 4, isKept: false, isSelected: false },
      { id: 6, value: 6, isKept: false, isSelected: false },
    ]);
    setTurnScore(0);
    setHasRolled(false);
    setIsFarkle(false);
    onNextPlayer();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-amber-400">Le 10 000 (Farkle)</span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-300 font-mono">
            Score manche en cours : {potentialTotal} pts
          </span>
        </div>

        <button
          onClick={() => setShowRules(!showRules)}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Barème des points</span>
        </button>
      </div>

      {showRules && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2 animate-fade-in">
          <div className="font-bold text-amber-400 mb-1">Combinaisons gagnantes du Farkle :</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
            <div>• Le <strong>1</strong> = 100 pts</div>
            <div>• Le <strong>5</strong> = 50 pts</div>
            <div>• 3 × <strong>1</strong> = 1000 pts</div>
            <div>• 3 × <strong>6</strong> = 600 pts</div>
            <div>• 3 × <strong>5</strong> = 500 pts</div>
            <div>• 3 × <strong>X</strong> = X × 100 pts</div>
            <div>• Suite 1-6 = 1500 pts</div>
            <div>• 3 paires = 1500 pts</div>
            <div>• <strong>FARKLE</strong> = 0 pt si aucun dé ne marque !</div>
          </div>
        </div>
      )}

      {/* Board */}
      <div className="relative rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-6 md:p-8 shadow-xl text-center">
        <div className="flex items-center justify-center gap-2 mb-4 text-sm text-slate-400">
          <span>Tour de</span>
          <span className="font-semibold text-amber-300 flex items-center gap-1">
            <span>{activePlayer.avatar}</span>
            <span>{activePlayer.name}</span>
          </span>
        </div>

        {/* 6 Dice Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 md:gap-6 justify-items-center my-6 max-w-2xl mx-auto">
          {dice.map((die) => {
            const isClickable = hasRolled && !die.isKept && !isFarkle && !isRolling;

            return (
              <div key={die.id} className="flex flex-col items-center">
                <Dice3D
                  value={die.value}
                  isRolling={isRolling && !die.isKept && !die.isSelected}
                  isKept={die.isKept || die.isSelected}
                  selectable={isClickable}
                  onClick={() => toggleSelectDie(die.id)}
                  theme={diceTheme}
                  size="md"
                />
                <span className="text-[10px] text-slate-400 mt-1.5 font-mono">
                  {die.isKept
                    ? 'Verrouillé'
                    : die.isSelected
                    ? 'Sélectionné'
                    : isClickable
                    ? 'Choisir'
                    : ''}
                </span>
              </div>
            );
          })}
        </div>

        {/* Farkle alert modal/banner */}
        {isFarkle && (
          <div className="max-w-md mx-auto my-5 p-4 bg-rose-950/80 border border-rose-700/80 rounded-xl text-rose-200 animate-fade-in shadow-xl">
            <div className="flex items-center justify-center gap-2 font-bold text-lg text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <span>FARKLE ! Tous les points du tour sont perdus !</span>
            </div>
            <p className="text-xs text-rose-300/90 mt-1">
              Aucun des dés restants ne permet de marquer. C'est le risque du repos !
            </p>
            <button
              onClick={handleFarkleConfirm}
              className="mt-3 px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg text-xs"
            >
              Passer au joueur suivant
            </button>
          </div>
        )}

        {/* Controls */}
        {!isFarkle && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              onClick={handleRoll}
              disabled={isRolling || (hasRolled && !currentSelectionEval.valid)}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 text-xs uppercase tracking-wider disabled:opacity-40 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
              <span>{hasRolled ? 'Rejouer les dés restants' : 'Lancer les 6 dés'}</span>
            </button>

            {hasRolled && potentialTotal > 0 && (
              <button
                onClick={handleBankPoints}
                disabled={isRolling || (selectedValues.length > 0 && !currentSelectionEval.valid)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 text-xs uppercase tracking-wider disabled:opacity-40 cursor-pointer"
              >
                <PiggyBank className="w-4 h-4" />
                <span>Banquer (+{potentialTotal} pts)</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
