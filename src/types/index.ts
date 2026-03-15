export type PlayerPosition = 'S' | 'OH' | 'MB' | 'OP' | 'L';

export const POSITION_LABELS: Record<PlayerPosition, string> = {
  S: 'セッター',
  OH: 'アウトサイドヒッター',
  MB: 'ミドルブロッカー',
  OP: 'オポジット',
  L: 'リベロ',
};

export const POSITION_SHORT: Record<PlayerPosition, string> = {
  S: 'S',
  OH: 'OH',
  MB: 'MB',
  OP: 'OP',
  L: 'L',
};

export const POSITION_COLORS: Record<PlayerPosition, string> = {
  S: 'bg-yellow-500',
  OH: 'bg-blue-500',
  MB: 'bg-red-500',
  OP: 'bg-purple-500',
  L: 'bg-orange-500',
};

export const POSITION_TEXT_COLORS: Record<PlayerPosition, string> = {
  S: 'text-yellow-400',
  OH: 'text-blue-400',
  MB: 'text-red-400',
  OP: 'text-purple-400',
  L: 'text-orange-400',
};

export interface PlayerStats {
  serveAttempts: number;
  serveAce: number;
  serveFault: number;
  attackAttempts: number;
  attackKill: number;
  attackFault: number;
  receiveAttempts: number;
  receiveGood: number;
  receiveFault: number;
  blockPoint: number;
  dig: number;
  matchesPlayed: number;
}

export const defaultStats = (): PlayerStats => ({
  serveAttempts: 0,
  serveAce: 0,
  serveFault: 0,
  attackAttempts: 0,
  attackKill: 0,
  attackFault: 0,
  receiveAttempts: 0,
  receiveGood: 0,
  receiveFault: 0,
  blockPoint: 0,
  dig: 0,
  matchesPlayed: 0,
});

export interface Player {
  id: string;
  name: string;
  number: number;
  position: PlayerPosition;
  isLibero: boolean;
  height?: number;
  dominant: 'right' | 'left';
  stats: PlayerStats;
  notes?: string;
}

export interface Substitution {
  id: string;
  inPlayerId: string;
  outPlayerId: string;
  courtSlot: number; // 0-5 (positions 1-6)
  myScore: number;
  opponentScore: number;
  isLiberoSwap: boolean;
  setNumber: number;
}

export interface SetRecord {
  setNumber: number;
  myScore: number;
  opponentScore: number;
  winner: 'my' | 'opponent';
}

// Court position layout: index 0 = position 1 (server), index 1 = pos 2, etc.
// Visual layout:
//  [4][3][2]  <- front row (index 3,2,1)
//  [5][6][1]  <- back row  (index 4,5,0)
export const COURT_LAYOUT = [
  // [row, col] for visual grid (0-indexed)
  [1, 2], // position 1 (back-right)
  [0, 2], // position 2 (front-right)
  [0, 1], // position 3 (front-middle)
  [0, 0], // position 4 (front-left)
  [1, 0], // position 5 (back-left)
  [1, 1], // position 6 (back-middle)
];

export interface Match {
  id: string;
  date: string;
  opponent: string;
  venue?: string;
  lineup: (string | null)[]; // 6 elements for positions 1-6 (player IDs)
  sets: SetRecord[];
  currentSetIndex: number;
  myScore: number;
  opponentScore: number;
  subsUsed: number;
  maxSubs: number;
  timeoutsLeft: number;
  status: 'setup' | 'active' | 'finished';
  substitutions: Substitution[];
  liberoPlayerId?: string;
  liberoOnCourt: boolean;
  liberoSwappedSlot?: number; // which slot libero is currently swapped into
  liberoReplacedPlayerId?: string; // who the libero replaced
}

export interface AISuggestion {
  id: string;
  priority: 'high' | 'medium' | 'low';
  type: 'substitution' | 'timeout' | 'rotation' | 'info';
  message: string;
  detail?: string;
  playerIn?: string;
  playerOut?: string;
}
