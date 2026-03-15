import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Player, Match, PlayerStats, Substitution, SetRecord } from '../types';
import { defaultStats } from '../types';
import { samplePlayers } from '../data/sampleData';
import { rotateLineup } from '../utils/volleyball';

interface AppStore {
  players: Player[];
  matches: Match[];
  currentMatchId: string | null;
  activePage: string;
  teamName: string;
  teamCode: string | null;
  _isRemoteUpdate: boolean;

  // Sync actions
  setTeamCode: (code: string | null) => void;
  _setFromRemote: (data: { players: unknown[]; matches: unknown[]; teamName: string }) => void;

  // Team actions
  addPlayer: (data: Omit<Player, 'id' | 'stats'>) => void;
  updatePlayer: (player: Player) => void;
  deletePlayer: (id: string) => void;
  updatePlayerStats: (playerId: string, stats: Partial<PlayerStats>) => void;
  incrementPlayerStats: (playerId: string, delta: Partial<PlayerStats>) => void;
  setTeamName: (name: string) => void;

  // Match actions
  createMatch: (opponent: string, venue?: string) => string;
  deleteMatch: (id: string) => void;
  setCurrentMatch: (id: string | null) => void;
  setPlayerInSlot: (slot: number, playerId: string | null) => void;
  setLibero: (playerId: string | undefined) => void;
  startMatch: () => void;
  finishMatch: () => void;
  rotate: () => void;
  scorePoint: (team: 'my' | 'opponent') => void;
  makeSubstitution: (inId: string, outId: string, slot: number) => void;
  makeLiberoSwap: (liberoIn: boolean, playerId: string, slot: number) => void;
  useTimeout: () => void;
  endSet: (winnerScore: { my: number; opponent: number }) => void;
  setActivePage: (page: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      players: samplePlayers,
      matches: [],
      currentMatchId: null,
      activePage: 'dashboard',
      teamName: 'VolleyTeam',
      teamCode: null,
      _isRemoteUpdate: false,

      setTeamCode: (code) => set({ teamCode: code, activePage: code ? 'dashboard' : 'dashboard' }),
      _setFromRemote: (data) => {
        set({ _isRemoteUpdate: true, players: data.players as Player[], matches: data.matches as Match[], teamName: data.teamName })
        setTimeout(() => set({ _isRemoteUpdate: false }), 200)
      },

      setTeamName: (name) => set({ teamName: name }),

      addPlayer: (data) => {
        const player: Player = {
          ...data,
          id: uuidv4(),
          stats: defaultStats(),
        };
        set((s) => ({ players: [...s.players, player] }));
      },

      updatePlayer: (player) => {
        set((s) => ({
          players: s.players.map((p) => (p.id === player.id ? player : p)),
        }));
      },

      deletePlayer: (id) => {
        set((s) => ({
          players: s.players.filter((p) => p.id !== id),
        }));
      },

      updatePlayerStats: (playerId, stats) => {
        set((s) => ({
          players: s.players.map((p) =>
            p.id === playerId ? { ...p, stats: { ...p.stats, ...stats } } : p
          ),
        }));
      },

      incrementPlayerStats: (playerId, delta) => {
        set((s) => ({
          players: s.players.map((p) => {
            if (p.id !== playerId) return p;
            const updated = { ...p.stats };
            (Object.keys(delta) as (keyof PlayerStats)[]).forEach((key) => {
              updated[key] = (updated[key] ?? 0) + (delta[key] ?? 0);
            });
            return { ...p, stats: updated };
          }),
        }));
      },

      createMatch: (opponent, venue) => {
        const id = uuidv4();
        const match: Match = {
          id,
          date: new Date().toISOString(),
          opponent,
          venue,
          lineup: [null, null, null, null, null, null],
          sets: [],
          currentSetIndex: 0,
          myScore: 0,
          opponentScore: 0,
          subsUsed: 0,
          maxSubs: 6,
          timeoutsLeft: 2,
          status: 'setup',
          substitutions: [],
          liberoOnCourt: false,
        };
        set((s) => ({
          matches: [match, ...s.matches],
          currentMatchId: id,
          activePage: 'match',
        }));
        return id;
      },

      deleteMatch: (id) => {
        set((s) => ({
          matches: s.matches.filter((m) => m.id !== id),
          currentMatchId: s.currentMatchId === id ? null : s.currentMatchId,
        }));
      },

      setCurrentMatch: (id) => set({ currentMatchId: id }),

      setPlayerInSlot: (slot, playerId) => {
        const { currentMatchId } = get();
        if (!currentMatchId) return;
        set((s) => ({
          matches: s.matches.map((m) => {
            if (m.id !== currentMatchId) return m;
            const lineup = [...m.lineup];
            // If player already in another slot, remove them
            if (playerId) {
              const existing = lineup.indexOf(playerId);
              if (existing !== -1) lineup[existing] = null;
            }
            lineup[slot] = playerId;
            return { ...m, lineup };
          }),
        }));
      },

      setLibero: (playerId) => {
        const { currentMatchId } = get();
        if (!currentMatchId) return;
        set((s) => ({
          matches: s.matches.map((m) =>
            m.id === currentMatchId
              ? { ...m, liberoPlayerId: playerId }
              : m
          ),
        }));
      },

      startMatch: () => {
        const { currentMatchId } = get();
        if (!currentMatchId) return;
        set((s) => ({
          matches: s.matches.map((m) =>
            m.id === currentMatchId ? { ...m, status: 'active' } : m
          ),
        }));
      },

      finishMatch: () => {
        const { currentMatchId, matches } = get();
        if (!currentMatchId) return;
        const match = matches.find((m) => m.id === currentMatchId);
        if (!match) return;
        const participantIds = new Set<string>();
        match.lineup.forEach((id) => { if (id) participantIds.add(id); });
        match.substitutions.forEach((sub) => {
          participantIds.add(sub.inPlayerId);
          participantIds.add(sub.outPlayerId);
        });
        set((s) => ({
          matches: s.matches.map((m) =>
            m.id === currentMatchId ? { ...m, status: 'finished' } : m
          ),
          players: s.players.map((p) =>
            participantIds.has(p.id)
              ? { ...p, stats: { ...p.stats, matchesPlayed: p.stats.matchesPlayed + 1 } }
              : p
          ),
        }));
      },

      rotate: () => {
        const { currentMatchId } = get();
        if (!currentMatchId) return;
        set((s) => ({
          matches: s.matches.map((m) => {
            if (m.id !== currentMatchId) return m;
            const newLineup = rotateLineup(m.lineup);
            // Handle libero: if libero is on court in a back row position, they stay
            // If the libero's replaced player rotates to front row, swap back
            return { ...m, lineup: newLineup };
          }),
        }));
      },

      scorePoint: (team) => {
        const { currentMatchId } = get();
        if (!currentMatchId) return;
        set((s) => ({
          matches: s.matches.map((m) => {
            if (m.id !== currentMatchId) return m;
            if (team === 'my') {
              return { ...m, myScore: m.myScore + 1 };
            } else {
              return { ...m, opponentScore: m.opponentScore + 1 };
            }
          }),
        }));
      },

      makeSubstitution: (inId, outId, slot) => {
        const { currentMatchId, matches } = get();
        if (!currentMatchId) return;
        const match = matches.find((m) => m.id === currentMatchId);
        if (!match || match.subsUsed >= match.maxSubs) return;

        const sub: Substitution = {
          id: uuidv4(),
          inPlayerId: inId,
          outPlayerId: outId,
          courtSlot: slot,
          myScore: match.myScore,
          opponentScore: match.opponentScore,
          isLiberoSwap: false,
          setNumber: match.currentSetIndex + 1,
        };

        set((s) => ({
          matches: s.matches.map((m) => {
            if (m.id !== currentMatchId) return m;
            const lineup = [...m.lineup];
            lineup[slot] = inId;
            return {
              ...m,
              lineup,
              subsUsed: m.subsUsed + 1,
              substitutions: [...m.substitutions, sub],
            };
          }),
        }));
      },

      makeLiberoSwap: (liberoIn, playerId, slot) => {
        const { currentMatchId, matches } = get();
        if (!currentMatchId) return;
        const match = matches.find((m) => m.id === currentMatchId);
        if (!match || !match.liberoPlayerId) return;

        const sub: Substitution = {
          id: uuidv4(),
          inPlayerId: liberoIn ? match.liberoPlayerId : playerId,
          outPlayerId: liberoIn ? playerId : match.liberoPlayerId,
          courtSlot: slot,
          myScore: match.myScore,
          opponentScore: match.opponentScore,
          isLiberoSwap: true,
          setNumber: match.currentSetIndex + 1,
        };

        set((s) => ({
          matches: s.matches.map((m) => {
            if (m.id !== currentMatchId) return m;
            const lineup = [...m.lineup];
            if (liberoIn) {
              lineup[slot] = match.liberoPlayerId!;
              return {
                ...m,
                lineup,
                liberoOnCourt: true,
                liberoSwappedSlot: slot,
                liberoReplacedPlayerId: playerId,
                substitutions: [...m.substitutions, sub],
              };
            } else {
              lineup[slot] = playerId;
              return {
                ...m,
                lineup,
                liberoOnCourt: false,
                liberoSwappedSlot: undefined,
                liberoReplacedPlayerId: undefined,
                substitutions: [...m.substitutions, sub],
              };
            }
          }),
        }));
      },

      useTimeout: () => {
        const { currentMatchId } = get();
        if (!currentMatchId) return;
        set((s) => ({
          matches: s.matches.map((m) =>
            m.id === currentMatchId && m.timeoutsLeft > 0
              ? { ...m, timeoutsLeft: m.timeoutsLeft - 1 }
              : m
          ),
        }));
      },

      endSet: (winnerScore) => {
        const { currentMatchId, matches } = get();
        if (!currentMatchId) return;
        const match = matches.find((m) => m.id === currentMatchId);
        if (!match) return;

        const winner: 'my' | 'opponent' =
          winnerScore.my > winnerScore.opponent ? 'my' : 'opponent';
        const setRecord: SetRecord = {
          setNumber: match.currentSetIndex + 1,
          myScore: winnerScore.my,
          opponentScore: winnerScore.opponent,
          winner,
        };

        set((s) => ({
          matches: s.matches.map((m) => {
            if (m.id !== currentMatchId) return m;
            return {
              ...m,
              sets: [...m.sets, setRecord],
              currentSetIndex: m.currentSetIndex + 1,
              myScore: 0,
              opponentScore: 0,
              subsUsed: 0,
              timeoutsLeft: 2,
              substitutions: [],
              liberoOnCourt: false,
              liberoSwappedSlot: undefined,
              liberoReplacedPlayerId: undefined,
            };
          }),
        }));
      },

      setActivePage: (page) => set({ activePage: page }),
    }),
    {
      name: 'volleyball-app-store',
      partialize: (state) => ({
        players: state.players,
        matches: state.matches,
        currentMatchId: state.currentMatchId,
        teamName: state.teamName,
        teamCode: state.teamCode,
      }),
    }
  )
);
