import { useState, useMemo } from 'react';
import {
  Plus,
  Play,
  RotateCcw,
  Clock,
  Check,
  X,
  Calendar,
  MapPin,
  Trophy,
  ArrowLeftRight,
  Volleyball,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Match } from '../types';
import { POSITION_COLORS, POSITION_SHORT } from '../types';
import { CourtView } from '../components/Court/CourtView';
import { AIPanel } from '../components/Match/AIPanel';
import { Modal } from '../components/UI/Modal';
import { generateAISuggestions } from '../utils/aiEngine';


// ─── Match List / Create ─────────────────────────────────────────────────────
function MatchList() {
  const { matches, createMatch, deleteMatch, setCurrentMatch } = useAppStore();
  const [isCreating, setIsCreating] = useState(false);
  const [opponent, setOpponent] = useState('');
  const [venue, setVenue] = useState('');

  const handleCreate = () => {
    if (!opponent.trim()) return;
    createMatch(opponent.trim(), venue.trim() || undefined);
    setOpponent('');
    setVenue('');
    setIsCreating(false);
  };

  const statusLabel: Record<string, string> = {
    setup: 'セットアップ',
    active: '試合中',
    finished: '終了',
  };
  const statusColor: Record<string, string> = {
    setup: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    finished: 'text-slate-400 bg-slate-700/50 border-slate-600',
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">試合管理</h1>
            <p className="text-slate-400 text-sm mt-1">{matches.length}試合</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold transition-colors"
          >
            <Plus size={18} />
            新規試合
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500">
            <Trophy size={48} className="mb-3 opacity-30" />
            <p className="text-lg">試合データなし</p>
            <p className="text-sm mt-1">「新規試合」ボタンから作成してください</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => {
              const setWins = match.sets.filter((s) => s.winner === 'my').length;
              const setLosses = match.sets.filter((s) => s.winner === 'opponent').length;
              return (
                <div
                  key={match.id}
                  className="bg-slate-800 rounded-xl border border-slate-700 p-4 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColor[match.status]}`}>
                          {statusLabel[match.status]}
                        </span>
                        {match.status === 'active' && (
                          <span className="text-xs text-emerald-400 animate-pulse">● LIVE</span>
                        )}
                      </div>
                      <h3 className="text-white font-bold text-lg">vs {match.opponent}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(match.date).toLocaleDateString('ja-JP')}
                        </span>
                        {match.venue && (
                          <span className="flex items-center gap-1">
                            <MapPin size={11} />
                            {match.venue}
                          </span>
                        )}
                        {match.sets.length > 0 && (
                          <span className="font-bold text-white">
                            セット {setWins}-{setLosses}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {match.status !== 'finished' && (
                        <button
                          onClick={() => {
                            setCurrentMatch(match.id);
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-sm font-bold transition-colors"
                        >
                          {match.status === 'setup' ? <Play size={14} /> : <Volleyball size={14} />}
                          {match.status === 'setup' ? '開始' : '操作'}
                        </button>
                      )}
                      <button
                        onClick={() => deleteMatch(match.id)}
                        className="p-2 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Match Modal */}
      <Modal isOpen={isCreating} onClose={() => setIsCreating(false)} title="新規試合作成">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">相手チーム名 *</label>
            <input
              type="text"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              placeholder="例: 東京クラブ"
              autoFocus
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">会場 (任意)</label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="例: 東京体育館"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setIsCreating(false)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-medium transition-colors">
              キャンセル
            </button>
            <button
              onClick={handleCreate}
              disabled={!opponent.trim()}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors"
            >
              作成
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Match Setup ─────────────────────────────────────────────────────────────
function MatchSetup({ match }: { match: Match }) {
  const { players, setPlayerInSlot, setLibero, startMatch, setCurrentMatch } = useAppStore();
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedLiberoId, setSelectedLiberoId] = useState<string | undefined>(match.liberoPlayerId);

  const playerMap = new Map(players.map((p) => [p.id, p]));
  const onCourtIds = new Set(match.lineup.filter(Boolean) as string[]);

  const handleSlotClick = (slot: number) => {
    setSelectedSlot(slot === selectedSlot ? null : slot);
  };

  const handlePlayerSelect = (playerId: string) => {
    if (selectedSlot === null) return;
    setPlayerInSlot(selectedSlot, playerId);
    setSelectedSlot(null);
  };

  const handleLiberoSelect = (playerId: string) => {
    const newId = playerId === selectedLiberoId ? undefined : playerId;
    setSelectedLiberoId(newId);
    setLibero(newId);
  };

  const readyToStart = match.lineup.every((id) => id !== null);

  const positionLabels = ['①後衛右', '②前衛右', '③前衛中', '④前衛左', '⑤後衛左', '⑥後衛中'];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => setCurrentMatch(null)} className="text-slate-400 hover:text-white text-sm flex items-center gap-1 mb-1">
              ← 試合一覧
            </button>
            <h2 className="text-xl font-bold text-white">vs {match.opponent}</h2>
            <p className="text-slate-400 text-sm">スターティングメンバーを設定</p>
          </div>
          <button
            onClick={startMatch}
            disabled={!readyToStart}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors"
          >
            <Play size={18} />
            試合開始
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex gap-0">
        {/* Left: Court */}
        <div className="w-1/2 p-4 overflow-y-auto border-r border-slate-800">
          <h3 className="text-sm font-bold text-slate-400 mb-3">コートポジション</h3>
          <p className="text-xs text-slate-500 mb-3">
            {selectedSlot !== null
              ? `→ ポジション ${selectedSlot + 1} に選手を選んでください`
              : 'ポジションをタップして選手を配置'}
          </p>
          <CourtView
            match={match}
            players={players}
            onSlotClick={handleSlotClick}
            selectedSlot={selectedSlot}
            isSetup
          />

          {/* Position legend */}
          <div className="mt-4 space-y-1">
            {positionLabels.map((label, idx) => {
              const player = match.lineup[idx] ? playerMap.get(match.lineup[idx]!) : null;
              return (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 w-20">{label}</span>
                  {player ? (
                    <span className="text-white">#{player.number} {player.name}</span>
                  ) : (
                    <span className="text-slate-600">未設定</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Player selector */}
        <div className="w-1/2 p-4 overflow-y-auto">
          <h3 className="text-sm font-bold text-slate-400 mb-3">選手選択</h3>

          {/* Libero selector */}
          <div className="mb-4">
            <p className="text-xs font-bold text-orange-400 mb-2">リベロ指定</p>
            <div className="space-y-1">
              {players.filter((p) => p.isLibero).map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleLiberoSelect(p.id)}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg border text-sm transition-all ${
                    selectedLiberoId === p.id
                      ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                    {p.number}
                  </span>
                  <span>{p.name}</span>
                  {selectedLiberoId === p.id && <Check size={14} className="ml-auto text-orange-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* All players */}
          <p className="text-xs font-bold text-slate-400 mb-2">スターター選択</p>
          <div className="space-y-1">
            {players
              .filter((p) => !p.isLibero)
              .sort((a, b) => a.number - b.number)
              .map((p) => {
                const isOnCourt = onCourtIds.has(p.id);
                const courtSlot = match.lineup.indexOf(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => !isOnCourt && selectedSlot !== null && handlePlayerSelect(p.id)}
                    disabled={selectedSlot === null || isOnCourt}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg border text-sm transition-all ${
                      isOnCourt
                        ? 'bg-slate-900/50 border-slate-700 text-slate-500 cursor-default'
                        : selectedSlot !== null
                        ? 'bg-slate-800 border-emerald-500/50 text-white hover:bg-emerald-500/10 cursor-pointer'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${POSITION_COLORS[p.position]}`}
                    >
                      {p.number}
                    </span>
                    <span className="flex-1 text-left">{p.name}</span>
                    <span className="text-xs text-slate-500">{POSITION_SHORT[p.position]}</span>
                    {isOnCourt && (
                      <span className="text-xs text-emerald-400">
                        P{courtSlot + 1}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Active Match ─────────────────────────────────────────────────────────────
function ActiveMatch({ match }: { match: Match }) {
  const { players, rotate, scorePoint, makeSubstitution, makeLiberoSwap, useTimeout, endSet, finishMatch, setCurrentMatch } = useAppStore();
  const [subOutSlot, setSubOutSlot] = useState<number | null>(null);
  const [subInPlayerId, setSubInPlayerId] = useState<string | null>(null);
  const [showEndSetModal, setShowEndSetModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);

  const playerMap = new Map(players.map((p) => [p.id, p]));
  const onCourtIds = new Set(match.lineup.filter(Boolean) as string[]);

  const aiSuggestions = useMemo(
    () => generateAISuggestions(match, players),
    [match.myScore, match.opponentScore, match.lineup, match.subsUsed]
  );

  const benchPlayers = players.filter(
    (p) => !onCourtIds.has(p.id) && p.id !== match.liberoPlayerId
  );
  const libero = match.liberoPlayerId ? playerMap.get(match.liberoPlayerId) : null;

  const handleSlotClick = (slot: number) => {
    if (subOutSlot === null) {
      setSubOutSlot(slot);
      setSubInPlayerId(null);
    } else if (subOutSlot === slot) {
      setSubOutSlot(null);
      setSubInPlayerId(null);
    }
  };

  const confirmSubstitution = () => {
    if (subOutSlot === null || !subInPlayerId) return;
    const outPlayer = match.lineup[subOutSlot];
    if (!outPlayer) return;

    // Check if swapping libero
    if (subInPlayerId === match.liberoPlayerId) {
      makeLiberoSwap(true, outPlayer, subOutSlot);
    } else if (match.liberoOnCourt && subOutSlot === match.liberoSwappedSlot) {
      makeLiberoSwap(false, subInPlayerId, subOutSlot);
    } else {
      makeSubstitution(subInPlayerId, outPlayer, subOutSlot);
    }
    setSubOutSlot(null);
    setSubInPlayerId(null);
  };

  const setScores = match.sets.map((s) => `${s.myScore}-${s.opponentScore}`).join(' | ');
  const mySetWins = match.sets.filter((s) => s.winner === 'my').length;
  const oppSetWins = match.sets.filter((s) => s.winner === 'opponent').length;

  return (
    <div className="flex flex-col h-full">
      {/* Match header */}
      <div className="p-3 border-b border-slate-800 bg-slate-950 flex-shrink-0">
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrentMatch(null)} className="text-slate-400 hover:text-white text-xs flex items-center gap-1">
            ← 一覧
          </button>
          <div className="text-center">
            <span className="text-white font-bold text-sm">vs {match.opponent}</span>
            <div className="text-xs text-emerald-400">
              セット {mySetWins}-{oppSetWins}
              {setScores && <span className="text-slate-500 ml-2">({setScores})</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEndSetModal(true)}
              className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 rounded-lg text-xs font-bold"
            >
              セット終了
            </button>
            <button
              onClick={() => setShowFinishModal(true)}
              className="px-2 py-1 bg-slate-700 text-slate-400 rounded-lg text-xs"
            >
              試合終了
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Left: Bench */}
        <div className="w-44 flex-shrink-0 border-r border-slate-800 flex flex-col bg-slate-950/50">
          <div className="p-2 border-b border-slate-800">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ベンチ</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {benchPlayers.map((p) => {
              const isSelected = subInPlayerId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    if (subOutSlot !== null) {
                      setSubInPlayerId(isSelected ? null : p.id);
                    }
                  }}
                  disabled={subOutSlot === null}
                  className={`w-full flex items-center gap-1.5 p-2 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500 text-white'
                      : subOutSlot !== null
                      ? 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500 cursor-pointer'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 cursor-default'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${POSITION_COLORS[p.position]}`}>
                    {p.number}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{p.name.split(' ')[0]}</p>
                    <p className="text-[10px] text-slate-500">{POSITION_SHORT[p.position]}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Libero section */}
          {libero && (
            <div className="p-2 border-t border-slate-800">
              <p className="text-[10px] font-bold text-orange-400 mb-1">リベロ</p>
              <button
                onClick={() => {
                  if (subOutSlot !== null) {
                    setSubInPlayerId(subInPlayerId === libero.id ? null : libero.id);
                  }
                }}
                disabled={subOutSlot === null || match.liberoOnCourt}
                className={`w-full flex items-center gap-1.5 p-2 rounded-lg border transition-all ${
                  subInPlayerId === libero.id
                    ? 'bg-orange-500/20 border-orange-500'
                    : match.liberoOnCourt
                    ? 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-default'
                    : subOutSlot !== null
                    ? 'bg-slate-800 border-orange-500/40 text-slate-300 hover:border-orange-500 cursor-pointer'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 cursor-default'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                  {libero.number}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-300 truncate">{libero.name.split(' ')[0]}</p>
                  <p className="text-[10px] text-orange-400">{match.liberoOnCourt ? 'コート内' : 'L'}</p>
                </div>
              </button>
            </div>
          )}

          {/* Sub confirmation */}
          {subOutSlot !== null && (
            <div className="p-2 border-t border-slate-700 bg-slate-900">
              {subInPlayerId ? (
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400">
                    P{subOutSlot + 1} の選手と交代
                  </p>
                  <button
                    onClick={confirmSubstitution}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <Check size={12} />
                    交代実行
                  </button>
                  <button
                    onClick={() => { setSubOutSlot(null); setSubInPlayerId(null); }}
                    className="w-full py-1.5 bg-slate-700 text-slate-400 rounded-lg text-xs"
                  >
                    キャンセル
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-[10px] text-emerald-400">P{subOutSlot + 1} 選択済</p>
                  <p className="text-[10px] text-slate-500">ベンチから選手を選択</p>
                  <button
                    onClick={() => setSubOutSlot(null)}
                    className="mt-1 w-full py-1.5 bg-slate-700 text-slate-400 rounded-lg text-xs"
                  >
                    取消
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center: Court + Controls */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
          {/* Score */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-3">
            <div className="flex items-center justify-around">
              {/* My team */}
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">自チーム</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scorePoint('my')}
                    className="w-10 h-10 bg-emerald-500 hover:bg-emerald-400 rounded-full text-white text-xl font-bold flex items-center justify-center shadow-lg transition-colors"
                  >
                    +
                  </button>
                  <span className="text-4xl font-black text-white w-14 text-center">{match.myScore}</span>
                  <button
                    onClick={() => scorePoint('my')}
                    className="w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded-full text-white text-xs flex items-center justify-center"
                    onClickCapture={(e) => {
                      e.stopPropagation();
                      // We need a decrement - for now, show it's a placeholder
                    }}
                  >
                    <span className="text-[10px]">-</span>
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="text-center">
                <div className="text-slate-600 text-2xl font-light">-</div>
                <div className="text-xs text-slate-500 mt-1">
                  第{match.currentSetIndex + 1}セット
                </div>
              </div>

              {/* Opponent */}
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">{match.opponent}</p>
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-black text-white w-14 text-center">{match.opponentScore}</span>
                  <button
                    onClick={() => scorePoint('opponent')}
                    className="w-10 h-10 bg-red-500/80 hover:bg-red-500 rounded-full text-white text-xl font-bold flex items-center justify-center shadow-lg transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Court */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-400">
                {subOutSlot !== null ? `交代: ポジション${subOutSlot + 1}をタップ済` : 'コートをタップして交代選択'}
              </p>
              <div className="flex items-center gap-1">
                <ArrowLeftRight size={12} className="text-slate-500" />
                <span className="text-xs text-slate-500">
                  交代 {match.subsUsed}/{match.maxSubs}
                </span>
              </div>
            </div>
            <CourtView
              match={match}
              players={players}
              onSlotClick={handleSlotClick}
              selectedSlot={subOutSlot}
            />
          </div>

          {/* Rotate button */}
          <button
            onClick={rotate}
            className="w-full py-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 hover:border-blue-500/60 text-blue-400 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm"
          >
            <RotateCcw size={18} />
            サイドアウト → ローテーション
          </button>
        </div>

        {/* Right: Controls + AI */}
        <div className="w-56 flex-shrink-0 border-l border-slate-800 overflow-y-auto p-3 flex flex-col gap-3 bg-slate-950/30">
          {/* Sub & Timeout info */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ArrowLeftRight size={12} />
                交代
              </span>
              <div className="flex gap-1">
                {Array.from({ length: match.maxSubs }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-sm ${i < match.subsUsed ? 'bg-red-500' : 'bg-emerald-500'}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock size={12} />
                タイムアウト
              </span>
              <div className="flex gap-1">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-sm ${i < (2 - match.timeoutsLeft) ? 'bg-red-500' : 'bg-yellow-500'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Timeout button */}
          <button
            onClick={useTimeout}
            disabled={match.timeoutsLeft === 0}
            className="w-full py-3 bg-yellow-500/20 hover:bg-yellow-500/30 disabled:opacity-40 disabled:cursor-not-allowed border border-yellow-500/40 text-yellow-400 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all"
          >
            <Clock size={16} />
            タイムアウト ({match.timeoutsLeft}回)
          </button>

          {/* Substitution log */}
          {match.substitutions.length > 0 && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <p className="text-xs font-bold text-slate-500 p-2 border-b border-slate-700">交代記録</p>
              <div className="p-2 space-y-1 max-h-32 overflow-y-auto">
                {match.substitutions.map((sub) => {
                  const inP = playerMap.get(sub.inPlayerId);
                  const outP = playerMap.get(sub.outPlayerId);
                  return (
                    <div key={sub.id} className="text-[10px] text-slate-400">
                      <span className="text-emerald-400">#{inP?.number}</span>
                      {' ↔ '}
                      <span className="text-red-400">#{outP?.number}</span>
                      <span className="text-slate-600 ml-1">@{sub.myScore}-{sub.opponentScore}</span>
                      {sub.isLiberoSwap && <span className="text-orange-400 ml-1">L</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Panel */}
          <AIPanel suggestions={aiSuggestions} />
        </div>
      </div>

      {/* End Set Modal */}
      <Modal isOpen={showEndSetModal} onClose={() => setShowEndSetModal(false)} title={`第${match.currentSetIndex + 1}セット終了`} size="sm">
        <div>
          <p className="text-slate-300 mb-2">現在のスコア:</p>
          <div className="flex items-center justify-center gap-6 text-4xl font-black mb-4">
            <span className={match.myScore > match.opponentScore ? 'text-emerald-400' : 'text-white'}>{match.myScore}</span>
            <span className="text-slate-600">-</span>
            <span className={match.opponentScore > match.myScore ? 'text-red-400' : 'text-white'}>{match.opponentScore}</span>
          </div>
          <p className="text-xs text-slate-500 text-center mb-4">
            {match.myScore > match.opponentScore ? '自チームのセット取得' : `${match.opponent}のセット取得`}
          </p>
          <div className="flex gap-3">
            <button onClick={() => setShowEndSetModal(false)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-medium transition-colors">
              戻る
            </button>
            <button
              onClick={() => {
                endSet({ my: match.myScore, opponent: match.opponentScore });
                setShowEndSetModal(false);
              }}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold transition-colors"
            >
              セット終了
            </button>
          </div>
        </div>
      </Modal>

      {/* Finish Match Modal */}
      <Modal isOpen={showFinishModal} onClose={() => setShowFinishModal(false)} title="試合終了確認" size="sm">
        <div>
          <p className="text-slate-300 mb-4">試合を終了しますか？</p>
          <div className="flex gap-3">
            <button onClick={() => setShowFinishModal(false)} className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-xl font-medium">
              戻る
            </button>
            <button
              onClick={() => {
                finishMatch();
                setShowFinishModal(false);
              }}
              className="flex-1 py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl font-bold"
            >
              終了する
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Main MatchPage ───────────────────────────────────────────────────────────
export function MatchPage() {
  const { matches, currentMatchId, setCurrentMatch } = useAppStore();
  const currentMatch = currentMatchId ? matches.find((m) => m.id === currentMatchId) : null;

  if (!currentMatch) {
    return <MatchList />;
  }

  if (currentMatch.status === 'setup') {
    return <MatchSetup match={currentMatch} />;
  }

  if (currentMatch.status === 'active') {
    return <ActiveMatch match={currentMatch} />;
  }

  // Finished
  const mySetWins = currentMatch.sets.filter((s) => s.winner === 'my').length;
  const oppSetWins = currentMatch.sets.filter((s) => s.winner === 'opponent').length;
  return (
    <div className="flex flex-col h-full items-center justify-center p-8 text-center">
      <Trophy size={64} className={`mb-4 ${mySetWins > oppSetWins ? 'text-yellow-400' : 'text-slate-500'}`} />
      <h2 className="text-2xl font-black text-white mb-1">vs {currentMatch.opponent}</h2>
      <div className="text-5xl font-black mb-4">
        <span className={mySetWins > oppSetWins ? 'text-emerald-400' : 'text-slate-400'}>{mySetWins}</span>
        <span className="text-slate-600 mx-3">-</span>
        <span className={oppSetWins > mySetWins ? 'text-red-400' : 'text-slate-400'}>{oppSetWins}</span>
      </div>
      <p className="text-slate-400 mb-6">
        {mySetWins > oppSetWins ? '勝利!' : oppSetWins > mySetWins ? '敗北' : '引き分け'}
      </p>
      <button
        onClick={() => setCurrentMatch(null)}
        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold"
      >
        試合一覧に戻る
      </button>
    </div>
  );
}
