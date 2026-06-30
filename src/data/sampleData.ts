import type { Match, PoolData, Prediction, Score } from "../types";

const participants = ["Willie", "Rhômulo", "JP", "Heitor", "Zanuto", "Estevão", "Rhenan", "Roger", "Amim"].map((name) => ({
  id: name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-"),
  name,
  avatar: name.slice(0, 1).toUpperCase(),
}));

const teamFlags: Record<string, string> = {
  "México": "🇲🇽",
  "África do Sul": "🇿🇦",
  "Catar": "🇶🇦",
  "Suíça": "🇨🇭",
  "Canadá": "🇨🇦",
  "Bósnia e Her.": "🇧🇦",
  "Brasil": "🇧🇷",
  "Marrocos": "🇲🇦",
  "Haiti": "🇭🇹",
  "Escócia": "🏴",
  "Estados Unidos": "🇺🇸",
  "Paraguai": "🇵🇾",
  "Austrália": "🇦🇺",
  "Turquia": "🇹🇷",
  "Alemanha": "🇩🇪",
  "Curaçao": "🇨🇼",
  "Holanda": "🇳🇱",
  "Japão": "🇯🇵",
  "Suécia": "🇸🇪",
  "Tunísia": "🇹🇳",
  "Bélgica": "🇧🇪",
  "Egito": "🇪🇬",
  "Irã": "🇮🇷",
  "Nova Zelândia": "🇳🇿",
  "Espanha": "🇪🇸",
  "Cabo Verde": "🇨🇻",
  "Arábia Saudita": "🇸🇦",
  "Uruguai": "🇺🇾",
  "França": "🇫🇷",
  "Senegal": "🇸🇳",
  "Iraque": "🇮🇶",
  "Noruega": "🇳🇴",
  "Argentina": "🇦🇷",
  "Argélia": "🇩🇿",
  "Áustria": "🇦🇹",
  "Jordânia": "🇯🇴",
  "Portugal": "🇵🇹",
  "RD Congo": "🇨🇩",
  "Gana": "🇬🇭",
  "Panamá": "🇵🇦",
  "Inglaterra": "🏴",
  "Croácia": "🇭🇷",
};

const score = (value: string): Score => {
  const [home, away] = value.split("x").map(Number);
  return { home, away };
};

const team = (name: string) => ({ name, flag: teamFlags[name] ?? "🏳️" });

const matchRows = [
  ["A", "México", "África do Sul", "2x0"],
  ["B", "Catar", "Suíça", "1x1"],
  ["B", "Canadá", "Bósnia e Her.", "1x1"],
  ["C", "Brasil", "Marrocos", "1x1"],
  ["C", "Haiti", "Escócia", "0x1"],
  ["D", "Estados Unidos", "Paraguai", "4x1"],
  ["D", "Austrália", "Turquia", "2x0"],
  ["E", "Alemanha", "Curaçao", "7x1"],
  ["F", "Holanda", "Japão", "2x2"],
  ["F", "Suécia", "Tunísia", "5x1"],
  ["G", "Bélgica", "Egito", "1x1"],
  ["G", "Irã", "Nova Zelândia", "2x2"],
  ["H", "Espanha", "Cabo Verde", "0x0"],
  ["H", "Arábia Saudita", "Uruguai", "1x1"],
  ["I", "França", "Senegal", "3x1"],
  ["I", "Iraque", "Noruega", "1x4"],
  ["J", "Argentina", "Argélia", "3x0"],
  ["J", "Áustria", "Jordânia", "3x1"],
  ["K", "Portugal", "RD Congo", "1x1"],
  ["L", "Gana", "Panamá", "1x0"],
  ["L", "Inglaterra", "Croácia", "4x2"],
] as const;

const matches: Match[] = matchRows.map(([group, home, away, result], index) => ({
  id: `${group}-${index + 1}`,
  round: index + 1,
  group: `Grupo ${group}`,
  home: team(home),
  away: team(away),
  result: score(result),
}));

