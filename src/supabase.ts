import { createClient } from '@supabase/supabase-js'

// ユーザーがSupabaseプロジェクトを作成後にここを更新
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env = (import.meta as any).env ?? {}
const SUPABASE_URL: string = env.VITE_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY: string = env.VITE_SUPABASE_ANON_KEY ?? ''

export const isSupabaseConfigured = !!SUPABASE_URL && !!SUPABASE_ANON_KEY

// URL未設定時はダミークライアント（エラー防止）
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : createClient('https://placeholder.supabase.co', 'placeholder')
