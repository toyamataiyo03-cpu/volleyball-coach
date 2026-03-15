import type { PlayerStats } from '../types';

// Rotate lineup clockwise: pos 1 player becomes pos 6, pos 2 becomes pos 1, etc.
// When receiving team wins rally, all players rotate one step clockwise
// New order: [was_pos2, was_pos3, was_pos4, was_pos5, was_pos6, was_pos1]
export function rotateLineup(lineup: (string | null)[]): (string | null)[] {
  return [lineup[5], lineup[0], lineup[1], lineup[2], lineup[3], lineup[4]];
}

export function getServeRate(stats: PlayerStats): number {
  if (stats.serveAttempts === 0) return 0;
  return Math.round(((stats.serveAttempts - stats.serveFault) / stats.serveAttempts) * 100);
}

export function getServeAceRate(stats: PlayerStats): number {
  if (stats.serveAttempts === 0) return 0;
  return Math.round((stats.serveAce / stats.serveAttempts) * 100);
}

export function getAttackEfficiency(stats: PlayerStats): number {
  if (stats.attackAttempts === 0) return 0;
  return Math.round((stats.attackKill / stats.attackAttempts) * 100);
}

export function getAttackEff(stats: PlayerStats): number {
  if (stats.attackAttempts === 0) return 0;
  return Math.round(((stats.attackKill - stats.attackFault) / stats.attackAttempts) * 100);
}

export function getReceiveRate(stats: PlayerStats): number {
  if (stats.receiveAttempts === 0) return 0;
  return Math.round((stats.receiveGood / stats.receiveAttempts) * 100);
}

export function getBlockPerSet(stats: PlayerStats): number {
  if (stats.matchesPlayed === 0) return 0;
  return Math.round((stats.blockPoint / stats.matchesPlayed) * 10) / 10;
}

export function getPositionLabel(slot: number): string {
  return ['後衛右', '前衛右', '前衛中', '前衛左', '後衛左', '後衛中'][slot] ?? '';
}

export function isBackRow(slot: number): boolean {
  // positions 1(0), 5(4), 6(5) are back row
  return slot === 0 || slot === 4 || slot === 5;
}

export function isFrontRow(slot: number): boolean {
  return !isBackRow(slot);
}

