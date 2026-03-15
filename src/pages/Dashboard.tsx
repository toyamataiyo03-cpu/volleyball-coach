import { Users, Trophy, TrendingUp, Volleyball, Play, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { POSITION_COLORS, POSITION_SHORT } from '../types';
import { getServeRate, getAttackEfficiency, getReceiveRate } from '../utils/volleyball';

export function Dashboard() {
  const { players, matches, teamName, setActivePage, createMatch, setCurrentMatch } = useAppStore();

  const activeMatch = matches.find((m) => m.status === 'active');
  const recentMatches = matches.slice(0, 5);
  const totalWins = matches.flatMap((m) => m.sets).filter((s) => s.winner === 'my').length;
  const totalSets = matches.flatMap((m) => m.sets).length;

  // Top performers
  const topServer = [...players].sort((a, b) => getServeRate(b.stats) - getServeRate(a.stats))[0];
  const topAttacker = [...players].filter((p) => p.stats.attackAttempts > 10).sort((a, b) => getAttackEfficiency(b.stats) - getAttackEfficiency(a.stats))[0];
  const topReceiver = [...players].filter((p) => p.stats.receiveAttempts > 10).sort((a, b) => getReceiveRate(b.stats) - getReceiveRate(a.stats))[0];

  const starters = players.filter((p) => !p.isLibero).slice(0, 6);
  const liberos = players.filter((p) => p.isLibero);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 flex-shrink-0 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">{teamName}</h1>
            <p className="text-slate-400 text-sm mt-0.5">バレーボール戦術管理システム</p>
          </div>
          <button
            onClick={() => {
              const id = createMatch('対戦相手');
              setCurrentMatch(id);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold transition-colors"
          >
            <Play size={16} />
            試合開始
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Active match banner */}
        {activeMatch && (
          <div
            className="bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-emerald-500/20 transition-colors"
            onClick={() => { setCurrentMatch(activeMatch.id); setActivePage('match'); }}
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
              <div>
                <p className="text-emerald-400 font-bold text-sm">● LIVE試合中</p>
                <p className="text-white font-medium">vs {activeMatch.opponent}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-white">
                {activeMatch.myScore} <span className="text-slate-500">-</span> {activeMatch.opponentScore}
              </span>
              <ChevronRight size={20} className="text-emerald-400" />
            </div>
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <Users size={20} className="text-blue-400" />
              <span className="text-xs text-slate-500">登録選手</span>
            </div>
            <div className="text-3xl font-black text-white">{players.length}</div>
            <div className="text-xs text-slate-400 mt-1">
              リベロ {liberos.length}名
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <Trophy size={20} className="text-yellow-400" />
              <span className="text-xs text-slate-500">試合数</span>
            </div>
            <div className="text-3xl font-black text-white">{matches.length}</div>
            <div className="text-xs text-slate-400 mt-1">
              アクティブ {matches.filter((m) => m.status === 'active').length}試合
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp size={20} className="text-emerald-400" />
              <span className="text-xs text-slate-500">セット勝率</span>
            </div>
            <div className="text-3xl font-black text-white">
              {totalSets > 0 ? Math.round((totalWins / totalSets) * 100) : 0}%
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {totalWins}勝 {totalSets - totalWins}敗
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <Volleyball size={20} className="text-purple-400" />
              <span className="text-xs text-slate-500">登録ポジション</span>
            </div>
            <div className="text-3xl font-black text-white">
              {new Set(players.map((p) => p.position)).size}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              全{players.filter((p) => !p.isLibero).length}人が使用可能
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top performers */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-sm font-bold text-white">トップパフォーマー</h2>
            </div>
            <div className="divide-y divide-slate-700">
              {[
                { label: 'サーブ成功率', player: topServer, value: topServer ? `${getServeRate(topServer.stats)}%` : '-', color: 'text-yellow-400' },
                { label: 'アタック決定率', player: topAttacker, value: topAttacker ? `${getAttackEfficiency(topAttacker.stats)}%` : '-', color: 'text-blue-400' },
                { label: 'レセプション', player: topReceiver, value: topReceiver ? `${getReceiveRate(topReceiver.stats)}%` : '-', color: 'text-emerald-400' },
              ].map(({ label, player, value, color }) => (
                <div key={label} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    {player ? (
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${POSITION_COLORS[player.position]}`}>
                        {player.number}
                      </span>
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-500">-</span>
                    )}
                    <div>
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="text-sm font-bold text-white">{player?.name ?? '-'}</p>
                    </div>
                  </div>
                  <span className={`text-xl font-black ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Current roster */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">ロースター</h2>
              <button onClick={() => setActivePage('team')} className="text-xs text-emerald-400 hover:text-emerald-300">
                全員表示 →
              </button>
            </div>
            <div className="p-3 space-y-1.5">
              {starters.map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${POSITION_COLORS[p.position]}`}>
                    {p.number}
                  </span>
                  <span className="text-sm text-white flex-1">{p.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full bg-current/10 ${POSITION_COLORS[p.position].replace('bg-', 'text-').replace('-500', '-400')}`}>
                    {POSITION_SHORT[p.position]}
                  </span>
                </div>
              ))}
              {liberos.map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                    {p.number}
                  </span>
                  <span className="text-sm text-white flex-1">{p.name}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400">L</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent matches */}
        {recentMatches.length > 0 && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">最近の試合</h2>
              <button onClick={() => setActivePage('match')} className="text-xs text-emerald-400 hover:text-emerald-300">
                全試合 →
              </button>
            </div>
            <div className="divide-y divide-slate-700">
              {recentMatches.map((m) => {
                const myWins = m.sets.filter((s) => s.winner === 'my').length;
                const oppWins = m.sets.filter((s) => s.winner === 'opponent').length;
                const statusColors: Record<string, string> = {
                  active: 'text-emerald-400',
                  setup: 'text-yellow-400',
                  finished: myWins > oppWins ? 'text-emerald-400' : 'text-red-400',
                };
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 hover:bg-slate-750 cursor-pointer"
                    onClick={() => { setCurrentMatch(m.id); setActivePage('match'); }}
                  >
                    <div>
                      <p className="text-white font-medium text-sm">vs {m.opponent}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(m.date).toLocaleDateString('ja-JP')}
                        {m.venue && ` · ${m.venue}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {m.sets.length > 0 && (
                        <span className={`font-black text-lg ${statusColors[m.status]}`}>
                          {myWins}-{oppWins}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        m.status === 'active' ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' :
                        m.status === 'setup' ? 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10' :
                        'text-slate-400 border-slate-600 bg-slate-700/50'
                      }`}>
                        {m.status === 'active' ? 'LIVE' : m.status === 'setup' ? '準備中' : '終了'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