const rawPredictions: Array<Record<string, string>> = [
  { Willie: "1x1", Rhômulo: "1x1", JP: "2x0", Heitor: "2x1", Zanuto: "1x0", Estevão: "1x2", Rhenan: "2x0", Roger: "1x0", Amim: "2x0" },
  { Willie: "0x3", Rhômulo: "0x2", JP: "0x2", Estevão: "0x2", Rhenan: "1x2", Roger: "0x2", Amim: "0x2" },
  { Heitor: "0x1", Zanuto: "1x1" },
  { Willie: "2x1", Rhômulo: "2x0", JP: "3x1", Heitor: "1x0", Zanuto: "1x1", Estevão: "2x1", Rhenan: "2x0", Amim: "2x1" },
  { Roger: "0x1" },
  { Rhômulo: "0x0", Estevão: "0x1", Rhenan: "1x1", Amim: "2x2" },
  { Willie: "0x3", JP: "1x2", Heitor: "0x1", Zanuto: "0x2", Roger: "0x2" },
  { Willie: "6x0", Rhômulo: "3x0", JP: "4x0", Heitor: "3x0", Zanuto: "4x0", Estevão: "3x0", Rhenan: "3x0", Roger: "4x0", Amim: "4x0" },
  { Willie: "3x1", Rhômulo: "2x1", JP: "2x0", Heitor: "1x1", Estevão: "2x2" },
  { Zanuto: "1x0", Rhenan: "3x1", Roger: "0x0", Amim: "3x1" },
  { Willie: "3x1", JP: "3x0", Heitor: "2x1", Zanuto: "2x1", Estevão: "1x1", Rhenan: "2x0" },
  { Rhômulo: "2x1", Roger: "1x0", Amim: "2x0" },
  { Willie: "5x0", Rhômulo: "4x0", JP: "3x0", Heitor: "3x0", Zanuto: "5x1", Estevão: "4x0", Roger: "6x0", Amim: "4x0" },
  { Rhenan: "0x1" },
  { Willie: "3x1", JP: "2x0", Heitor: "3x1", Zanuto: "4x1", Estevão: "2x1", Rhenan: "4x2", Amim: "3x1" },
  { Rhômulo: "1x2", Roger: "0x3" },
  { Willie: "2x0", Rhômulo: "1x0", JP: "3x0", Heitor: "1x0", Zanuto: "2x1", Estevão: "3x0", Rhenan: "3x0", Amim: "2x0" },
  { Roger: "2x0" },
  { Willie: "3x0", Rhômulo: "3x1", JP: "3x0", Heitor: "2x0", Zanuto: "2x0", Estevão: "2x0", Rhenan: "4x0", Roger: "4x0", Amim: "3x0" },
  { Willie: "2x0", Rhômulo: "1x1", Estevão: "1x0" },
  { JP: "2x1", Heitor: "1x1", Zanuto: "3x1", Rhenan: "2x0", Roger: "2x1", Amim: "1x0" },
];

const predictions: Prediction[] = rawPredictions.flatMap((row, matchIndex) =>
  Object.entries(row).map(([name, value]) => ({
    participantId: participants.find((participant) => participant.name === name)!.id,
    matchId: matches[matchIndex].id,
    score: score(value),
  })),
);

const secondRoundRows = [
  ["A", "República Tcheca", "África do Sul"],
  ["A", "México", "Coreia do Sul"],
  ["B", "Suíça", "Bósnia e Herzegovina"],
  ["B", "Canadá", "Catar"],
  ["C", "Escócia", "Marrocos"],
  ["C", "Brasil", "Haiti"],
  ["D", "Estados Unidos", "Austrália"],
  ["D", "Turquia", "Paraguai"],
  ["E", "Alemanha", "Costa do Marfim"],
  ["E", "Equador", "Curaçao"],
  ["F", "Holanda", "Suécia"],
  ["F", "Tunísia", "Japão"],
  ["G", "Bélgica", "Irã"],
  ["G", "Nova Zelândia", "Egito"],
  ["H", "Espanha", "Arábia Saudita"],
  ["H", "Uruguai", "Cabo Verde"],
  ["I", "França", "Iraque"],
  ["I", "Noruega", "Senegal"],
  ["J", "Argentina", "Áustria"],
  ["J", "Jordânia", "Argélia"],
  ["K", "Portugal", "Uzbequistão"],
  ["K", "Colômbia", "RD Congo"],
  ["L", "Inglaterra", "Gana"],
  ["L", "Panamá", "Croácia"],
] as const;

