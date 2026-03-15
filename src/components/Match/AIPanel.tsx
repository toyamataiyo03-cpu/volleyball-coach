import { Brain, AlertTriangle, Info, RefreshCcw, Timer } from 'lucide-react';
import type { AISuggestion } from '../../types';

interface AIPanelProps {
  suggestions: AISuggestion[];
  onRefresh?: () => void;
}

const priorityConfig = {
  high: { border: 'border-red-500/50', bg: 'bg-red-500/10', text: 'text-red-400', badge: 'bg-red-500' },
  medium: { border: 'border-yellow-500/50', bg: 'bg-yellow-500/10', text: 'text-yellow-400', badge: 'bg-yellow-500' },
  low: { border: 'border-slate-600', bg: 'bg-slate-800/60', text: 'text-slate-400', badge: 'bg-slate-600' },
};

const typeIcons = {
  substitution: <RefreshCcw size={14} />,
  timeout: <Timer size={14} />,
  rotation: <RefreshCcw size={14} />,
  info: <Info size={14} />,
};

export function AIPanel({ suggestions, onRefresh }: AIPanelProps) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-emerald-400" />
          <span className="text-sm font-bold text-white">AI分析</span>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="更新"
          >
            <RefreshCcw size={13} />
          </button>
        )}
      </div>

      <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
        {suggestions.length === 0 ? (
          <div className="flex items-center gap-2 text-slate-500 text-sm py-3">
            <Info size={14} />
            <span>試合開始後に提案が表示されます</span>
          </div>
        ) : (
          suggestions.map((s) => {
            const config = priorityConfig[s.priority];
            return (
              <div
                key={s.id}
                className={`rounded-lg p-3 border ${config.border} ${config.bg}`}
              >
                <div className="flex items-start gap-2">
                  <div className={`mt-0.5 ${config.text}`}>
                    {s.priority === 'high' && <AlertTriangle size={14} />}
                    {s.priority !== 'high' && typeIcons[s.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${config.text}`}>{s.message}</p>
                    {s.detail && (
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{s.detail}</p>
                    )}
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white flex-shrink-0 ${config.badge}`}>
                    {s.priority === 'high' ? '重要' : s.priority === 'medium' ? '注意' : 'INFO'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
