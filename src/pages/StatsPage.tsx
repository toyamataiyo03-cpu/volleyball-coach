import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { useAppStore } from '../store/useAppStore';
import type { PlayerPosition } from '../types';
import { POSITION_COLORS, POSITION_TEXT_COLORS, POSITION_SHORT, POSITION_LABELS } from '../types';
import { getServeRate, getServeAceRate, getAttackEfficiency, getAttackEff, getReceiveRate, getBlockPerSet } from '../utils/volleyball';

export function StatsPage() {
  const { players } = useAppStore();
  const [selectedPos, setSelectedPos] = useState<PlayerPosition | 'ALL'>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const positions: PlayerPosition[] = ['S', 'OH', 'MB', 'OP', 'L'];

  const filtered = players.filter(
    (p) => selectedPos === 'ALL' || p.position === selectedPos
  );

  const selectedPlayer = selectedId ? players.find((p) => p.id === selectedId) : null;

  // Chart data for bar chart
  const barData = filtered.map((p) => ({
    name: p.name.split(' ')[1] || p.name.split(' ')[0],
    number: p.number,
    サーブ成功率: getServeRate(p.stats),
    アタック決定率: p.position !== 'L' ? getAttackEfficiency(p.stats) : 0,
    レセプション: getReceiveRate(p.stats),
  }));

  // Radar data for selected player
  const radarData = selectedPlayer
    ? [
        { subject: 'サーブ', value: getServeRate(selectedPlayer.stats), fullMark: 100 },
        { subject: 'エース率', value: getServeAceRate(selectedPlayer.stats) * 3, fullMark: 100 },
        { subject: 'アタック', value: getAttackEfficiency(selectedPlayer.stats), fullMark: 100 },
        { subject: 'レセプション', value: getReceiveRate(selectedPlayer.stats), fullMark: 100 },
        { subject: 'ブロック', value: Math.min(getBlockPerSet(selectedPlayer.stats) * 10, 100), fullMark: 100 },
        { subject: 'ディグ', value: Math.min((selectedPlayer.stats.dig / Math.max(selectedPlayer.stats.matchesPlayed, 1)) * 5, 100), fullMark: 100 },
      ]
    : [];

  const StatCard = ({
    label, value, sub, color = 'text-emerald-400',
  }: { label: string; value: string; sub?: string; color?: string }) => (
    <div className="bg-slate-800/60 rounded-lg p-3">
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className={`text-xl font-black ${color}`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 flex-shrink-0">
        <h1 className="text-2xl font-bold text-white">統計</h1>
        <p className="text-slate-400 text-sm mt-1">選手のパフォーマンス分析</p>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Left: Player list */}
        <div className="w-56 flex-shrink-0 border-r border-slate-800 flex flex-col">
          {/* Position filter */}
          <div className="p-3 border-b border-slate-800">
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setSelectedPos('ALL')}
                className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all ${
                  selectedPos === 'ALL' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                ALL
              </button>
              {positions.map((pos) => (
                <button
                  key={pos}
                  onClick={() => setSelectedPos(pos === selectedPos ? 'ALL' : pos)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all ${
                    selectedPos === pos ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Player list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(selectedId === p.id ? null : p.id)}
                className={`w-full flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                  selectedId === p.id
                    ? 'bg-emerald-500/20 border-emerald-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${POSITION_COLORS[p.position]}`}>
                  {p.number}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{p.name}</p>
                  <p className={`text-[10px] ${POSITION_TEXT_COLORS[p.position]}`}>{POSITION_SHORT[p.position]}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Charts */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Selected player stats */}
          {selectedPlayer && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-black ${POSITION_COLORS[selectedPlayer.position]}`}>
                  {selectedPlayer.number}
                </span>
                <div>
                  <h2 className="text-xl font-black text-white">{selectedPlayer.name}</h2>
                  <p className={`text-sm ${POSITION_TEXT_COLORS[selectedPlayer.position]}`}>
                    {POSITION_LABELS[selectedPlayer.position]}
                    {selectedPlayer.isLibero && ' (リベロ)'}
                    {selectedPlayer.height && ` · ${selectedPlayer.height}cm`}
                    {selectedPlayer.dominant === 'left' && ' · 左利き'}
                  </p>
                </div>
                {selectedPlayer.notes && (
                  <p className="text-xs text-slate-500 ml-2 flex-1 italic">"{selectedPlayer.notes}"</p>
                )}
              </div>

              <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
                <StatCard label="サーブ成功率" value={`${getServeRate(selectedPlayer.stats)}%`} sub={`${selectedPlayer.stats.serveAttempts}本`} color="text-yellow-400" />
                <StatCard label="エース率" value={`${getServeAceRate(selectedPlayer.stats)}%`} sub={`${selectedPlayer.stats.serveAce}本`} color="text-yellow-300" />
                <StatCard label="アタック決定率" value={selectedPlayer.position !== 'L' ? `${getAttackEfficiency(selectedPlayer.stats)}%` : '-'} sub={selectedPlayer.position !== 'L' ? `${selectedPlayer.stats.attackAttempts}本` : ''} color="text-blue-400" />
                <StatCard label="攻撃効率" value={selectedPlayer.position !== 'L' ? `${getAttackEff(selectedPlayer.stats)}%` : '-'} sub="(決定-ミス)/試" color="text-blue-300" />
                <StatCard label="レセプション" value={`${getReceiveRate(selectedPlayer.stats)}%`} sub={`${selectedPlayer.stats.receiveAttempts}本`} color="text-emerald-400" />
                <StatCard label="ブロック/試合" value={`${getBlockPerSet(selectedPlayer.stats)}`} sub={`計${selectedPlayer.stats.blockPoint}本`} color="text-purple-400" />
              </div>

              {/* Radar chart */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <h3 className="text-sm font-bold text-slate-300 mb-3">レーダー分析</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 9 }} />
                      <Radar name="stats" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Team comparison chart */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <h3 className="text-sm font-bold text-slate-300 mb-3">
              {selectedPos === 'ALL' ? '全選手' : `${POSITION_SHORT[selectedPos]} ポジション`}比較
            </h3>
            {barData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                      itemStyle={{ color: '#94a3b8' }}
                    />
                    <Bar dataKey="サーブ成功率" fill="#eab308" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="アタック決定率" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="レセプション" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-slate-500 text-sm text-center py-8">選手データなし</p>
            )}
            <div className="flex gap-4 mt-3 justify-center">
              {[
                { color: 'bg-yellow-500', label: 'サーブ成功率' },
                { color: 'bg-blue-500', label: 'アタック決定率' },
                { color: 'bg-emerald-500', label: 'レセプション' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-sm ${color}`} />
                  <span className="text-xs text-slate-400">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rankings table */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-sm font-bold text-slate-300">ランキング</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/50">
                  <tr>
                    {['#', '選手', 'POS', 'SRV%', 'ATK%', 'RCV%', 'BLK/T', '試合'].map((h) => (
                      <th key={h} className="text-left text-xs text-slate-500 font-medium p-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-700/50 cursor-pointer transition-colors ${selectedId === p.id ? 'bg-emerald-500/10' : ''}`}
                      onClick={() => setSelectedId(selectedId === p.id ? null : p.id)}
                    >
                      <td className="p-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${POSITION_COLORS[p.position]}`}>
                          {p.number}
                        </span>
                      </td>
                      <td className="p-3 text-white font-medium">{p.name}</td>
                      <td className="p-3">
                        <span className={`text-xs ${POSITION_TEXT_COLORS[p.position]}`}>{POSITION_SHORT[p.position]}</span>
                      </td>
                      <td className="p-3">
                        <span className={getServeRate(p.stats) >= 80 ? 'text-emerald-400' : getServeRate(p.stats) >= 65 ? 'text-yellow-400' : 'text-red-400'}>
                          {getServeRate(p.stats)}%
                        </span>
                      </td>
                      <td className="p-3">
                        {p.position !== 'L' ? (
                          <span className={getAttackEfficiency(p.stats) >= 50 ? 'text-emerald-400' : getAttackEfficiency(p.stats) >= 35 ? 'text-yellow-400' : 'text-red-400'}>
                            {getAttackEfficiency(p.stats)}%
                          </span>
                        ) : <span className="text-slate-600">-</span>}
                      </td>
                      <td className="p-3">
                        {p.stats.receiveAttempts > 0 ? (
                          <span className={getReceiveRate(p.stats) >= 70 ? 'text-emerald-400' : getReceiveRate(p.stats) >= 55 ? 'text-yellow-400' : 'text-red-400'}>
                            {getReceiveRate(p.stats)}%
                          </span>
                        ) : <span className="text-slate-600">-</span>}
                      </td>
                      <td className="p-3 text-slate-300">{getBlockPerSet(p.stats)}</td>
                      <td className="p-3 text-slate-400">{p.stats.matchesPlayed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
