export type Team = {
  name: string;
  flag: string;
};

export type Match = {
  id: string;
  round: number;
  group: string;
  home: Team;
  away: Team;
  result?: Score;
};

export type Score = {
  home: number;
  away: number;
};

export type Participant = {
  id: string;
  name: string;
  avatar: string;
};

export type Prediction = {
  participantId: string;
  matchId: string;
  score: Score;
};

export type LongTermPick = {
  participantId: string;
  champion: string;
  runnerUp: string;
  topScorer: string;
  brazilPosition: string;
};

export type LongTermOfficial = {
  champion?: string;
  runnerUp?: string;
  topScorer?: string;
  brazilPosition?: string;
};

export type PoolData = {
  participants: Participant[];
  matches: Match[];
  predictions: Prediction[];
  longTermPicks: LongTermPick[];
  longTermOfficial: LongTermOfficial;
};

export type PredictionStatus =
  | "Placar Exato"
  | "Vencedor + Saldo"
  | "Vencedor/Empate"
  | "Errou"
  | "Pendente";

export type ScoredPrediction = {
  prediction: Prediction;
  match: Match;
  points: number;
  status: PredictionStatus;
};

export type RankingRow = {
  participant: Participant;
  matchPoints: number;
  longTermPoints: number;
  totalPoints: number;
  exactScores: number;
  winnerHits: number;
  errors: number;
  computedMatches: number;
  hitRate: number;
  previousPosition: number;
  position: number;
  streak: number;
};
