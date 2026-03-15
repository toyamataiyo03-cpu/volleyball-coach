import type { ReactNode } from 'react';
import {
  LayoutDashboard,
  Users,
  Trophy,
  BarChart3,
  Volleyball,
  LogOut,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { supabase, isSupabaseConfigured } from '../../supabase';

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'ダッシュボード', icon: <LayoutDashboard size={22} /> },
  { id: 'team', label: 'チーム管理', icon: <Users size={22} /> },
  { id: 'match', label: '試合管理', icon: <Trophy size={22} /> },
  { id: 'stats', label: '統計', icon: <BarChart3 size={22} /> },
];

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { activePage, setActivePage, teamName, setTeamCode } = useAppStore();

  async function handleLogout() {
    if (isSupabaseConfigured) await supabase.auth.signOut()
    setTeamCode(null)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 flex-shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col">
        {/* Logo */}
        <div className="p-4 lg:p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Volleyball size={22} className="text-white" />
            </div>
            <div className="hidden lg:block overflow-hidden">
              <div className="text-sm font-bold text-white truncate">VolleyCoach</div>
              <div className="text-xs text-slate-400 truncate">{teamName}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className={`flex-shrink-0 ${isActive ? 'text-emerald-400' : ''}`}>
                  {item.icon}
                </span>
                <span className="hidden lg:block text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout + Version */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-150"
          >
            <LogOut size={22} className="flex-shrink-0" />
            <span className="hidden lg:block text-sm font-medium">ログアウト</span>
          </button>
          <div className="hidden lg:block mt-2 px-1">
            <p className="text-xs text-slate-600">VolleyCoach v1.0</p>
            <p className="text-xs text-slate-600">DataVolley基準</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}
