import React, { useState } from 'react';
import { Sparkles, Trophy, RotateCcw, Palette, Users } from 'lucide-react';
import { GameModeId, Player, DiceTheme } from './types/game';
import { PlayerManager } from './components/PlayerManager';
import { BreakTimer } from './components/BreakTimer';
import { ModeChallenges } from './components/modes/ModeChallenges';
import { Mode421 } from './components/modes/Mode421';
import { ModeFarkle } from './components/modes/ModeFarkle';
import { ModeFreeDice } from './components/modes/ModeFreeDice';
import { AdBanner } from './components/AdBanner';
import { playClickSound, playVictorySound } from './utils/audio';

// Import generated imagery
import TableBgImg from './assets/images/table_feutrine_bois_1792284363245.jpg';
import LoungeBannerImg from './assets/images/pause_detente_lounge_1792284363466.jpg';

export default function App() {
  const [activeMode, setActiveMode] = useState<GameModeId>('CHALLENGES');
  const [diceTheme, setDiceTheme] = useState<DiceTheme>('ivory');
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [showPodium, setShowPodium] = useState<boolean>(false);

  const [players, setPlayers] = useState<Player[]>([
    {
      id: 'p1',
      name: 'Alex',
      avatar: '☕',
      score: 120,
      farkleBanked: 0,
      farkleTurnScore: 0,
      challengesCompleted: 2,
    },
    {
      id: 'p2',
      name: 'Sarah',
      avatar: '🔥',
      score: 150,
      farkleBanked: 0,
      farkleTurnScore: 0,
      challengesCompleted: 3,
    },
    {
      id: 'p3',
      name: 'Julien',
      avatar: '🎲',
      score: 80,
      farkleBanked: 0,
      farkleTurnScore: 0,
      challengesCompleted: 1,
    },
  ]);

  const handleNextPlayer = () => {
    setActivePlayerIndex((prev) => (prev + 1) % players.length);
  };

  const handleAddScore = (playerIndex: number, points: number) => {
    setPlayers((prev) =>
      prev.map((p, idx) => (idx === playerIndex ? { ...p, score: p.score + points } : p))
    );
  };

  const handleResetScores = () => {
    playClickSound();
    setPlayers((prev) => prev.map((p) => ({ ...p, score: 0 })));
    setShowPodium(false);
  };

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-[#090d14] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Bar Contract (Zone 1: Brand - Zone 2: Single-line Links - Zone 3: 1 Primary Action) */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
          {/* Zone 1: Brand title, single line */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-bold tracking-tight text-amber-400 whitespace-nowrap">
              Pause Dés
            </span>
            <span className="hidden sm:inline text-xs text-slate-400 font-normal">
              · Jeux d'Adultes
            </span>
          </div>

          {/* Zone 2: Navigation Links (1-2 word labels, single line) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <button
              onClick={() => {
                playClickSound();
                setActiveMode('CHALLENGES');
              }}
              className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 ${
                activeMode === 'CHALLENGES' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : ''
              }`}
            >
              Vérités & Défis
            </button>
            <button
              onClick={() => {
                playClickSound();
                setActiveMode('421');
              }}
              className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 ${
                activeMode === '421' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : ''
              }`}
            >
              421 Express
            </button>
            <button
              onClick={() => {
                playClickSound();
                setActiveMode('FARKLE');
              }}
              className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 ${
                activeMode === 'FARKLE' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : ''
              }`}
            >
              Farkle 10 000
            </button>
            <button
              onClick={() => {
                playClickSound();
                setActiveMode('FREE_DICE');
              }}
              className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 ${
                activeMode === 'FREE_DICE' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : ''
              }`}
            >
              Piste Libre
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                playClickSound();
                setShowPodium(!showPodium);
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Classement</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center justify-around border-b border-slate-800 bg-slate-900/90 py-2 px-2 text-xs">
        <button
          onClick={() => setActiveMode('CHALLENGES')}
          className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
            activeMode === 'CHALLENGES' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400'
          }`}
        >
          Défis
        </button>
        <button
          onClick={() => setActiveMode('421')}
          className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
            activeMode === '421' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400'
          }`}
        >
          421
        </button>
        <button
          onClick={() => setActiveMode('FARKLE')}
          className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
            activeMode === 'FARKLE' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400'
          }`}
        >
          Farkle
        </button>
        <button
          onClick={() => setActiveMode('FREE_DICE')}
          className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
            activeMode === 'FREE_DICE' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400'
          }`}
        >
          Piste
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Classy Hero Banner for break times */}
        <section className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
          <img
            src={LoungeBannerImg}
            alt="Ambiance lounge pause détente"
            referrerPolicy="no-referrer"
            className="w-full h-44 sm:h-56 object-cover brightness-[0.45] saturate-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-6 sm:p-8 flex flex-col justify-end">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium tracking-wide uppercase mb-1">
              <span>Pause Détente & Café</span>
              <span aria-hidden="true">·</span>
              <span>Convivialité entre Adultes</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight text-balance">
              Le jeu de dés pensé pour déconnecter et s'amuser en pause.
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Des dés 3D réalistes, des dilemmes piquants, le grand 421 de bistrot et le Farkle 10 000 pour animer vos pauses café, apéros ou soirées entre collègues et amis.
            </p>
          </div>
        </section>

        {/* Dashboard Top Strip: Players + Break Timer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <PlayerManager
              players={players}
              activePlayerIndex={activePlayerIndex}
              onUpdatePlayers={setPlayers}
              onSelectActivePlayer={setActivePlayerIndex}
            />
          </div>
          <div>
            <BreakTimer />
          </div>
        </div>

        {/* Dice Style Selector Strip */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div className="flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-slate-400" />
            <span>Style des dés 3D :</span>
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
              <button
                onClick={() => setDiceTheme('ivory')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  diceTheme === 'ivory' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Ivoire Classique
              </button>
              <button
                onClick={() => setDiceTheme('wood')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  diceTheme === 'wood' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Bois Wengé
              </button>
              <button
                onClick={() => setDiceTheme('neon')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  diceTheme === 'neon' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Néon Nocturne
              </button>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-500 text-[11px]">
            <span>Web Audio Synthétique Actif</span>
            <span>·</span>
            <span>Sauvegarde automatique</span>
          </div>
        </div>

        {/* Active Mode Board */}
        <div className="relative">
          {activeMode === 'CHALLENGES' && (
            <ModeChallenges
              players={players}
              activePlayerIndex={activePlayerIndex}
              onNextPlayer={handleNextPlayer}
              onAddScore={handleAddScore}
              diceTheme={diceTheme}
            />
          )}

          {activeMode === '421' && (
            <Mode421
              players={players}
              activePlayerIndex={activePlayerIndex}
              onNextPlayer={handleNextPlayer}
              onAddScore={handleAddScore}
              diceTheme={diceTheme}
            />
          )}

          {activeMode === 'FARKLE' && (
            <ModeFarkle
              players={players}
              activePlayerIndex={activePlayerIndex}
              onNextPlayer={handleNextPlayer}
              onAddScore={handleAddScore}
              diceTheme={diceTheme}
            />
          )}

          {activeMode === 'FREE_DICE' && (
            <ModeFreeDice
              players={players}
              activePlayerIndex={activePlayerIndex}
              diceTheme={diceTheme}
            />
          )}
        </div>

        {/* Espace Annonce / Partenaire */}
        <AdBanner />

        {/* Podium / Leaderboard Modal */}
        {showPodium && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Classement de la Pause</h3>
                </div>
                <button
                  onClick={() => setShowPodium(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Fermer
                </button>
              </div>

              <div className="space-y-2 mb-6">
                {sortedPlayers.map((player, idx) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      idx === 0
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                        : 'bg-slate-800/50 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-slate-500 w-4">
                        #{idx + 1}
                      </span>
                      <span className="text-lg">{player.avatar}</span>
                      <span className="text-xs font-semibold">{player.name}</span>
                    </div>

                    <span className="font-mono text-sm font-bold tabular-nums">
                      {player.score} pts
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <button
                  onClick={handleResetScores}
                  className="text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Remettre les scores à zéro</span>
                </button>

                <button
                  onClick={() => setShowPodium(false)}
                  className="px-4 py-1.5 bg-amber-500 text-slate-950 font-semibold rounded-lg hover:bg-amber-400"
                >
                  Continuer la partie
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Pause Dés © 2026 · Jeu convivial pour moments de repos et pauses d'adultes</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Dés 3D Physiques</span>
            <span>·</span>
            <span>Zéro inscription requise</span>
            <span>·</span>
            <span>100% Hors-ligne</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