const secondRoundResults = [
  "1x1",
  "1x0",
  "4x1",
  "6x0",
  "0x1",
  "3x0",
  "2x0",
  "0x1",
  "2x1",
  "0x0",
  "5x1",
  "0x4",
  "0x0",
  "1x3",
  "4x0",
  "2x2",
  "3x0",
  "3x2",
  "2x0",
  "1x2",
  "5x0",
  "1x0",
  "0x0",
  "0x1",
];

const secondRoundMatches: Match[] = secondRoundRows.map(([group, home, away], index) => ({
  id: `R2-${group}-${index + 1}`,
  round: matches.length + index + 1,
  group: `Grupo ${group}`,
  home: team(home),
  away: team(away),
  result: score(secondRoundResults[index]),
}));

const rawSecondRoundPredictions: Array<Record<string, string>> = [
  { Rhômulo: "2x0" },
  { Amim: "2x1", Heitor: "3x1", Roger: "3x1", Willie: "1x2", Estevão: "1x1", Rhenan: "1x1", JP: "2x1", Zanuto: "1x1" },
  { Roger: "1x0", Estevão: "2x1" },
  { Amim: "3x1", Heitor: "2x0", Rhômulo: "2x1", Willie: "2x1", Rhenan: "2x1", JP: "2x0", Zanuto: "1x1" },
  { Roger: "0x2", Rhômulo: "0x2", Willie: "0x3", Rhenan: "0x2" },
  { Amim: "3x0", Heitor: "3x0", Estevão: "3x0", JP: "5x0", Zanuto: "3x0" },
  { Amim: "4x1", Heitor: "2x1", Rhômulo: "2x0", Estevão: "2x0", Rhenan: "2x2", JP: "2x1", Zanuto: "2x1" },
  { Roger: "2x0", Willie: "2x0" },
  { Amim: "3x1", Heitor: "3x1", JP: "3x1", Zanuto: "3x1" },
  { Roger: "3x0", Rhômulo: "2x0", Willie: "1x1", Estevão: "2x0", Rhenan: "3x0" },
  { Amim: "3x2", Estevão: "1x0", JP: "2x1" },
  { Heitor: "0x2", Roger: "0x2", Rhômulo: "1x3", Willie: "0x2", Rhenan: "0x2", Zanuto: "0x2" },
  { Amim: "2x0", Heitor: "3x2", Roger: "2x0", Rhômulo: "2x0", Estevão: "2x0", Rhenan: "2x1", JP: "2x0", Zanuto: "3x2" },
  { Willie: "1x1" },
  { Heitor: "3x1", Roger: "4x1", Rhômulo: "3x0", Willie: "4x0", Estevão: "3x0", Rhenan: "2x0", JP: "3x0", Zanuto: "2x0" },
  { Amim: "2x0" },
  { Amim: "4x1", Heitor: "5x0", Roger: "6x0", Rhômulo: "4x0", Willie: "4x0", Estevão: "3x0", Rhenan: "6x0", JP: "4x0", Zanuto: "4x0" },
  {},
  { Amim: "2x0", Heitor: "2x1", Roger: "1x0", Rhômulo: "2x1", Willie: "1x0", Estevão: "2x0", Rhenan: "2x1", JP: "2x0", Zanuto: "2x0" },
  {},
  { Amim: "2x0", Heitor: "2x0", Roger: "4x0", Willie: "3x1", Estevão: "2x0", Rhenan: "4x0", JP: "3x0", Zanuto: "2x0" },
  { Rhômulo: "2x0" },
  { Amim: "3x1", Heitor: "3x0", Roger: "4x0", Rhômulo: "4x1", Rhenan: "2x0", JP: "2x1", Zanuto: "4x1" },
  { Willie: "0x2", Estevão: "0x1" },
];

