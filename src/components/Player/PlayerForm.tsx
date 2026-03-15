import { useState } from 'react';
import type { Player, PlayerPosition } from '../../types';
import { POSITION_LABELS } from '../../types';
import { defaultStats } from '../../types';

interface PlayerFormProps {
  initialData?: Player;
  onSubmit: (data: Omit<Player, 'id'>) => void;
  onCancel: () => void;
}

const positions: PlayerPosition[] = ['S', 'OH', 'MB', 'OP', 'L'];

export function PlayerForm({ initialData, onSubmit, onCancel }: PlayerFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [number, setNumber] = useState(initialData?.number?.toString() ?? '');
  const [position, setPosition] = useState<PlayerPosition>(initialData?.position ?? 'OH');
  const [isLibero, setIsLibero] = useState(initialData?.isLibero ?? false);
  const [height, setHeight] = useState(initialData?.height?.toString() ?? '');
  const [dominant, setDominant] = useState<'right' | 'left'>(initialData?.dominant ?? 'right');
  const [notes, setNotes] = useState(initialData?.notes ?? '');

  // Stats
  const [serveAttempts, setServeAttempts] = useState(initialData?.stats.serveAttempts.toString() ?? '0');
  const [serveAce, setServeAce] = useState(initialData?.stats.serveAce.toString() ?? '0');
  const [serveFault, setServeFault] = useState(initialData?.stats.serveFault.toString() ?? '0');
  const [attackAttempts, setAttackAttempts] = useState(initialData?.stats.attackAttempts.toString() ?? '0');
  const [attackKill, setAttackKill] = useState(initialData?.stats.attackKill.toString() ?? '0');
  const [attackFault, setAttackFault] = useState(initialData?.stats.attackFault.toString() ?? '0');
  const [receiveAttempts, setReceiveAttempts] = useState(initialData?.stats.receiveAttempts.toString() ?? '0');
  const [receiveGood, setReceiveGood] = useState(initialData?.stats.receiveGood.toString() ?? '0');
  const [blockPoint, setBlockPoint] = useState(initialData?.stats.blockPoint.toString() ?? '0');
  const [matchesPlayed, setMatchesPlayed] = useState(initialData?.stats.matchesPlayed.toString() ?? '0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !number) return;
    onSubmit({
      name: name.trim(),
      number: parseInt(number),
      position,
      isLibero: position === 'L' || isLibero,
      height: height ? parseInt(height) : undefined,
      dominant,
      notes,
      stats: {
        ...defaultStats(),
        serveAttempts: parseInt(serveAttempts) || 0,
        serveAce: parseInt(serveAce) || 0,
        serveFault: parseInt(serveFault) || 0,
        attackAttempts: parseInt(attackAttempts) || 0,
        attackKill: parseInt(attackKill) || 0,
        attackFault: parseInt(attackFault) || 0,
        receiveAttempts: parseInt(receiveAttempts) || 0,
        receiveGood: parseInt(receiveGood) || 0,
        receiveFault: 0,
        blockPoint: parseInt(blockPoint) || 0,
        dig: 0,
        matchesPlayed: parseInt(matchesPlayed) || 0,
      },
    });
  };

  const inputCls = "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none";
  const labelCls = "text-xs font-medium text-slate-400 block mb-1";
  const statInputCls = "w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm text-center focus:border-emerald-500 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelCls}>選手名 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 田中 健太"
            required
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>背番号 *</label>
          <input
            type="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="1"
            min={1}
            max={99}
            required
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>身長 (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="185"
            min={150}
            max={230}
            className={inputCls}
          />
        </div>
      </div>

      {/* Position */}
      <div>
        <label className={labelCls}>ポジション *</label>
        <div className="grid grid-cols-5 gap-2">
          {positions.map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => {
                setPosition(pos);
                if (pos === 'L') setIsLibero(true);
                else setIsLibero(false);
              }}
              className={`py-2 rounded-lg text-sm font-bold border transition-all ${
                position === pos
                  ? 'bg-emerald-500 border-emerald-400 text-white'
                  : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-1">{POSITION_LABELS[position]}</p>
      </div>

      {/* Dominant Hand & Notes */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>利き手</label>
          <div className="flex gap-2">
            {(['right', 'left'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDominant(d)}
                className={`flex-1 py-2 rounded-lg text-sm border transition-all ${
                  dominant === d
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-slate-700 border-slate-600 text-slate-400'
                }`}
              >
                {d === 'right' ? '右利き' : '左利き'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>リベロ指定</label>
          <button
            type="button"
            onClick={() => setIsLibero((v) => !v)}
            className={`w-full py-2 rounded-lg text-sm border transition-all ${
              isLibero || position === 'L'
                ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                : 'bg-slate-700 border-slate-600 text-slate-400'
            }`}
          >
            {isLibero || position === 'L' ? 'リベロ ✓' : 'リベロではない'}
          </button>
        </div>
      </div>

      <div>
        <label className={labelCls}>メモ</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="特徴・注意点など"
          className={inputCls}
        />
      </div>

      {/* Stats */}
      <div className="border-t border-slate-700 pt-4">
        <h3 className="text-sm font-bold text-slate-300 mb-3">過去の実績データ</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="space-y-1">
            <p className="text-xs text-slate-500">試合数</p>
            <input type="number" value={matchesPlayed} onChange={(e) => setMatchesPlayed(e.target.value)} min={0} className={statInputCls} />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3">
          {/* Serve */}
          <div className="bg-slate-900/60 rounded-lg p-3">
            <p className="text-xs font-bold text-yellow-400 mb-2 text-center">サーブ</p>
            <div className="space-y-1.5">
              <div>
                <p className="text-[10px] text-slate-500">本数</p>
                <input type="number" value={serveAttempts} onChange={(e) => setServeAttempts(e.target.value)} min={0} className={statInputCls} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500">エース</p>
                <input type="number" value={serveAce} onChange={(e) => setServeAce(e.target.value)} min={0} className={statInputCls} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500">ミス</p>
                <input type="number" value={serveFault} onChange={(e) => setServeFault(e.target.value)} min={0} className={statInputCls} />
              </div>
            </div>
          </div>

          {/* Attack */}
          <div className="bg-slate-900/60 rounded-lg p-3">
            <p className="text-xs font-bold text-blue-400 mb-2 text-center">アタック</p>
            <div className="space-y-1.5">
              <div>
                <p className="text-[10px] text-slate-500">本数</p>
                <input type="number" value={attackAttempts} onChange={(e) => setAttackAttempts(e.target.value)} min={0} className={statInputCls} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500">決定</p>
                <input type="number" value={attackKill} onChange={(e) => setAttackKill(e.target.value)} min={0} className={statInputCls} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500">ミス</p>
                <input type="number" value={attackFault} onChange={(e) => setAttackFault(e.target.value)} min={0} className={statInputCls} />
              </div>
            </div>
          </div>

          {/* Receive */}
          <div className="bg-slate-900/60 rounded-lg p-3">
            <p className="text-xs font-bold text-emerald-400 mb-2 text-center">レセプション</p>
            <div className="space-y-1.5">
              <div>
                <p className="text-[10px] text-slate-500">本数</p>
                <input type="number" value={receiveAttempts} onChange={(e) => setReceiveAttempts(e.target.value)} min={0} className={statInputCls} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500">成功</p>
                <input type="number" value={receiveGood} onChange={(e) => setReceiveGood(e.target.value)} min={0} className={statInputCls} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500">ブロック</p>
                <input type="number" value={blockPoint} onChange={(e) => setBlockPoint(e.target.value)} min={0} className={statInputCls} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-medium transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold transition-colors"
        >
          {initialData ? '更新' : '登録'}
        </button>
      </div>
    </form>
  );
}
