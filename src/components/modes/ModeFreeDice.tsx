import React, { useState } from 'react';
import { RefreshCw, Coffee, Utensils, Shuffle, Award, Check } from 'lucide-react';
import { Player, DiceTheme } from '../../types/game';
import { Dice3D } from '../Dice3D';
import { playDiceRollSound, playDiceClackSound, playVictorySound, playClickSound } from '../../utils/audio';

interface ModeFreeDiceProps {
  players: Player[];
  activePlayerIndex: number;
  diceTheme: DiceTheme;
}

interface RollHistoryItem {
  id: string;
  dice: number[];
  total: number;
  time: string;
  note?: string;
}

export const ModeFreeDice: React.FC<ModeFreeDiceProps> = ({
  players,
  activePlayerIndex,
  diceTheme,
}) => {
  const [diceCount, setDiceCount] = useState<number>(3);
  const [diceValues, setDiceValues] = useState<number[]>([4, 5, 6]);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [history, setHistory] = useState<RollHistoryItem[]>([]);

  // Mini-decider states
  const [activeDecider, setActiveDecider] = useState<'NONE' | 'COFFEE' | 'LUNCH'>('NONE');
  const [coffeeLoser, setCoffeeLoser] = useState<{ player: Player; roll: number } | null>(null);
  const [lunchChoice, setLunchChoice] = useState<string | null>(null);

  const LUNCH_OPTIONS = [
    '🍔 Burger Gourmet',
    '🍣 Sushis & Maki',
    '🍕 Pizza Italienne',
    '🥗 Salade & Bowl Frais',
    '🍲 Brasserie Traditionnelle',
    '🌮 Tacos Mexicains',
  ];

  const rollFreeDice = (note?: string) => {
    if (isRolling) return;
    setIsRolling(true);
    playDiceRollSound();

    setTimeout(() => {
      const nextValues = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
      setDiceValues(nextValues);
      setIsRolling(false);
      playDiceClackSound();

      const total = nextValues.reduce((a, b) => a + b, 0);
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      setHistory((prev) => [
        {
          id: `h-${Date.now()}`,
          dice: nextValues,
          total,
          time: timeStr,
          note,
        },
        ...prev.slice(0, 7),
      ]);
    }, 600);
  };

  // Coffee loser decider: roll a die for each player, lowest loses!
  const runCoffeeDecider = () => {
    if (players.length < 2) {
      alert("Ajoutez au moins 2 joueurs dans la barre de repos pour désigner qui paie le café !");
      return;
    }
    setActiveDecider('COFFEE');
    setIsRolling(true);
    playDiceRollSound();

    setTimeout(() => {
      const results = players.map((p) => ({
        player: p,
        roll: Math.floor(Math.random() * 6) + 1,
      }));

      // Find lowest roll
      const lowest = [...results].sort((a, b) => a.roll - b.roll)[0];
      setCoffeeLoser(lowest);
      setIsRolling(false);
      playVictorySound();
    }, 800);
  };

  // Lunch decider
  const runLunchDecider = () => {
    setActiveDecider('LUNCH');
    setIsRolling(true);
    playDiceRollSound();

    setTimeout(() => {
      const chosen = LUNCH_OPTIONS[Math.floor(Math.random() * LUNCH_OPTIONS.length)];
      setLunchChoice(chosen);
      setIsRolling(false);
      playVictorySound();
    }, 600);
  };

  const totalSum = diceValues.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Piste Header with quick deciders */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-amber-400">Piste Libre & Décideur</span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400 font-mono">Nombre de dés :</span>
          <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                onClick={() => {
                  playClickSound();
                  setDiceCount(num);
                  setDiceValues(Array.from({ length: num }, () => Math.floor(Math.random() * 6) + 1));
                }}
                className={`w-6 h-6 rounded text-xs font-mono font-medium transition-colors ${
                  diceCount === num
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Deciders */}
        <div className="flex items-center gap-2">
          <button
            onClick={runCoffeeDecider}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Qui paie le café ?</span>
          </button>
          <button
            onClick={runLunchDecider}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Choix resto</span>
          </button>
        </div>
      </div>

      {/* Coffee Decider Result */}
      {activeDecider === 'COFFEE' && coffeeLoser && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-base mb-1">
            <Coffee className="w-5 h-5" />
            <span>C'est officiel ! Le café est offert par :</span>
          </div>
          <div className="text-xl font-bold text-white flex items-center justify-center gap-2 my-2">
            <span>{coffeeLoser.player.avatar}</span>
            <span>{coffeeLoser.player.name}</span>
            <span className="text-xs text-amber-300/80 font-mono">(Score le plus bas : {coffeeLoser.roll})</span>
          </div>
          <p className="text-xs text-slate-300">
            Préparez vos tasses, la règle du dé ne ment jamais !
          </p>
        </div>
      )}

      {/* Lunch Decider Result */}
      {activeDecider === 'LUNCH' && lunchChoice && (
        <div className="bg-sky-950/40 border border-sky-500/40 rounded-xl p-4 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-sky-400 font-bold text-base mb-1">
            <Utensils className="w-5 h-5" />
            <span>Le destin a choisi votre repas de pause :</span>
          </div>
          <div className="text-2xl font-bold text-white my-2">
            {lunchChoice}
          </div>
          <p className="text-xs text-slate-300">
            Décision unanime validée par les dés de la détente.
          </p>
        </div>
      )}

      {/* Main Dice Table */}
      <div className="relative rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-6 md:p-8 shadow-xl text-center">
        {/* Dice row */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 my-6">
          {diceValues.map((val, idx) => (
            <Dice3D
              key={idx}
              value={val}
              isRolling={isRolling}
              theme={diceTheme}
              size="lg"
            />
          ))}
        </div>

        {/* Stats strip */}
        {!isRolling && (
          <div className="flex items-center justify-center gap-6 text-xs text-slate-400 my-4 font-mono">
            <div>
              <span>Somme totale : </span>
              <strong className="text-base text-amber-400 tabular-nums">{totalSum}</strong>
            </div>
            <span>·</span>
            <div>
              <span>Parité : </span>
              <strong className="text-slate-200">{totalSum % 2 === 0 ? 'Pair' : 'Impair'}</strong>
            </div>
            <span>·</span>
            <div>
              <span>Max : </span>
              <strong className="text-slate-200">{Math.max(...diceValues)}</strong>
            </div>
          </div>
        )}

        {/* Big Roll CTA */}
        <button
          onClick={() => rollFreeDice()}
          disabled={isRolling}
          className="mt-4 px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 text-xs uppercase tracking-wider mx-auto disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
          <span>{isRolling ? 'Les dés voltigent...' : 'Lancer les dés'}</span>
        </button>
      </div>

      {/* History log */}
      {history.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-300 mb-2">Historique des derniers lancers :</div>
          <div className="space-y-1.5 font-mono text-xs">
            {history.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-slate-400 py-1 border-b border-slate-800/60 last:border-0">
                <span className="text-slate-500">{item.time}</span>
                <span className="text-slate-200">[{item.dice.join(' · ')}]</span>
                <span className="text-amber-400 font-bold">Total: {item.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
