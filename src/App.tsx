import { useEffect, useState } from 'react'
import { useAppStore } from './store/useAppStore'
import { MainLayout } from './components/Layout/MainLayout'
import { Dashboard } from './pages/Dashboard'
import { TeamManagement } from './pages/TeamManagement'
import { MatchPage } from './pages/MatchPage'
import { StatsPage } from './pages/StatsPage'
import LoginPage from './pages/LoginPage'
import TeamSetup from './pages/TeamSetup'
import { supabase, isSupabaseConfigured } from './supabase'
import { useSupabaseSync } from './hooks/useSupabaseSync'

function SyncProvider() {
  useSupabaseSync()
  return null
}

function App() {
  const { activePage, teamCode, setTeamCode, _setFromRemote } = useAppStore()
  const [authChecked, setAuthChecked] = useState(!isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user
      if (user) {
        setTeamCode(user.id)
        const { data: row } = await supabase
          .from('team_data')
          .select('data')
          .eq('user_id', user.id)
          .single()
        if (row?.data) _setFromRemote(row.data)
      }
      setAuthChecked(true)
    })
  }, [])

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">読み込み中...</div>
      </div>
    )
  }

  // Supabase設定済み → ログイン画面
  if (isSupabaseConfigured && !teamCode) {
    return <LoginPage />
  }

  // Supabase未設定 → コード共有画面
  if (!teamCode) {
    return <TeamSetup />
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />
      case 'team': return <TeamManagement />
      case 'match': return <MatchPage />
      case 'stats': return <StatsPage />
      default: return <Dashboard />
    }
  }

  return (
    <>
      {isSupabaseConfigured && <SyncProvider />}
      <MainLayout>
        {renderPage()}
      </MainLayout>
    </>
  )
}

export default App
