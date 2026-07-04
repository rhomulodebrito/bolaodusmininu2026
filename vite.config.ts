import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fetchFifaMoments } from "./server/fifaMoments";

export default defineConfig({
  plugins: [
    {
      name: "local-fifa-moments-proxy",
      configureServer(server) {
        server.middlewares.use("/api/fifa-moments", async (_req, res) => {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ moments: await fetchFifaMoments() }));
        });
      },
    },
    react(),
  ],
});
