import type {
  LongTermOfficial,
  LongTermPick,
  Match,
  Participant,
  Prediction,
  PredictionStatus,
  RankingRow,
  Score,
  ScoredPrediction,
} from "../types";

const outcome = (score: Score) => Math.sign(score.home - score.away);
const goalDiff = (score: Score) => score.home - score.away;

export function scorePrediction(prediction: Prediction, match: Match): ScoredPrediction {
  if (!match.result) {
    return { prediction, match, points: 0, status: "Pendente" };
  }

  const exact = prediction.score.home === match.result.home && prediction.score.away === match.result.away;
  if (exact) {
    return { prediction, match, points: 10, status: "Placar Exato" };
  }

  const sameOutcome = outcome(prediction.score) === outcome(match.result);
  const sameDiff = goalDiff(prediction.score) === goalDiff(match.result);

  if (sameOutcome && sameDiff && outcome(match.result) !== 0) {
    return { prediction, match, points: 7, status: "Vencedor + Saldo" };
  }

  if (sameOutcome) {
    return { prediction, match, points: 5, status: "Vencedor/Empate" };
  }

  return { prediction, match, points: 0, status: "Errou" };
}

export function longTermPoints(pick: LongTermPick | undefined, official: LongTermOfficial): number {
  if (!pick) return 0;

  return (
    (official.champion && official.champion === pick.champion ? 30 : 0) +
    (official.runnerUp && official.runnerUp === pick.runnerUp ? 20 : 0) +
    (official.topScorer && official.topScorer === pick.topScorer ? 15 : 0) +
    (official.brazilPosition && official.brazilPosition === pick.brazilPosition ? 20 : 0)
  );
}

function bestStreak(scored: ScoredPrediction[]) {
  let best = 0;
  let current = 0;

  scored.forEach((item) => {
    if (item.match.result && item.points > 0) {
      current += 1;
      best = Math.max(best, current);
    } else if (item.match.result) {
      current = 0;
    }
  });

  return best;
}

export function buildRanking(
  participants: Participant[],
  matches: Match[],
  predictions: Prediction[],
  longTermPicks: LongTermPick[],
  official: LongTermOfficial,
): RankingRow[] {
  const completedMatches = matches.filter((match) => match.result);
  const latestCompletedRound = completedMatches.length ? Math.max(...completedMatches.map((match) => match.round)) : 0;

  const previous = participants
    .map((participant) => {
      const points = predictions
        .filter((prediction) => prediction.participantId === participant.id)
        .map((prediction) => {
          const match = matches.find((item) => item.id === prediction.matchId);
          if (!match || !match.result || match.round >= latestCompletedRound) return 0;
          return scorePrediction(prediction, match).points;
        })
        .reduce((sum, value) => sum + value, 0);

      return { participantId: participant.id, points };
    })
    .sort((a, b) => b.points - a.points)
    .map((row, index) => ({ ...row, previousPosition: index + 1 }));

  return participants
    .map((participant) => {
      const scored = predictions
        .filter((prediction) => prediction.participantId === participant.id)
        .map((prediction) => {
          const match = matches.find((item) => item.id === prediction.matchId);
          return match ? scorePrediction(prediction, match) : undefined;
        })
        .filter(Boolean) as ScoredPrediction[];

      const matchPoints = scored.reduce((sum, item) => sum + item.points, 0);
      const pick = longTermPicks.find((item) => item.participantId === participant.id);
      const longPoints = longTermPoints(pick, official);
      const exactScores = scored.filter((item) => item.status === "Placar Exato").length;
      const winnerHits = scored.filter((item) => item.points > 0 && item.status !== "Placar Exato").length;
      const errors = scored.filter((item) => item.status === "Errou").length;
      const computedMatches = completedMatches.length;
      const hitRate = computedMatches ? Math.round(((exactScores + winnerHits) / computedMatches) * 100) : 0;
      const previousPosition = previous.find((item) => item.participantId === participant.id)?.previousPosition ?? 1;

      return {
        participant,
        matchPoints,
        longTermPoints: longPoints,
        totalPoints: matchPoints + longPoints,
        exactScores,
        winnerHits,
        errors,
        computedMatches,
        hitRate,
        previousPosition,
        position: 0,
        streak: bestStreak(scored),
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints || b.exactScores - a.exactScores)
    .map((row, index) => ({ ...row, position: index + 1 }));
}

export function statusTone(status: PredictionStatus) {
  const tones: Record<PredictionStatus, string> = {
    "Placar Exato": "bg-emerald-100 text-emerald-800",
    "Vencedor + Saldo": "bg-amber-100 text-amber-800",
    "Vencedor/Empate": "bg-sky-100 text-sky-800",
    Errou: "bg-rose-100 text-rose-800",
    Pendente: "bg-slate-100 text-slate-600",
  };

  return tones[status];
}

export function scoreText(score?: Score) {
  return score ? `${score.home} x ${score.away}` : "-";
}
