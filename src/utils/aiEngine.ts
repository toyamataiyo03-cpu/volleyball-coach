import type { Player, Match, AISuggestion } from '../types';
import { getServeRate, getAttackEfficiency, getReceiveRate, isBackRow } from './volleyball';
import { v4 as uuidv4 } from 'uuid';

export function generateAISuggestions(
  match: Match,
  players: Player[]
): AISuggestion[] {
  const suggestions: AISuggestion[] = [];
  const playerMap = new Map(players.map((p) => [p.id, p]));

  const onCourt = match.lineup
    .map((id, slot) => (id ? { player: playerMap.get(id), slot } : null))
    .filter(Boolean) as { player: Player; slot: number }[];

  const bench = players.filter(
    (p) =>
      !match.lineup.includes(p.id) &&
      p.id !== match.liberoPlayerId &&
      !p.isLibero
  );

  // 1. Analyze current server (position 1)
  const serverEntry = onCourt.find((e) => e.slot === 0);
  if (serverEntry) {
    const serveRate = getServeRate(serverEntry.player.stats);
    const aceRate = Math.round(
      (serverEntry.player.stats.serveAce / Math.max(serverEntry.player.stats.serveAttempts, 1)) * 100
    );
    if (serveRate < 75 || serverEntry.player.stats.serveFault > serverEntry.player.stats.serveAce) {
      // Find better server from bench
      const betterServer = bench
        .filter((p) => p.stats.serveAttempts >= 20)
        .sort((a, b) => getServeRate(b.stats) - getServeRate(a.stats))[0];

      suggestions.push({
        id: uuidv4(),
        priority: serveRate < 65 ? 'high' : 'medium',
        type: 'substitution',
        message: `サーバー交代推奨: ${serverEntry.player.name} (成功率${serveRate}%)`,
        detail: betterServer
          ? `→ ${betterServer.name} (成功率${getServeRate(betterServer.stats)}%) と交代を検討`
          : `サーブミスが多い (${serverEntry.player.stats.serveFault}本)`,
        playerIn: betterServer?.id,
        playerOut: serverEntry.player.id,
      });
    } else {
      suggestions.push({
        id: uuidv4(),
        priority: 'low',
        type: 'info',
        message: `次のサーバー: ${serverEntry.player.name}`,
        detail: `サーブ成功率 ${serveRate}% | エース率 ${aceRate}%`,
      });
    }
  }

  // 2. Check attack efficiency for front row players
  const frontRow = onCourt.filter((e) => !isBackRow(e.slot));
  for (const entry of frontRow) {
    const eff = getAttackEfficiency(entry.player.stats);
    if (
      entry.player.stats.attackAttempts >= 30 &&
      eff < 40 &&
      entry.player.position !== 'S'
    ) {
      const betterAttacker = bench
        .filter(
          (p) =>
            (p.position === 'OH' || p.position === 'OP' || p.position === 'MB') &&
            p.stats.attackAttempts >= 20
        )
        .sort((a, b) => getAttackEfficiency(b.stats) - getAttackEfficiency(a.stats))[0];

      suggestions.push({
        id: uuidv4(),
        priority: 'medium',
        type: 'substitution',
        message: `攻撃力強化: ${entry.player.name} (決定率${eff}%)`,
        detail: betterAttacker
          ? `→ ${betterAttacker.name} (決定率${getAttackEfficiency(betterAttacker.stats)}%) を投入検討`
          : `攻撃決定率が低い`,
        playerIn: betterAttacker?.id,
        playerOut: entry.player.id,
      });
    }
  }

  // 3. Check reception for back row
  const backRow = onCourt.filter((e) => isBackRow(e.slot) && !e.player.isLibero);
  for (const entry of backRow) {
    const recvRate = getReceiveRate(entry.player.stats);
    if (entry.player.stats.receiveAttempts >= 20 && recvRate < 55) {
      suggestions.push({
        id: uuidv4(),
        priority: 'medium',
        type: 'substitution',
        message: `レセプション強化: ${entry.player.name} (成功率${recvRate}%)`,
        detail: `サーブレシーブ成功率が低い。リベロ投入を検討`,
      });
    }
  }

  // 4. Score-based suggestions
  if (match.myScore > 0 && match.opponentScore > 0) {
    const scoreDiff = match.opponentScore - match.myScore;
    if (scoreDiff >= 4 && match.timeoutsLeft > 0) {
      suggestions.unshift({
        id: uuidv4(),
        priority: 'high',
        type: 'timeout',
        message: `タイムアウト推奨 (${match.myScore}-${match.opponentScore})`,
        detail: `${scoreDiff}点のビハインド。流れを変えるためにタイムアウトを検討`,
      });
    }
    if (scoreDiff >= 6 && match.subsUsed < match.maxSubs) {
      suggestions.unshift({
        id: uuidv4(),
        priority: 'high',
        type: 'substitution',
        message: `大量リードを許しています (${match.myScore}-${match.opponentScore})`,
        detail: `積極的な交代で流れを変えましょう。残り交代: ${match.maxSubs - match.subsUsed}回`,
      });
    }
  }

  // 5. Libero suggestion if no libero on court
  if (match.liberoPlayerId && !match.liberoOnCourt) {
    const libero = playerMap.get(match.liberoPlayerId);
    if (libero) {
      suggestions.push({
        id: uuidv4(),
        priority: 'medium',
        type: 'rotation',
        message: `リベロ投入可能: ${libero.name}`,
        detail: `レセプション効率 ${getReceiveRate(libero.stats)}%`,
      });
    }
  }

  // 6. Rotation hint
  if (match.subsUsed >= match.maxSubs) {
    suggestions.push({
      id: uuidv4(),
      priority: 'low',
      type: 'info',
      message: '交代枠消費済み',
      detail: 'このセットの残り交代はありません (リベロ除く)',
    });
  }

  // Limit to top 5 and sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return suggestions
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 5);
}
