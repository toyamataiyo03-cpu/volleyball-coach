import { useState, useRef } from 'react'
import { Wifi, Download, Upload, Copy, Check, AlertCircle } from 'lucide-react'
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import { useAppStore } from '../store/useAppStore'

function exportData(players: unknown[], teamName: string): string {
  // 名前・番号・ポジションのみ（スタッツは除外して短縮）
  const slim = (players as Array<{id:string;name:string;number:number;position:string;isLibero:boolean;dominant:string;height?:number;notes?:string}>)
    .map(({ id, name, number, position, isLibero, dominant, height, notes }) =>
      ({ id, name, number, position, isLibero, dominant, height, notes }))
  const payload = JSON.stringify({ players: slim, teamName })
  return compressToEncodedURIComponent(payload)
}

function importData(code: string): { players: unknown[]; matches: unknown[]; teamName: string } {
  const payload = decompressFromEncodedURIComponent(code.trim())
  if (!payload) throw new Error('invalid')
  const data = JSON.parse(payload)
  return { players: data.players, matches: [], teamName: data.teamName }
}

export default function TeamSetup() {
  const { setTeamCode, players, teamName, _setFromRemote } = useAppStore()

  const [mode, setMode] = useState<'menu' | 'import'>('menu')
  const [importCode, setImportCode] = useState('')
  const [exportCode] = useState(() => exportData(players, teamName))
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleExport() {
    navigator.clipboard.writeText(exportCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleImport() {
    setError('')
    try {
      const data = importData(importCode)
      if (!Array.isArray(data.players)) throw new Error()
      _setFromRemote(data)
      setTeamCode('imported-' + Date.now())
    } catch {
      setError('コードが正しくありません。もう一度コピーして貼り付けてください。')
    }
  }

  function handleSkip() {
    setTeamCode('local-' + Date.now())
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wifi size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">端末間でデータ共有</h1>
          <p className="text-gray-400 mt-2 text-sm">コードをコピーして別の端末に送るだけ</p>
        </div>

        {mode === 'menu' && (
          <div className="space-y-3">
            {/* エクスポート */}
            <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <Download size={18} className="text-green-400" />
                <span className="text-white font-semibold">このデータを別の端末に送る</span>
              </div>
              <textarea
                ref={textareaRef}
                readOnly
                value={exportCode}
                className="w-full bg-gray-800 text-green-300 rounded-xl p-3 text-xs font-mono h-20 border border-gray-700 resize-none select-all"
                onClick={e => (e.target as HTMLTextAreaElement).select()}
              />
              <button
                onClick={handleExport}
                className="mt-3 w-full bg-green-600 hover:bg-green-500 text-white rounded-xl py-3 flex items-center justify-center gap-2 transition-colors font-semibold"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'コピーしました！' : 'コードをコピー → LINEで送る'}
              </button>
            </div>

            {/* インポート */}
            <button
              onClick={() => setMode('import')}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white rounded-xl p-4 flex items-center gap-3 transition-colors border border-gray-700"
            >
              <Upload size={20} />
              <div className="text-left">
                <div className="font-semibold">別の端末からデータを受け取る</div>
                <div className="text-xs text-gray-400">送られてきたコードを貼り付け</div>
              </div>
            </button>

            {/* スキップ */}
            <button
              onClick={handleSkip}
              className="w-full text-gray-500 hover:text-gray-300 text-sm py-2 transition-colors"
            >
              この端末だけで使う（スキップ）
            </button>
          </div>
        )}

        {mode === 'import' && (
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <Upload size={18} className="text-blue-400" />
              <h2 className="text-white font-bold text-lg">コードを貼り付け</h2>
            </div>
            <textarea
              className="w-full bg-gray-800 text-white rounded-xl p-3 text-xs font-mono h-32 border border-gray-700 focus:outline-none focus:border-green-500 resize-none"
              placeholder="送られてきたコードをここに貼り付け..."
              value={importCode}
              onChange={e => setImportCode(e.target.value)}
            />
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setMode('menu')} className="flex-1 bg-gray-800 text-gray-300 rounded-xl py-3 hover:bg-gray-700 transition-colors">戻る</button>
              <button
                onClick={handleImport}
                disabled={!importCode.trim()}
                className="flex-1 bg-green-600 text-white rounded-xl py-3 hover:bg-green-500 transition-colors font-semibold disabled:opacity-50"
              >
                インポート
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
