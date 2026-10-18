import React, { useState } from 'react';
import { RefreshCw, Check, Award, HelpCircle, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Player, DiceTheme } from '../../types/game';
import { Dice3D } from '../Dice3D';
import { playDiceRollSound, playDiceClackSound, playVictorySound, playClickSound, playBustSound } from '../../utils/audio';

interface Mode421Props {
  players: Player[];
  activePlayerIndex: number;
  onNextPlayer: () => void;
  onAddScore: (playerIndex: number, points: number) => void;
  diceTheme: DiceTheme;
}

interface DieState {
  id: number;
  value: number;
  isKept: boolean;
}

export const Mode421: React.FC<Mode421Props> = ({
  players,
  activePlayerIndex,
  onNextPlayer,
  onAddScore,
  diceTheme,
}) => {
  const [dice, setDice] = useState<DieState[]>([
    { id: 1, value: 4, isKept: false },
    { id: 2, value: 2, isKept: false },
    { id: 3, value: 1, isKept: false },
  ]);
  const [rollCount, setRollCount] = useState<number>(0); // 0 = not rolled yet in current turn
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [maxRounds] = useState<number>(5);
  const [showRules, setShowRules] = useState<boolean>(false);
  const [turnResult, setTurnResult] = useState<{ name: string; points: number; isNenette: boolean; is421: boolean } | null>(null);

  const activePlayer = players[activePlayerIndex] || players[0];

  // Evaluate the 3 dice combination
  const evaluateCombination = (values: number[]) => {
    const sorted = [...values].sort((a, b) => b - a); // descending
    const str = sorted.join('');

    // 421 Supreme
    if (str === '421') {
      return { name: '421 ! Le Roi du Comptoir', points: 1000, isNenette: false, is421: true };
    }

    // Brelan d'As (1-1-1)
    if (str === '111') {
      return { name: "Brelan d'As (Mac 1)", points: 700, isNenette: false, is421: false };
    }

    // Brelans (6-6-6 to 2-2-2)
    if (sorted[0] === sorted[1] && sorted[1] === sorted[2]) {
      return { name: `Brelan de ${sorted[0]}`, points: sorted[0] * 50, isNenette: false, is421: false };
    }

    // As combinés (ex: 6-1-1, 5-1-1...)
    if (sorted[1] === 1 && sorted[2] === 1) {
      return { name: `Fiche d'As (${sorted[0]})`, points: sorted[0] * 30 + 100, isNenette: false, is421: false };
    }

    // Suites
    if (str === '654') return { name: 'Grande Suite (6-5-4)', points: 140, isNenette: false, is421: false };
    if (str === '543') return { name: 'Suite (5-4-3)', points: 130, isNenette: false, is421: false };
    if (str === '432') return { name: 'Suite (4-3-2)', points: 120, isNenette: false, is421: false };
    if (str === '321') return { name: 'Petite Suite (3-2-1)', points: 110, isNenette: false, is421: false };

    // Nénette (2-2-1)
    if (str === '221') {
      return { name: 'Nénette ! (2-2-1) Le gage du perdant', points: 0, isNenette: true, is421: false };
    }

    // Score choulleur standard
    const points = sorted[0] * 10 + sorted[1] * 5 + sorted[2];
    return { name: `Choulleur (${sorted.join('-')})`, points, isNenette: false, is421: false };
  };

  const handleRoll = () => {
    if (isRolling || rollCount >= 3) return;

    setIsRolling(true);
    playDiceRollSound();

    setTimeout(() => {
      const nextDice = dice.map((d) =>
        d.isKept ? d : { ...d, value: Math.floor(Math.random() * 6) + 1 }
      );
      setDice(nextDice);
      const newRollCount = rollCount + 1;
      setRollCount(newRollCount);
      setIsRolling(false);
      playDiceClackSound();

      const evalRes = evaluateCombination(nextDice.map((d) => d.value));
      setTurnResult(evalRes);

      if (evalRes.is421) {
        playVictorySound();
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      } else if (evalRes.isNenette) {
        playBustSound();
      }
    }, 600);
  };

  const toggleKeep = (id: number) => {
    if (rollCount === 0 || rollCount >= 3 || isRolling) return;
    playClickSound();
    setDice((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isKept: !d.isKept } : d))
    );
  };

  const handleValidateTurn = () => {
    if (!turnResult) return;
    playClickSound();
    onAddScore(activePlayerIndex, turnResult.points);

    // Reset dice for next player
    setDice([
      { id: 1, value: 4, isKept: false },
      { id: 2, value: 2, isKept: false },
      { id: 3, value: 1, isKept: false },
    ]);
    setRollCount(0);
    setTurnResult(null);

    // Round progression
    if (activePlayerIndex === players.length - 1) {
      if (roundNumber < maxRounds) {
        setRoundNumber((r) => r + 1);
      }
    }

    onNextPlayer();
  };

  return (
    <div className="space-y-6">
      {/* Top Bar for Mode 421 */}
      <div className="flex items-center justify-between p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-amber-400">Le 421 Express</span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-300 font-mono">
            Manche {roundNumber} / {maxRounds}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400 font-mono">
            Lancer {rollCount} / 3
          </span>
        </div>

        <button
          onClick={() => setShowRules(!showRules)}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Règles du 421</span>
        </button>
      </div>

      {/* Rules foldout */}
      {showRules && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2 animate-fade-in">
          <div className="font-bold text-amber-400 mb-1">Règles rapides du 421 de pause :</div>
          <p>
            Chaque joueur dispose de <strong>3 lancers maximum</strong>. Vous pouvez conserver des dés entre chaque lancer en cliquant dessus.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
            <div>• <strong>4-2-1</strong> : Roi suprême (1000 pts)</div>
            <div>• <strong>1-1-1</strong> : Brelan d'As (700 pts)</div>
            <div>• <strong>Suites</strong> : 6-5-4 à 3-2-1 (110 à 140 pts)</div>
            <div>• <strong>2-2-1 (Nénette)</strong> : 0 pt + paie le café !</div>
          </div>
        </div>
      )}

      {/* Felt Board */}
      <div className="relative rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-6 md:p-8 shadow-xl text-center">
        {/* Active player lead */}
        <div className="flex items-center justify-center gap-2 mb-4 text-sm text-slate-400">
          <span>Tour de</span>
          <span className="font-semibold text-amber-300 flex items-center gap-1">
            <span>{activePlayer.avatar}</span>
            <span>{activePlayer.name}</span>
          </span>
        </div>

        {/* 3 Dice */}
        <div className="flex items-center justify-center gap-6 md:gap-10 my-6">
          {dice.map((die) => (
            <div key={die.id} className="flex flex-col items-center">
              <Dice3D
                value={die.value}
                isRolling={isRolling}
                isKept={die.isKept}
                selectable={rollCount > 0 && rollCount < 3}
                onClick={() => toggleKeep(die.id)}
                theme={diceTheme}
                size="lg"
              />
              {rollCount > 0 && rollCount < 3 && (
                <span className="text-[10px] text-slate-400 mt-2 font-medium">
                  {die.isKept ? 'Gardé' : 'Cliquer pour garder'}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Result readout */}
        {turnResult && rollCount > 0 && !isRolling && (
          <div className="my-5 p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 max-w-sm mx-auto animate-fade-in">
            <div className={`text-base font-bold ${turnResult.is421 ? 'text-amber-400' : turnResult.isNenette ? 'text-rose-400' : 'text-slate-100'}`}>
              {turnResult.name}
            </div>
            <div className="text-xs text-slate-400 mt-1 font-mono tabular-nums">
              Score : +{turnResult.points} points
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3 mt-6">
          {rollCount < 3 && (
            <button
              onClick={handleRoll}
              disabled={isRolling}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
              <span>
                {rollCount === 0
                  ? 'Premier Lancer'
                  : `Relancer les autres (${3 - rollCount} restant${3 - rollCount > 1 ? 's' : ''})`}
              </span>
            </button>
          )}

          {rollCount > 0 && (
            <button
              onClick={handleValidateTurn}
              disabled={isRolling}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-md transition-colors flex items-center gap-1.5 text-xs uppercase tracking-wider"
            >
              <Check className="w-4 h-4" />
              <span>Garder ce score & Passer</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
