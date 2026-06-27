import { fetchApiFootballUpdates, fetchPublicWebUpdates, type MatchInput } from "../server/apiFootball";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.API_FOOTBALL_KEY || req.body?.apiKey;
  const matches = (req.body?.matches ?? []) as MatchInput[];

  try {
    const result = apiKey
      ? await fetchApiFootballUpdates({
          apiKey,
          leagueId: req.body?.leagueId || process.env.API_FOOTBALL_LEAGUE_ID || "1",
          season: req.body?.season || process.env.API_FOOTBALL_SEASON || "2026",
          matches,
        })
      : await fetchPublicWebUpdates(matches);

    res.status(200).json({
      ...result,
      source: apiKey ? "API-Football / API-Sports" : "Busca pública na web",
    });
  } catch (error) {
    const fallback = await fetchPublicWebUpdates(matches);
    res.status(200).json({
      ...fallback,
      source: "Busca pública na web",
      warning: error instanceof Error ? error.message : "API-Football indisponível.",
    });
  }
}