const secondRoundPredictions: Prediction[] = rawSecondRoundPredictions.flatMap((row, matchIndex) =>
  Object.entries(row).map(([name, value]) => ({
    participantId: participants.find((participant) => participant.name === name)!.id,
    matchId: secondRoundMatches[matchIndex].id,
    score: score(value),
  })),
);

const thirdRoundRows = [
  ["A", "República Tcheca", "México"],
  ["A", "África do Sul", "Coreia do Sul"],
  ["B", "Suíça", "Canadá"],
  ["B", "Bósnia e Herzegovina", "Catar"],
  ["C", "Escócia", "Brasil"],
  ["C", "Marrocos", "Haiti"],
  ["D", "Turquia", "Estados Unidos"],
  ["D", "Paraguai", "Austrália"],
  ["E", "Equador", "Alemanha"],
  ["E", "Curaçao", "Costa do Marfim"],
  ["F", "Japão", "Suécia"],
  ["F", "Tunísia", "Holanda"],
  ["G", "Egito", "Irã"],
  ["G", "Nova Zelândia", "Bélgica"],
  ["H", "Cabo Verde", "Arábia Saudita"],
  ["H", "Uruguai", "Espanha"],
  ["I", "Noruega", "França"],
  ["I", "Senegal", "Iraque"],
  ["J", "Argélia", "Áustria"],
  ["J", "Jordânia", "Argentina"],
  ["K", "Colômbia", "Portugal"],
  ["K", "RD Congo", "Uzbequistão"],
  ["L", "Panamá", "Inglaterra"],
  ["L", "Croácia", "Gana"],
] as const;

const thirdRoundResults = [
  "0x3",
  "1x0",
  "2x1",
  "3x1",
  "0x3",
  "4x2",
  "3x2",
  "0x0",
  "2x1",
  "0x2",
  "1x1",
  "1x3",
  "1x1",
  "1x5",
  "0x0",
  "0x1",
  "1x4",
  "5x0",
  "3x3",
  "1x3",
  "0x0",
  "3x1",
  "0x2",
  "2x1",
];

const thirdRoundMatches: Match[] = thirdRoundRows.map(([group, home, away], index) => ({
  id: `R3-${group}-${index + 1}`,
  round: matches.length + secondRoundMatches.length + index + 1,
  group: `Grupo ${group}`,
  home: team(home),
  away: team(away),
  result: thirdRoundResults[index] ? score(thirdRoundResults[index]) : undefined,
}));

