import { useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import { useAppStore } from '../store/useAppStore'

const DEBOUNCE_MS = 1500

export function useSupabaseSync() {
  const teamCode = useAppStore(s => s.teamCode)   // ユーザーIDとして使用
  const players = useAppStore(s => s.players)
  const matches = useAppStore(s => s.matches)
  const teamName = useAppStore(s => s.teamName)
  const isRemoteUpdate = useAppStore(s => s._isRemoteUpdate)

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ready = useRef(false)

  useEffect(() => {
    if (teamCode) ready.current = true
  }, [teamCode])

  useEffect(() => {
    if (!teamCode || !ready.current || isRemoteUpdate) return
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      await supabase.from('team_data').upsert({
        user_id: teamCode,
        data: { players, matches, teamName },
        updated_at: new Date().toISOString(),
      })
    }, DEBOUNCE_MS)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [players, matches, teamName, teamCode, isRemoteUpdate])
}
