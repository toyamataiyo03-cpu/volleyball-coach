import { useState } from 'react';
import {
  UserPlus,
  Pencil,
  Trash2,
  Search,
  ChevronUp,
  ChevronDown,
  Ruler,
  StickyNote,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Player, PlayerPosition } from '../types';
import { POSITION_COLORS, POSITION_SHORT, POSITION_TEXT_COLORS } from '../types';
import { Modal } from '../components/UI/Modal';
import { PlayerForm } from '../components/Player/PlayerForm';
import {
  getServeRate,
  getAttackEfficiency,
  getReceiveRate,
  getBlockPerSet,
  getServeAceRate,
} from '../utils/volleyball';

type SortField = 'name' | 'number' | 'position' | 'serve' | 'attack' | 'receive';

export function TeamManagement() {
  const { players, addPlayer, updatePlayer, deletePlayer } = useAppStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Player | null>(null);
  const [search, setSearch] = useState('');
  const [filterPos, setFilterPos] = useState<PlayerPosition | 'ALL'>('ALL');
  const [sortField, setSortField] = useState<SortField>('number');
  const [sortAsc, setSortAsc] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const positions: PlayerPosition[] = ['S', 'OH', 'MB', 'OP', 'L'];

  const filtered = players
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.number.toString().includes(search);
      const matchesPos = filterPos === 'ALL' || p.position === filterPos;
      return matchesSearch && matchesPos;
    })
    .sort((a, b) => {
      let val = 0;
      switch (sortField) {
        case 'name': val = a.name.localeCompare(b.name); break;
        case 'number': val = a.number - b.number; break;
        case 'position': val = a.position.localeCompare(b.position); break;
        case 'serve': val = getServeRate(a.stats) - getServeRate(b.stats); break;
        case 'attack': val = getAttackEfficiency(a.stats) - getAttackEfficiency(b.stats); break;
        case 'receive': val = getReceiveRate(a.stats) - getReceiveRate(b.stats); break;
      }
      return sortAsc ? val : -val;
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc((v) => !v);
    else { setSortField(field); setSortAsc(false); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp size={12} className="opacity-20" />;
    return sortAsc ? <ChevronUp size={12} className="text-emerald-400" /> : <ChevronDown size={12} className="text-emerald-400" />;
  };

  const StatBar = ({ value, max = 100, color = 'bg-emerald-500' }: { value: number; max?: number; color?: string }) => (
    <div className="w-full bg-slate-700 rounded-full h-1.5 mt-0.5">
      <div
        className={`h-1.5 rounded-full ${color} transition-all`}
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      />
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-900 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">チーム管理</h1>
            <p className="text-slate-400 text-sm mt-1">{players.length}名登録済み</p>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold transition-colors"
          >
            <UserPlus size={18} />
            <span>選手登録</span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="名前・番号で検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setFilterPos('ALL')}
              className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                filterPos === 'ALL'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              ALL
            </button>
            {positions.map((pos) => (
              <button
                key={pos}
                onClick={() => setFilterPos(pos === filterPos ? 'ALL' : pos)}
                className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                  filterPos === pos
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Player List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500">
            <p className="text-lg">選手が見つかりません</p>
            <p className="text-sm mt-1">「選手登録」ボタンから追加してください</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Sort header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-slate-500">
              <button onClick={() => handleSort('number')} className="col-span-1 flex items-center gap-1 hover:text-white">
                # <SortIcon field="number" />
              </button>
              <button onClick={() => handleSort('name')} className="col-span-3 flex items-center gap-1 hover:text-white">
                名前 <SortIcon field="name" />
              </button>
              <button onClick={() => handleSort('position')} className="col-span-2 flex items-center gap-1 hover:text-white">
                POS <SortIcon field="position" />
              </button>
              <button onClick={() => handleSort('serve')} className="col-span-2 flex items-center gap-1 hover:text-white">
                サーブ <SortIcon field="serve" />
              </button>
              <button onClick={() => handleSort('attack')} className="col-span-2 flex items-center gap-1 hover:text-white">
                攻撃 <SortIcon field="attack" />
              </button>
              <button onClick={() => handleSort('receive')} className="col-span-2 flex items-center gap-1 hover:text-white">
                レセプ <SortIcon field="receive" />
              </button>
            </div>

            {filtered.map((player) => {
              const serveRate = getServeRate(player.stats);
              const attackRate = getAttackEfficiency(player.stats);
              const receiveRate = getReceiveRate(player.stats);
              const aceRate = getServeAceRate(player.stats);
              const blockPerSet = getBlockPerSet(player.stats);
              const isExpanded = expandedId === player.id;

              return (
                <div
                  key={player.id}
                  className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
                >
                  {/* Main row */}
                  <div
                    className="grid grid-cols-12 gap-2 items-center p-4 cursor-pointer hover:bg-slate-750"
                    onClick={() => setExpandedId(isExpanded ? null : player.id)}
                  >
                    {/* Number */}
                    <div className="col-span-1">
                      <span
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-white font-bold text-sm ${POSITION_COLORS[player.position]}`}
                      >
                        {player.number}
                      </span>
                    </div>

                    {/* Name & Position */}
                    <div className="col-span-3">
                      <div className="text-white font-medium text-sm">{player.name}</div>
                      <div className={`text-xs ${POSITION_TEXT_COLORS[player.position]}`}>
                        {POSITION_SHORT[player.position]}
                        {player.isLibero && ' (L)'}
                        {player.dominant === 'left' && ' 左利き'}
                      </div>
                    </div>

                    {/* Position label */}
                    <div className="col-span-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${POSITION_TEXT_COLORS[player.position]} border-current bg-current/10`}>
                        {POSITION_SHORT[player.position]}
                      </span>
                    </div>

                    {/* Serve rate */}
                    <div className="col-span-2">
                      <div className="text-sm font-bold text-white">{serveRate}%</div>
                      <StatBar
                        value={serveRate}
                        color={serveRate >= 80 ? 'bg-emerald-500' : serveRate >= 65 ? 'bg-yellow-500' : 'bg-red-500'}
                      />
                    </div>

                    {/* Attack rate */}
                    <div className="col-span-2">
                      <div className="text-sm font-bold text-white">
                        {player.position === 'L' ? '-' : `${attackRate}%`}
                      </div>
                      {player.position !== 'L' && (
                        <StatBar
                          value={attackRate}
                          color={attackRate >= 50 ? 'bg-emerald-500' : attackRate >= 35 ? 'bg-yellow-500' : 'bg-red-500'}
                        />
                      )}
                    </div>

                    {/* Receive rate */}
                    <div className="col-span-2">
                      <div className="text-sm font-bold text-white">{receiveRate > 0 ? `${receiveRate}%` : '-'}</div>
                      {receiveRate > 0 && (
                        <StatBar
                          value={receiveRate}
                          color={receiveRate >= 70 ? 'bg-emerald-500' : receiveRate >= 55 ? 'bg-yellow-500' : 'bg-red-500'}
                        />
                      )}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-slate-700 p-4 bg-slate-900/50">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {/* Serve detail */}
                        <div className="bg-slate-800 rounded-lg p-3">
                          <p className="text-xs text-yellow-400 font-bold mb-2">サーブ詳細</p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between text-slate-300">
                              <span>総本数</span><span className="font-bold">{player.stats.serveAttempts}</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                              <span>エース</span><span className="font-bold text-emerald-400">{player.stats.serveAce} ({aceRate}%)</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                              <span>ミス</span><span className="font-bold text-red-400">{player.stats.serveFault}</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                              <span>成功率</span><span className="font-bold text-white">{serveRate}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Attack detail */}
                        <div className="bg-slate-800 rounded-lg p-3">
                          <p className="text-xs text-blue-400 font-bold mb-2">アタック詳細</p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between text-slate-300">
                              <span>総本数</span><span className="font-bold">{player.stats.attackAttempts}</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                              <span>決定</span><span className="font-bold text-emerald-400">{player.stats.attackKill} ({attackRate}%)</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                              <span>ミス</span><span className="font-bold text-red-400">{player.stats.attackFault}</span>
                            </div>
                          </div>
                        </div>

                        {/* Receive detail */}
                        <div className="bg-slate-800 rounded-lg p-3">
                          <p className="text-xs text-emerald-400 font-bold mb-2">レセプション</p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between text-slate-300">
                              <span>総本数</span><span className="font-bold">{player.stats.receiveAttempts}</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                              <span>成功</span><span className="font-bold text-emerald-400">{player.stats.receiveGood} ({receiveRate}%)</span>
                            </div>
                          </div>
                        </div>

                        {/* Other */}
                        <div className="bg-slate-800 rounded-lg p-3">
                          <p className="text-xs text-purple-400 font-bold mb-2">その他</p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between text-slate-300">
                              <span>ブロック/試</span><span className="font-bold">{blockPerSet}</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                              <span>ディグ</span><span className="font-bold">{player.stats.dig}</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                              <span>出場試合</span><span className="font-bold">{player.stats.matchesPlayed}</span>
                            </div>
                            {player.height && (
                              <div className="flex justify-between text-slate-300">
                                <span className="flex items-center gap-1"><Ruler size={10} />身長</span>
                                <span className="font-bold">{player.height}cm</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {player.notes && (
                        <div className="flex items-start gap-2 text-sm text-slate-400 mb-4">
                          <StickyNote size={14} className="flex-shrink-0 mt-0.5" />
                          <span>{player.notes}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditPlayer(player); }}
                          className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
                        >
                          <Pencil size={14} />
                          編集
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(player); }}
                          className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm border border-red-500/30 transition-colors"
                        >
                          <Trash2 size={14} />
                          削除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Player Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="新規選手登録" size="lg">
        <PlayerForm
          onSubmit={(data) => {
            addPlayer(data);
            setIsAddOpen(false);
          }}
          onCancel={() => setIsAddOpen(false)}
        />
      </Modal>

      {/* Edit Player Modal */}
      <Modal isOpen={!!editPlayer} onClose={() => setEditPlayer(null)} title="選手情報編集" size="lg">
        {editPlayer && (
          <PlayerForm
            initialData={editPlayer}
            onSubmit={(data) => {
              updatePlayer({ ...editPlayer, ...data });
              setEditPlayer(null);
            }}
            onCancel={() => setEditPlayer(null)}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="選手を削除" size="sm">
        {deleteTarget && (
          <div>
            <p className="text-slate-300 mb-4">
              <span className="text-white font-bold">{deleteTarget.name}</span> を削除しますか？この操作は取り消せません。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-medium"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  deletePlayer(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="flex-1 py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl font-bold"
              >
                削除する
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
