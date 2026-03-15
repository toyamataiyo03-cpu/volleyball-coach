import type { Player, Match } from '../../types';
import { POSITION_COLORS, POSITION_SHORT } from '../../types';

interface CourtViewProps {
  match: Match;
  players: Player[];
  onSlotClick?: (slot: number, player: Player | null) => void;
  selectedSlot?: number | null;
  isSetup?: boolean;
}

// Court layout visual positions
// Row 0 (front, near net): slots [3, 2, 1] → positions 4, 3, 2
// Row 1 (back): slots [4, 5, 0] → positions 5, 6, 1
const GRID: { slot: number; label: string }[][] = [
  [
    { slot: 3, label: '④' },
    { slot: 2, label: '③' },
    { slot: 1, label: '②' },
  ],
  [
    { slot: 4, label: '⑤' },
    { slot: 5, label: '⑥' },
    { slot: 0, label: '①🏐' },
  ],
];

export function CourtView({
  match,
  players,
  onSlotClick,
  selectedSlot,
  isSetup = false,
}: CourtViewProps) {
  const playerMap = new Map(players.map((p) => [p.id, p]));

  const getPlayerInSlot = (slot: number): Player | null => {
    const id = match.lineup[slot];
    return id ? (playerMap.get(id) ?? null) : null;
  };

  const isServer = (slot: number) => slot === 0;
  const isFrontRow = (slot: number) => slot === 1 || slot === 2 || slot === 3;

  return (
    <div className="flex flex-col items-center w-full">
      {/* Net indicator */}
      <div className="w-full max-w-md mb-1">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-[3px] bg-gradient-to-r from-transparent via-white/60 to-transparent rounded" />
          <span className="text-xs text-white/50 font-medium">ネット</span>
          <div className="flex-1 h-[3px] bg-gradient-to-r from-transparent via-white/60 to-transparent rounded" />
        </div>
      </div>

      {/* Court grid */}
      <div className="w-full max-w-md bg-green-800 rounded-xl overflow-hidden border-2 border-green-600 court-shadow">
        {GRID.map((row, rowIdx) => (
          <div key={rowIdx} className={`grid grid-cols-3 ${rowIdx === 0 ? 'border-b-2 border-green-600/70' : ''}`}>
            {row.map(({ slot, label }) => {
              const player = getPlayerInSlot(slot);
              const isSelected = selectedSlot === slot;
              const isServing = isServer(slot);
              const isFront = isFrontRow(slot);

              return (
                <button
                  key={slot}
                  onClick={() => onSlotClick?.(slot, player)}
                  disabled={!onSlotClick}
                  className={`
                    relative p-3 flex flex-col items-center justify-center min-h-[110px]
                    border border-green-700/50 transition-all duration-150
                    ${isSelected ? 'bg-emerald-400/30 border-emerald-400' : 'hover:bg-green-700/40'}
                    ${isServing ? 'bg-yellow-500/10' : ''}
                    ${isFront ? 'bg-green-700/20' : ''}
                    ${!onSlotClick ? 'cursor-default' : 'cursor-pointer'}
                  `}
                >
                  {/* Position number */}
                  <span className={`text-xs font-bold mb-2 ${isServing ? 'text-yellow-400' : 'text-green-300/60'}`}>
                    {label}
                  </span>

                  {player ? (
                    <div className="flex flex-col items-center gap-1">
                      {/* Player circle */}
                      <div
                        className={`
                          w-11 h-11 rounded-full flex items-center justify-center
                          text-white font-bold text-lg shadow-lg border-2
                          ${player.isLibero
                            ? 'bg-orange-500 border-orange-300'
                            : POSITION_COLORS[player.position] + ' border-white/30'
                          }
                          ${isServing ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-green-800' : ''}
                        `}
                      >
                        {player.number}
                      </div>
                      {/* Player name */}
                      <span className="text-white text-xs font-medium text-center leading-tight">
                        {player.name.split(' ')[0]}
                      </span>
                      {/* Position badge */}
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-black/30 ${
                        player.isLibero ? 'text-orange-300' : 'text-white/70'
                      }`}>
                        {POSITION_SHORT[player.position]}
                        {player.isLibero && ' L'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`
                          w-11 h-11 rounded-full border-2 border-dashed flex items-center justify-center
                          ${isSetup ? 'border-emerald-500/60 text-emerald-500/60' : 'border-green-600/40 text-green-600/40'}
                        `}
                      >
                        {isSetup ? '+' : ''}
                      </div>
                      {isSetup && (
                        <span className="text-emerald-500/60 text-[10px]">タップ</span>
                      )}
                    </div>
                  )}

                  {/* Front row indicator */}
                  {isFront && !player && (
                    <div className="absolute bottom-1 right-1">
                      <span className="text-[9px] text-green-400/40">前衛</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-yellow-500/30 border border-yellow-400 inline-block" />
          サーバー
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-700/40 border border-green-600 inline-block" />
          前衛
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-orange-500 border border-orange-300 inline-block" />
          リベロ
        </span>
      </div>
    </div>
  );
}
