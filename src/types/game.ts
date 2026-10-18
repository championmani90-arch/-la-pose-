export type GameModeId = 'CHALLENGES' | '421' | 'FARKLE' | 'FREE_DICE';

export type ChallengeCategory = 
  | 'VERITE'        // Vérité piquante / confidence
  | 'DILEMME'       // Choix cornélien
  | 'ANECDOTE'      // Histoire vécue à raconter
  | 'DEFI'          // Défi 30 secondes / mini-gage
  | 'DEBAT'         // Mini-débat enragé de pause
  | 'GAGE_EXPRESS'; // Action immédiate ou tournée de café

export type ChallengePack = 'BUREAU_CAFE' | 'APERO_POTES' | 'SANS_FILTRE';

export interface ChallengeItem {
  id: string;
  category: ChallengeCategory;
  pack: ChallengePack;
  text: string;
  timerSeconds?: number;
  intensity: 1 | 2 | 3; // 1: chill, 2: piquant, 3: chaud
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  farkleBanked: number;
  farkleTurnScore: number;
  challengesCompleted: number;
}

export type DiceTheme = 'ivory' | 'wood' | 'neon';

export interface DiceState {
  id: number;
  value: number;
  isRolling: boolean;
  isKept: boolean;
}
