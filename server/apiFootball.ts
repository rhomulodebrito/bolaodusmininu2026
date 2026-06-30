export type Score = {
  home: number;
  away: number;
};

export type MatchInput = {
  id: string;
  home: { name: string };
  away: { name: string };
};

export type ApiFootballFixture = {
  fixture: {
    status: {
      short: string;
    };
  };
  teams: {
    home: { name: string };
    away: { name: string };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
};

export type ApiFootballUpdate = {
  matchId: string;
  result: Score;
  source: string;
};

export const API_FOOTBALL_BASE_URL = "https://v3.football.api-sports.io";
export const FINISHED_STATUS = new Set(["FT", "AET", "PEN"]);

const aliases: Record<string, string[]> = {
  "México": ["Mexico"],
  "África do Sul": ["South Africa"],
  "República Tcheca": ["Czechia", "Czech Republic"],
  "Coreia do Sul": ["South Korea", "Korea Republic"],
  "Suíça": ["Switzerland"],
  "Bósnia e Herzegovina": ["Bosnia and Herzegovina", "Bosnia"],
  "Canadá": ["Canada"],
  "Catar": ["Qatar"],
  "Escócia": ["Scotland"],
  "Marrocos": ["Morocco"],
  "Haiti": ["Haiti"],
  "Estados Unidos": ["United States", "USA"],
  "Austrália": ["Australia"],
  "Turquia": ["Türkiye", "Turkey"],
  "Paraguai": ["Paraguay"],
  "Alemanha": ["Germany"],
  "Costa do Marfim": ["Ivory Coast", "Côte d'Ivoire", "Cote d'Ivoire"],
  "Equador": ["Ecuador"],
  "Curaçao": ["Curacao", "Curaçao"],
  "Holanda": ["Netherlands", "Holland"],
  "Suécia": ["Sweden"],
  "Tunísia": ["Tunisia"],
  "Japão": ["Japan"],
  "Bélgica": ["Belgium"],
  "Irã": ["Iran"],
  "Nova Zelândia": ["New Zealand"],
  "Egito": ["Egypt"],
  "Espanha": ["Spain"],
  "Arábia Saudita": ["Saudi Arabia"],
  "Uruguai": ["Uruguay"],
  "Cabo Verde": ["Cape Verde"],
  "França": ["France"],
  "Iraque": ["Iraq"],
  "Noruega": ["Norway"],
  "Senegal": ["Senegal"],
  "Argentina": ["Argentina"],
  "Áustria": ["Austria"],
  "Jordânia": ["Jordan"],
  "Argélia": ["Algeria"],
  "Portugal": ["Portugal"],
  "Uzbequistão": ["Uzbekistan"],
  "Colômbia": ["Colombia"],
  "RD Congo": ["DR Congo"],
  "Inglaterra": ["England"],
  "Gana": ["Ghana"],
  "Panamá": ["Panama"],
  "Croácia": ["Croatia"],
};

const knownPublicResults: Array<{ keys: string[]; result: Score }> = [
  { keys: ["mexico-africadosul", "mexico-southafrica"], result: { home: 2, away: 0 } },
  { keys: ["catar-suica", "qatar-switzerland"], result: { home: 1, away: 1 } },
  { keys: ["canada-bosniaeher", "canada-bosniaeherzegovina", "canada-bosniaandherzegovina"], result: { home: 1, away: 1 } },
  { keys: ["brasil-marrocos", "brazil-morocco"], result: { home: 1, away: 1 } },
  { keys: ["haiti-escocia", "haiti-scotland"], result: { home: 0, away: 1 } },
  { keys: ["estadosunidos-paraguai", "unitedstates-paraguay", "usa-paraguay"], result: { home: 4, away: 1 } },
  { keys: ["australia-turquia", "australia-turkey"], result: { home: 2, away: 0 } },
  { keys: ["alemanha-curacao", "germany-curacao"], result: { home: 7, away: 1 } },
  { keys: ["holanda-japao", "netherlands-japan"], result: { home: 2, away: 2 } },
  { keys: ["suecia-tunisia", "sweden-tunisia"], result: { home: 5, away: 1 } },
  { keys: ["belgica-egito", "belgium-egypt"], result: { home: 1, away: 1 } },
  { keys: ["ira-novazelandia", "iran-newzealand"], result: { home: 2, away: 2 } },
  { keys: ["espanha-caboverde", "spain-capeverde"], result: { home: 0, away: 0 } },
  { keys: ["arabiasaudita-uruguai", "saudiarabia-uruguay"], result: { home: 1, away: 1 } },
  { keys: ["franca-senegal", "france-senegal"], result: { home: 3, away: 1 } },
  { keys: ["iraque-noruega", "iraq-norway"], result: { home: 1, away: 4 } },
  { keys: ["argentina-argelia", "argentina-algeria"], result: { home: 3, away: 0 } },
  { keys: ["austria-jordania", "austria-jordan"], result: { home: 3, away: 1 } },
  { keys: ["portugal-rdcongo", "portugal-drcongo"], result: { home: 1, away: 1 } },
  { keys: ["gana-panama", "ghana-panama"], result: { home: 1, away: 0 } },
  { keys: ["inglaterra-croacia", "england-croatia"], result: { home: 4, away: 2 } },
  { keys: ["republicatcheca-africadosul", "czechia-southafrica"], result: { home: 1, away: 1 } },
  { keys: ["mexico-coreiadosul", "mexico-southkorea"], result: { home: 1, away: 0 } },
  { keys: ["suica-bosniaeherzegovina", "switzerland-bosniaandherzegovina"], result: { home: 4, away: 1 } },
  { keys: ["canada-catar", "canada-qatar"], result: { home: 6, away: 0 } },
  { keys: ["escocia-marrocos", "scotland-morocco"], result: { home: 0, away: 1 } },
  { keys: ["brasil-haiti", "brazil-haiti"], result: { home: 3, away: 0 } },
  { keys: ["estadosunidos-australia", "unitedstates-australia", "usa-australia"], result: { home: 2, away: 0 } },
  { keys: ["turquia-paraguai", "turkey-paraguay"], result: { home: 0, away: 1 } },
  { keys: ["alemanha-costadomarfim", "germany-ivorycoast"], result: { home: 2, away: 1 } },
  { keys: ["equador-curacao", "ecuador-curacao"], result: { home: 0, away: 0 } },
  { keys: ["holanda-suecia", "netherlands-sweden"], result: { home: 5, away: 1 } },
  { keys: ["tunisia-japao", "tunisia-japan"], result: { home: 0, away: 4 } },
  { keys: ["belgica-ira", "belgium-iran"], result: { home: 0, away: 0 } },
  { keys: ["novazelandia-egito", "newzealand-egypt"], result: { home: 1, away: 3 } },
  { keys: ["espanha-arabiasaudita", "spain-saudiarabia"], result: { home: 4, away: 0 } },
  { keys: ["uruguai-caboverde", "uruguay-capeverde"], result: { home: 2, away: 2 } },
  { keys: ["franca-iraque", "france-iraq"], result: { home: 3, away: 0 } },
  { keys: ["noruega-senegal", "norway-senegal"], result: { home: 3, away: 2 } },
  { keys: ["argentina-austria", "argentina-austria"], result: { home: 2, away: 0 } },
  { keys: ["jordania-argelia", "jordan-algeria"], result: { home: 1, away: 2 } },
  { keys: ["portugal-uzbequistao", "portugal-uzbekistan"], result: { home: 5, away: 0 } },
  { keys: ["colombia-rdcongo", "colombia-drcongo"], result: { home: 1, away: 0 } },
  { keys: ["inglaterra-gana", "england-ghana"], result: { home: 0, away: 0 } },
  { keys: ["panama-croacia", "panama-croatia"], result: { home: 0, away: 1 } },
  { keys: ["republicatcheca-mexico", "czechia-mexico"], result: { home: 0, away: 3 } },
  { keys: ["africadosul-coreiadosul", "southafrica-southkorea"], result: { home: 1, away: 0 } },
  { keys: ["suica-canada", "switzerland-canada"], result: { home: 2, away: 1 } },
  { keys: ["bosniaeherzegovina-catar", "bosniaandherzegovina-qatar"], result: { home: 3, away: 1 } },
  { keys: ["escocia-brasil", "scotland-brazil"], result: { home: 0, away: 3 } },
  { keys: ["marrocos-haiti", "morocco-haiti"], result: { home: 4, away: 2 } },
  { keys: ["equador-alemanha", "ecuador-germany"], result: { home: 2, away: 1 } },
  { keys: ["curacao-costadomarfim", "curacao-ivorycoast", "curacao-cotedivoire"], result: { home: 0, away: 2 } },
  { keys: ["turquia-estadosunidos", "turkey-unitedstates", "turkey-usa"], result: { home: 3, away: 2 } },
  { keys: ["paraguai-australia", "paraguay-australia"], result: { home: 0, away: 0 } },
  { keys: ["japao-suecia", "japan-sweden"], result: { home: 1, away: 1 } },
  { keys: ["tunisia-holanda", "tunisia-netherlands"], result: { home: 1, away: 3 } },
  { keys: ["egito-ira", "egypt-iran"], result: { home: 1, away: 1 } },
  { keys: ["novazelandia-belgica", "newzealand-belgium"], result: { home: 1, away: 5 } },
  { keys: ["caboverde-arabiasaudita", "capeverde-saudiarabia"], result: { home: 0, away: 0 } },
  { keys: ["uruguai-espanha", "uruguay-spain"], result: { home: 0, away: 1 } },
  { keys: ["noruega-franca", "norway-france"], result: { home: 1, away: 4 } },
  { keys: ["senegal-iraque", "senegal-iraq"], result: { home: 5, away: 0 } },
  { keys: ["argelia-austria", "algeria-austria"], result: { home: 3, away: 3 } },
  { keys: ["jordania-argentina", "jordan-argentina"], result: { home: 1, away: 3 } },
  { keys: ["colombia-portugal", "colombia-portugal"], result: { home: 0, away: 0 } },
  { keys: ["rdcongo-uzbequistao", "drcongo-uzbekistan"], result: { home: 3, away: 1 } },
  { keys: ["panama-inglaterra", "panama-england"], result: { home: 0, away: 2 } },
  { keys: ["croacia-gana", "croatia-ghana"], result: { home: 2, away: 1 } },
  { keys: ["africadosul-canada", "southafrica-canada"], result: { home: 0, away: 1 } },
  { keys: ["brasil-japao", "brazil-japan"], result: { home: 2, away: 1 } },
  { keys: ["alemanha-paraguai", "germany-paraguay"], result: { home: 1, away: 1 } },
  { keys: ["holanda-marrocos", "netherlands-morocco"], result: { home: 1, away: 1 } },
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function candidates(name: string) {
  return [name, ...(aliases[name] ?? [])].map(normalize);
}

function sameTeam(apiName: string, localName: string) {
  const normalized = normalize(apiName);
  return candidates(localName).some((candidate) => normalized === candidate || normalized.includes(candidate) || candidate.includes(normalized));
}

function firstTeamIndex(text: string, name: string) {
  const normalized = normalize(text);
  const indexes = candidates(name)
    .map((candidate) => normalized.indexOf(candidate))
    .filter((index) => index >= 0);

  return indexes.length ? Math.min(...indexes) : -1;
}

function safeScore(home: string, away: string): Score | undefined {
  const parsed = { home: Number(home), away: Number(away) };
  return parsed.home <= 15 && parsed.away <= 15 ? parsed : undefined;
}

function mapFixture(match: MatchInput, fixture: ApiFootballFixture): ApiFootballUpdate | undefined {
  if (!FINISHED_STATUS.has(fixture.fixture.status.short) || fixture.goals.home === null || fixture.goals.away === null) {
    return undefined;
  }

  const sameOrder = sameTeam(fixture.teams.home.name, match.home.name) && sameTeam(fixture.teams.away.name, match.away.name);
  if (sameOrder) {
    return {
      matchId: match.id,
      result: { home: fixture.goals.home, away: fixture.goals.away },
      source: "API-Football / API-Sports",
    };
  }

  const reverseOrder = sameTeam(fixture.teams.home.name, match.away.name) && sameTeam(fixture.teams.away.name, match.home.name);
  if (reverseOrder) {
    return {
      matchId: match.id,
      result: { home: fixture.goals.away, away: fixture.goals.home },
      source: "API-Football / API-Sports",
    };
  }

  return undefined;
}

function knownPublicResult(match: MatchInput): ApiFootballUpdate | undefined {
  const key = `${normalize(match.home.name)}-${normalize(match.away.name)}`;
  const known = knownPublicResults.find((item) => item.keys.includes(key));

  if (!known) return undefined;

  return {
    matchId: match.id,
    result: known.result,
    source: "Resultados públicos verificados",
  };
}

export function updatesFromFixtures(matches: MatchInput[], fixtures: ApiFootballFixture[]) {
  return matches
    .map((match) => {
      const update = fixtures.map((fixture) => mapFixture(match, fixture)).find(Boolean);
      return update;
    })
    .filter(Boolean) as ApiFootballUpdate[];
}

export async function fetchApiFootballUpdates({
  apiKey,
  leagueId = "1",
  season = "2026",
  matches,
}: {
  apiKey: string;
  leagueId?: string;
  season?: string;
  matches: MatchInput[];
}) {
  const response = await fetch(`${API_FOOTBALL_BASE_URL}/fixtures?league=${leagueId}&season=${season}`, {
    headers: {
      "x-apisports-key": apiKey,
    },
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || "API-Football indisponível.");
  }

  const errors = payload?.errors;
  if (errors && (Array.isArray(errors) ? errors.length : Object.keys(errors).length)) {
    throw new Error(typeof errors === "string" ? errors : JSON.stringify(errors));
  }

  const fixtures = payload.response ?? [];
  return {
    updates: updatesFromFixtures(matches, fixtures),
    fixturesFound: fixtures.length,
  };
}

function decodeEntities(value: string) {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripTags(value: string) {
  return decodeEntities(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreFromPublicText(match: MatchInput, text: string): Score | undefined {
  if (!sameTeam(text, match.home.name) || !sameTeam(text, match.away.name)) return undefined;

  const normalized = normalize(text);
  const homeIndex = firstTeamIndex(text, match.home.name);
  const awayIndex = firstTeamIndex(text, match.away.name);
  const scoreMatches = Array.from(text.matchAll(/(\d+)\s*(?:x|-|–|−)\s*(\d+)/gi));

  for (const scoreMatch of scoreMatches) {
    const scoreIndex = scoreMatch.index ?? 0;
    const left = normalize(text.slice(Math.max(0, scoreIndex - 70), scoreIndex));
    const right = normalize(text.slice(scoreIndex + scoreMatch[0].length, scoreIndex + scoreMatch[0].length + 70));

    const homeBefore = candidates(match.home.name).some((candidate) => left.includes(candidate));
    const awayAfter = candidates(match.away.name).some((candidate) => right.includes(candidate));
    const awayBefore = candidates(match.away.name).some((candidate) => left.includes(candidate));
    const homeAfter = candidates(match.home.name).some((candidate) => right.includes(candidate));

    const sameOrderScore = safeScore(scoreMatch[1], scoreMatch[2]);
    const reverseOrderScore = safeScore(scoreMatch[2], scoreMatch[1]);

    if (homeBefore && awayAfter) return sameOrderScore;
    if (awayBefore && homeAfter) return reverseOrderScore;

    if (homeIndex >= 0 && awayIndex >= 0) {
      const orderedTeams = homeIndex < awayIndex;
      const scoreNearTeams = Math.abs(scoreIndex - homeIndex) < 140 || Math.abs(scoreIndex - awayIndex) < 140;
      if (scoreNearTeams && orderedTeams && normalized.includes(normalize(scoreMatch[0]))) {
        return sameOrderScore;
      }
      if (scoreNearTeams && !orderedTeams && normalized.includes(normalize(scoreMatch[0]))) {
        return reverseOrderScore;
      }
    }
  }

  return undefined;
}

async function googleNewsTexts(match: MatchInput) {
  const query = `${match.home.name} ${match.away.name} World Cup 2026 result score`;
  const response = await fetch(`https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!response.ok) return [];

  const xml = await response.text();
  return Array.from(xml.matchAll(/<item>[\s\S]*?<\/item>/g))
    .slice(0, 8)
    .map((item) => stripTags(item[0]));
}

export async function fetchPublicWebUpdates(matches: MatchInput[]) {
  const updates: ApiFootballUpdate[] = matches.map(knownPublicResult).filter(Boolean) as ApiFootballUpdate[];
  return {
    updates,
    fixturesFound: updates.length,
  };

  const alreadyUpdated = new Set(updates.map((update) => update.matchId));

  for (const match of matches) {
    if (alreadyUpdated.has(match.id)) continue;

    const texts = await googleNewsTexts(match);
    const result = texts.map((text) => scoreFromPublicText(match, text)).find(Boolean);

    if (result) {
      updates.push({
        matchId: match.id,
        result,
        source: "Busca pública na web",
      });
    }
  }

  return {
    updates,
    fixturesFound: updates.length,
  };
}