const rawThirdRoundPredictions: Array<Record<string, string>> = [
  { Estevão: "1x2", Zanuto: "1x2", Heitor: "1x3", Amim: "0x3" },
  { Willie: "0x2", Rhômulo: "1x3", Roger: "0x1", Rhenan: "1x2", JP: "1x2" },
  { Estevão: "2x1", JP: "1x1", Roger: "1x1", Rhenan: "1x1" },
  { Zanuto: "1x0", Willie: "2x0", Amim: "2x0", Rhômulo: "2x0", Heitor: "2x0" },
  { Estevão: "0x3", Zanuto: "0x2", Heitor: "0x2" },
  { Willie: "4x0", Amim: "3x0", Rhômulo: "2x0", JP: "3x0", Roger: "4x0", Rhenan: "3x0" },
  { Zanuto: "0x2", Willie: "0x3", Amim: "0x4", Rhômulo: "1x2", JP: "0x4", Heitor: "1x3", Rhenan: "0x4", Estevão: "0x2" },
  { Roger: "1x1" },
  { Zanuto: "0x2", Heitor: "0x3" },
  { Estevão: "0x2", Willie: "0x2", Amim: "0x3", Rhômulo: "0x2", JP: "0x2", Roger: "1x3", Rhenan: "0x2" },
  {},
  { Zanuto: "0x4", Willie: "0x4", Amim: "0x4", Rhômulo: "0x3", JP: "0x5", Heitor: "1x4", Roger: "0x3", Rhenan: "0x5", Estevão: "0x2" },
  { Heitor: "2x2" },
  { Estevão: "0x1", Zanuto: "1x2", Willie: "1x3", Amim: "2x3", Rhômulo: "0x2", JP: "0x2", Roger: "0x2", Rhenan: "0x2" },
  { Willie: "1x0", JP: "1x0", Heitor: "2x1", Rhenan: "1x0", Amim: "1x0" },
  { Estevão: "1x2", Zanuto: "1x2", Rhômulo: "1x3", Roger: "1x1" },
  { Zanuto: "1x3", Roger: "1x3", Rhômulo: "1x3" },
  { Estevão: "2x0", Willie: "2x0", Amim: "3x1", JP: "2x0", Heitor: "2x0", Rhenan: "2x0" },
  { JP: "0x2", Rhenan: "0x2" },
  { Estevão: "0x3", Zanuto: "0x3", Willie: "0x5", Amim: "0x4", Rhômulo: "0x4", Heitor: "0x3", Roger: "0x2" },
  { Estevão: "1x2", Rhômulo: "1x2", JP: "0x2", Heitor: "3x4", Rhenan: "0x2" },
  { Zanuto: "1x0", Willie: "1x1", Amim: "2x0", Roger: "2x0" },
  { Estevão: "0x3", Zanuto: "1x3", Willie: "1x3", Amim: "0x4", Rhômulo: "0x5", JP: "1x4", Heitor: "0x2", Rhenan: "1x4" },
  { Roger: "1x0" },
];

const thirdRoundPredictions: Prediction[] = rawThirdRoundPredictions.flatMap((row, matchIndex) =>
  Object.entries(row).map(([name, value]) => ({
    participantId: participants.find((participant) => participant.name === name)!.id,
    matchId: thirdRoundMatches[matchIndex].id,
    score: score(value),
  })),
);

const knockoutRows = [
  ["Mata-mata", "África do Sul", "Canadá"],
  ["Mata-mata", "Brasil", "Japão"],
  ["Mata-mata", "Alemanha", "Paraguai"],
  ["Mata-mata", "Holanda", "Marrocos"],
] as const;

const knockoutResults = ["0x1", "2x1", "1x1", "1x1"];

const knockoutMatches: Match[] = knockoutRows.map(([stage, home, away], index) => ({
  id: `KO-${index + 1}`,
  round: matches.length + secondRoundMatches.length + thirdRoundMatches.length + index + 1,
  group: stage,
  home: team(home),
  away: team(away),
  result: knockoutResults[index] ? score(knockoutResults[index]) : undefined,
}));

const rawKnockoutPredictions: Array<Record<string, string>> = [
  { JP: "0x2", Zanuto: "1x1", Rhômulo: "0x2", Willie: "0x2", Estevão: "2x1", Rhenan: "1x2", Heitor: "1x2", Roger: "0x2", Amim: "1x2" },
  { JP: "2x1", Zanuto: "2x1", Rhômulo: "1x0", Willie: "3x1", Estevão: "3x1", Rhenan: "2x0", Heitor: "2x0", Roger: "0x0", Amim: "2x0" },
  { JP: "3x0", Zanuto: "2x1", Rhômulo: "2x0", Willie: "4x0", Estevão: "2x0", Rhenan: "2x1", Heitor: "3x1", Roger: "3x0", Amim: "3x1" },
  { JP: "3x1", Zanuto: "3x2", Rhômulo: "1x1", Willie: "2x1", Estevão: "2x1", Rhenan: "2x1", Heitor: "1x1", Roger: "0x2", Amim: "3x2" },
];

const knockoutPredictions: Prediction[] = rawKnockoutPredictions.flatMap((row, matchIndex) =>
  Object.entries(row).map(([name, value]) => ({
    participantId: participants.find((participant) => participant.name === name)!.id,
    matchId: knockoutMatches[matchIndex].id,
    score: score(value),
  })),
);

