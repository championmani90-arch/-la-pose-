import React, { useState } from 'react';
import { Users, Plus, Trash2, Crown } from 'lucide-react';
import { Player } from '../types/game';
import { playClickSound } from '../utils/audio';

interface PlayerManagerProps {
  players: Player[];
  activePlayerIndex: number;
  onUpdatePlayers: (players: Player[]) => void;
  onSelectActivePlayer?: (index: number) => void;
  readOnly?: boolean;
}

const AVATAR_OPTIONS = ['☕', '🎲', '🍻', '🍷', '🎯', '⚡', '👑', '😎', '🔥', '🥐'];

export const PlayerManager: React.FC<PlayerManagerProps> = ({
  players,
  activePlayerIndex,
  onUpdatePlayers,
  onSelectActivePlayer,
  readOnly = false,
}) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('☕');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    playClickSound();
    const newPlayer: Player = {
      id: `p-${Date.now()}`,
      name: newPlayerName.trim(),
      avatar: selectedAvatar,
      score: 0,
      farkleBanked: 0,
      farkleTurnScore: 0,
      challengesCompleted: 0,
    };

    onUpdatePlayers([...players, newPlayer]);
    setNewPlayerName('');
    setIsAdding(false);
  };

  const handleRemovePlayer = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (players.length <= 1) return;
    playClickSound();
    onUpdatePlayers(players.filter((p) => p.id !== id));
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-200">
            Joueurs au Repos ({players.length})
          </span>
        </div>

        {!readOnly && players.length < 8 && !isAdding && (
          <button
            onClick={() => {
              playClickSound();
              setIsAdding(true);
            }}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter</span>
          </button>
        )}
      </div>

      {/* Add player form */}
      {isAdding && (
        <form onSubmit={handleAddPlayer} className="mb-3 p-3 bg-slate-800/80 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Prénom du joueur..."
              maxLength={15}
              autoFocus
              className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="bg-amber-500 text-slate-950 font-semibold px-3 py-1.5 rounded text-xs hover:bg-amber-400 transition-colors"
            >
              OK
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-200 text-xs px-2"
            >
              Annuler
            </button>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {AVATAR_OPTIONS.map((av) => (
              <button
                type="button"
                key={av}
                onClick={() => setSelectedAvatar(av)}
                className={`p-1 text-sm rounded ${selectedAvatar === av ? 'bg-amber-500/30 ring-1 ring-amber-400' : 'hover:bg-slate-700'}`}
              >
                {av}
              </button>
            ))}
          </div>
        </form>
      )}

      {/* Players horizontal list */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {players.map((player, index) => {
          const isActive = index === activePlayerIndex;

          return (
            <div
              key={player.id}
              onClick={() => {
                if (onSelectActivePlayer) {
                  playClickSound();
                  onSelectActivePlayer(index);
                }
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-amber-500/15 border-amber-500/60 shadow-sm'
                  : 'bg-slate-800/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="text-base select-none">{player.avatar}</span>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-medium truncate max-w-[90px] ${isActive ? 'text-amber-300 font-semibold' : 'text-slate-200'}`}>
                    {player.name}
                  </span>
                  {isActive && <Crown className="w-3 h-3 text-amber-400" />}
                </div>
                <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                  {player.score} pts
                </span>
              </div>

              {!readOnly && players.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => handleRemovePlayer(player.id, e)}
                  className="text-slate-500 hover:text-rose-400 p-0.5 ml-1 transition-colors"
                  title="Retirer le joueur"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
