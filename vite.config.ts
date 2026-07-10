import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fetchApiFootballUpdates, fetchPublicWebUpdates } from "./server/apiFootball";

export default defineConfig({
  plugins: [
    {
      name: "local-api-football-proxy",
      configureServer(server) {
        server.middlewares.use("/api/update-results", async (req, res) => {
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.end(JSON.stringify({ error: "Method not allowed" }));
            return;
          }

          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
          });
          req.on("end", async () => {
            res.setHeader("Content-Type", "application/json");

            try {
              const payload = JSON.parse(body || "{}");
              const apiKey = payload.apiKey || process.env.API_FOOTBALL_KEY;
              const matches = payload.matches ?? [];
              const result = apiKey
                ? await fetchApiFootballUpdates({
                    apiKey,
                    leagueId: payload.leagueId || process.env.API_FOOTBALL_LEAGUE_ID || "1",
                    season: payload.season || process.env.API_FOOTBALL_SEASON || "2026",
                    matches,
                  })
                : await fetchPublicWebUpdates(matches);

              res.end(JSON.stringify({ ...result, source: apiKey ? "API-Football / API-Sports" : "Busca pública na web" }));
            } catch (error) {
              try {
                const payload = JSON.parse(body || "{}");
                const fallback = await fetchPublicWebUpdates(payload.matches ?? []);
                res.end(
                  JSON.stringify({
                    ...fallback,
                    source: "Busca pública na web",
                    warning: error instanceof Error ? error.message : "API-Football indisponível.",
                  }),
                );
              } catch {
                res.statusCode = 502;
                res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Não consegui buscar os resultados." }));
              }
            }
          });
        });
      },
    },
    react(),
  ],
});
