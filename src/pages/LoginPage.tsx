import { useState } from 'react'
import { Volleyball, Mail, Lock, AlertCircle, Loader } from 'lucide-react'
import { supabase } from '../supabase'
import { useAppStore } from '../store/useAppStore'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const { _setFromRemote, setTeamCode } = useAppStore()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit() {
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('確認メールを送信しました。メールを確認してください。')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

        // ログイン後にデータを読み込む
        const userId = data.user?.id
        if (userId) {
          setTeamCode(userId)
          const { data: row } = await supabase
            .from('team_data')
            .select('data')
            .eq('user_id', userId)
            .single()
          if (row?.data) {
            _setFromRemote(row.data)
          }
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg === 'Invalid login credentials' ? 'メールアドレスまたはパスワードが違います' : msg)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Volleyball size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">VolleyCoach</h1>
          <p className="text-gray-400 mt-1 text-sm">バレーボール戦術管理システム</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          {/* タブ */}
          <div className="flex bg-gray-800 rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'login' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              ログイン
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'register' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              新規登録
            </button>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3.5 text-gray-500" />
              <input
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-xl pl-9 pr-3 py-3 border border-gray-700 focus:outline-none focus:border-green-500 text-sm"
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3.5 text-gray-500" />
              <input
                type="password"
                placeholder="パスワード（6文字以上）"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full bg-gray-800 text-white rounded-xl pl-9 pr-3 py-3 border border-gray-700 focus:outline-none focus:border-green-500 text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm mt-3">
              <AlertCircle size={15} /> {error}
            </div>
          )}
          {message && (
            <div className="text-green-400 text-sm mt-3">{message}</div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !email || !password}
            className="mt-4 w-full bg-green-600 hover:bg-green-500 text-white rounded-xl py-3 font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader size={16} className="animate-spin" />}
            {mode === 'login' ? 'ログイン' : 'アカウント作成'}
          </button>
        </div>
      </div>
    </div>
  )
}