const knockoutSecondRows = [
  ["Mata-mata", "Costa do Marfim", "Noruega"],
  ["Mata-mata", "França", "Suécia"],
  ["Mata-mata", "México", "Equador"],
  ["Mata-mata", "Inglaterra", "RD Congo"],
  ["Mata-mata", "Bélgica", "Senegal"],
  ["Mata-mata", "Estados Unidos", "Bósnia e Herzegovina"],
] as const;

const knockoutSecondMatches: Match[] = knockoutSecondRows.map(([stage, home, away], index) => ({
  id: `KO2-${index + 1}`,
  round: matches.length + secondRoundMatches.length + thirdRoundMatches.length + knockoutMatches.length + index + 1,
  group: stage,
  home: team(home),
  away: team(away),
}));

const rawKnockoutSecondPredictions: Array<Record<string, string>> = [
  { Rhômulo: "1x2", Rhenan: "1x2", Zanuto: "2x3", Amim: "1x1", JP: "1x2", Roger: "0x1" },
  { Rhômulo: "3x1", Rhenan: "3x0", Zanuto: "4x0", Amim: "2x0", JP: "3x0", Roger: "2x0" },
  { Rhômulo: "1x1", Rhenan: "1x2", Zanuto: "2x1", Amim: "2x1", JP: "1x1", Roger: "0x0" },
  { Rhômulo: "2x0", Rhenan: "2x0", Zanuto: "3x0", Amim: "2x1", JP: "3x0", Roger: "1x0" },
  { Rhômulo: "1x2", Rhenan: "1x1", Zanuto: "2x1", Amim: "2x2", JP: "1x1", Roger: "1x0" },
  { Rhômulo: "3x1", Rhenan: "2x0", Zanuto: "2x1", Amim: "3x1", JP: "2x0", Roger: "1x1" },
];

const knockoutSecondPredictions: Prediction[] = rawKnockoutSecondPredictions.flatMap((row, matchIndex) =>
  Object.entries(row).map(([name, value]) => ({
    participantId: participants.find((participant) => participant.name === name)!.id,
    matchId: knockoutSecondMatches[matchIndex].id,
    score: score(value),
  })),
);

export const initialData: PoolData = {
  participants,
  matches: [...matches, ...secondRoundMatches, ...thirdRoundMatches, ...knockoutMatches, ...knockoutSecondMatches],
  predictions: [...predictions, ...secondRoundPredictions, ...thirdRoundPredictions, ...knockoutPredictions, ...knockoutSecondPredictions],
  longTermPicks: [
    { participantId: "willie", champion: "França", runnerUp: "Espanha", topScorer: "Mbappé", brazilPosition: "Semifinal" },
    { participantId: "rhomulo", champion: "França", runnerUp: "Brasil", topScorer: "Mbappé", brazilPosition: "Final (Vice)" },
    { participantId: "jp", champion: "França", runnerUp: "Brasil", topScorer: "Mbappé", brazilPosition: "Final (Vice)" },
    { participantId: "heitor", champion: "França", runnerUp: "Brasil", topScorer: "Mbappé", brazilPosition: "Final (Vice)" },
    { participantId: "zanuto", champion: "França", runnerUp: "Inglaterra", topScorer: "Harry Kane", brazilPosition: "Semifinal" },
    { participantId: "estevao", champion: "Brasil", runnerUp: "Espanha", topScorer: "Vini Jr.", brazilPosition: "Campeão" },
    { participantId: "rhenan", champion: "Portugal", runnerUp: "Espanha", topScorer: "Harry Kane", brazilPosition: "Quartas" },
    { participantId: "roger", champion: "Portugal", runnerUp: "França", topScorer: "Cristiano Ronaldo", brazilPosition: "Quartas" },
    { participantId: "amim", champion: "Brasil", runnerUp: "Alemanha", topScorer: "Vini Jr.", brazilPosition: "Campeão" },
  ],
  longTermOfficial: {},
};
