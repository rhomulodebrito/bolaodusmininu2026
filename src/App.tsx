import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  BarChart3,
  Download,
  FileSpreadsheet,
  Medal,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Upload,
  Users,
  History,
  Images,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { initialData } from "./data/sampleData";
import { buildRanking, scorePrediction, scoreText, statusTone } from "./lib/scoring";
import type { LongTermPick, Match, Participant, PoolData, Prediction, Score, ScoredPrediction } from "./types";

const palette = ["#22c55e", "#f97316", "#facc15", "#38bdf8", "#a78bfa", "#fb7185", "#14b8a6", "#f8fafc", "#60a5fa"];
const participantLineColors: Record<string, string> = {
  willie: "#f8fafc",
  rhomulo: "#f97316",
  estevao: "#facc15",
  jp: "#38bdf8",
  heitor: "#a78bfa",
  zanuto: "#22c55e",
  rhenan: "#fb7185",
  roger: "#14b8a6",
  amim: "#60a5fa",
};
const stadiumImage =
  "https://upload.wikimedia.org/wikipedia/commons/6/6e/Lusail_Stadium.jpg";
const bolaoLogo = "/bolao-logo.png";
const avatarImages: Record<string, string> = {
  amim: "/avatars/amim.png",
  estevao: "/avatars/estevao.png",
  heitor: "/avatars/heitor.png",
  jp: "/avatars/jp.png",
  rhenan: "/avatars/rhenan.png",
  rhomulo: "/avatars/rhomulo.png",
  roger: "/avatars/roger.png",
  willie: "/avatars/willie.png",
  zanuto: "/avatars/zanutto.png",
};
const fifaMomentCards = [
  {
    title: "Mbappe em foco",
    label: "Momentos da Copa",
    href: "https://www.fifa.com/pt/tournaments/mens/worldcup",
    image: "/moments/franca-mbappe.png",
    position: "58% 22%",
  },
  {
    title: "Haaland pela Noruega",
    label: "Jogos e resultados",
    href: "https://www.fifa.com/pt/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures",
    image: "/moments/noruega-haaland.png",
    position: "50% 18%",
  },
  {
    title: "Senegal em destaque",
    label: "Notícias da Copa",
    href: "https://www.fifa.com/pt/tournaments/mens/worldcup/canadamexicousa2026/articles",
    image: "/moments/senegal-comemoracao.png",
    position: "52% 20%",
  },
];

const worldCupGallery = [
  { title: "Mbappe pela Franca", image: "/moments/franca-mbappe.png", position: "58% 22%" },
  { title: "Haaland pela Noruega", image: "/moments/noruega-haaland.png", position: "50% 18%" },
  { title: "Senegal em destaque", image: "/moments/senegal-comemoracao.png", position: "52% 20%" },
  { title: "Cabo Verde em festa", image: "/moments/caboverde-comemoracao.png", position: "50% 28%" },
  { title: "Uruguai em campo", image: "/moments/uruguai-arabia.png", position: "46% 45%" },
  { title: "Vini Jr. com a Seleção", image: "/moments/brasil-vini.png", position: "54% 22%" },
  { title: "Comemoração do Brasil", image: "/moments/brasil-comemoracao.png", position: "48% 30%" },
  { title: "Messi em campo", image: "/moments/argentina-messi.png", position: "50% 28%" },
  { title: "Brasil x Marrocos", image: "/moments/brasil-marrocos.png", position: "58% 38%" },
  { title: "Torcida de Curaçao", image: "/moments/torcida-curacao.png", position: "50% 28%" },
  { title: "Gakpo pela Holanda", image: "/moments/holanda-gakpo.png", position: "52% 24%" },
  { title: "Comemoração da Espanha", image: "/moments/espanha-comemoracao.png", position: "58% 35%" },
  { title: "Talento belga", image: "/moments/belgica-talento.png", position: "50% 24%" },
  { title: "Bósnia em festa", image: "/moments/bosnia-comemoracao.png", position: "58% 32%" },
  { title: "Neymar com a Seleção", image: "/moments/brasil-neymar.png", position: "50% 20%" },
];

const tabBackgroundImages: Record<string, string> = {
  dashboard: "/moments/franca-mbappe.png",
  ranking: "/moments/noruega-haaland.png",
  participant: "/moments/caboverde-comemoracao.png",
  matches: "/moments/uruguai-arabia.png",
  predictions: "/moments/senegal-comemoracao.png",
  medals: "/moments/argentina-messi.png",
  longTerm: "/moments/brasil-neymar.png",
  moments: "/moments/brasil-comemoracao.png",
  import: "/moments/brasil-marrocos.png",
};

const tabBackgroundPositions: Record<string, string> = {
  dashboard: "58% 18%",
  ranking: "50% 18%",
  participant: "46% 25%",
  matches: "48% 42%",
  predictions: "54% 20%",
  medals: "50% 26%",
  longTerm: "50% 18%",
  moments: "48% 28%",
  import: "58% 38%",
};
type Tab = "dashboard" | "ranking" | "participant" | "matches" | "predictions" | "medals" | "longTerm" | "moments" | "import";

type OfficialResultUpdate = {
  matchId: string;
  result: Score;
  source: string;
};

type OfficialResultResponse = {
  updates: OfficialResultUpdate[];
  fixturesFound: number;
  source: string;
};

type MedalRow = {
  label: string;
  value: string;
  note: string;
  icon: React.ElementType;
  tone: string;
};

const localVerifiedResults: Record<string, Score> = {
  "equador-curacao": { home: 0, away: 0 },
  "equador-alemanha": { home: 2, away: 1 },
  "curacao-costadomarfim": { home: 0, away: 2 },
  "turquia-estadosunidos": { home: 3, away: 2 },
  "paraguai-australia": { home: 0, away: 0 },
  "japao-suecia": { home: 1, away: 1 },
  "tunisia-holanda": { home: 1, away: 3 },
  "egito-ira": { home: 1, away: 1 },
  "novazelandia-belgica": { home: 1, away: 5 },
  "caboverde-arabiasaudita": { home: 0, away: 0 },
  "uruguai-espanha": { home: 0, away: 1 },
  "noruega-franca": { home: 1, away: 4 },
  "senegal-iraque": { home: 5, away: 0 },
  "argelia-austria": { home: 3, away: 3 },
  "jordania-argentina": { home: 1, away: 3 },
  "colombia-portugal": { home: 0, away: 0 },
  "rdcongo-uzbequistao": { home: 3, away: 1 },
  "panama-inglaterra": { home: 0, away: 2 },
  "croacia-gana": { home: 2, away: 1 },
  "africadosul-canada": { home: 0, away: 1 },
};

const pendingGoogleFixtureKeys = new Set<string>([
]);

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cx("glass-card p-4", className)}>{children}</section>;
}

function participantAvatar(participant: Participant) {
  return avatarImages[participant.id] ?? "";
}

function participantLineColor(participant: Participant, index: number) {
  return participantLineColors[participant.id] ?? palette[index % palette.length];
}

function lineLegendFormatter(value: string | number, entry?: { color?: string }) {
  return <span style={{ color: entry?.color ?? "#e2e8f0", fontWeight: 800 }}>{value}</span>;
}

function IconButton({
  children,
  icon: Icon,
  onClick,
  active,
}: {
  children: React.ReactNode;
  icon: React.ElementType;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      className={cx(
        "inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold transition",
        active ? "bg-amber-300 text-slate-950 shadow-sm" : "bg-white/10 text-slate-100 hover:bg-white/15",
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </button>
  );
}

function SideNav({
  children,
  icon: Icon,
  active,
  onClick,
}: {
  children: React.ReactNode;
  icon: React.ElementType;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={cx(
        "flex h-12 items-center gap-3 rounded-md px-4 text-sm font-bold transition",
        active ? "bg-amber-300/15 text-amber-300 ring-1 ring-amber-300/25" : "text-slate-300 hover:bg-white/8 hover:text-white",
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </button>
  );
}

function parseScore(value: unknown): Score | undefined {
  if (value === undefined || value === null || value === "" || value === "-") return undefined;
  const match = String(value).match(/(\d+)\s*[xX-]\s*(\d+)/);
  if (!match) return undefined;
  return { home: Number(match[1]), away: Number(match[2]) };
}

function matchLabel(match: Match) {
  return `${match.home.name} x ${match.away.name}`;
}

function googleResultSearchUrl(match: Match) {
  const query = `quanto ficou o jogo de ${match.home.name} x ${match.away.name} Copa do Mundo 2026`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function toId(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function matchKey(match: Match) {
  return `${normalizeKey(match.home.name)}-${normalizeKey(match.away.name)}`;
}

type SavedResultMap = Record<string, Score>;

function readSavedResultMap(): SavedResultMap {
  try {
    return JSON.parse(localStorage.getItem("manual-saved-results") ?? "{}");
  } catch {
    return {};
  }
}

function writeSavedResultMap(results: SavedResultMap) {
  localStorage.setItem("manual-saved-results", JSON.stringify(results));
  localStorage.setItem("saved-result-ids", JSON.stringify(Object.keys(results)));
}

function sanitizeResults(data: PoolData, manualResults: SavedResultMap = readSavedResultMap()) {
  return {
    ...data,
    matches: data.matches.map((match) => {
      const manual = manualResults[match.id];
      if (manual) return { ...match, result: manual };

      const key = matchKey(match);
      const verified = localVerifiedResults[key];
      if (verified) return { ...match, result: verified };
      if (pendingGoogleFixtureKeys.has(key)) return { ...match, result: undefined };
      return match;
    }),
  };
}

function readSheet<T extends Record<string, unknown>>(workbook: XLSX.WorkBook, name: string): T[] {
  const sheetName = workbook.SheetNames.find((item) => normalizeKey(item) === normalizeKey(name));
  const sheet = sheetName ? workbook.Sheets[sheetName] : undefined;
  return sheet ? XLSX.utils.sheet_to_json<T>(sheet, { defval: "" }) : [];
}

function readAllSheets(workbook: XLSX.WorkBook) {
  return workbook.SheetNames.map((name) => ({
    name,
    rows: XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[name], { defval: "" }),
  }));
}

function cell(row: Record<string, unknown>, aliases: string[]) {
  const normalized = Object.fromEntries(Object.keys(row).map((key) => [normalizeKey(key), row[key]]));
  return aliases.map(normalizeKey).map((key) => normalized[key]).find((value) => value !== undefined && value !== "");
}

function splitMatchName(value: unknown) {
  const text = String(value ?? "");
  const [home, away] = text.split(/\s+x\s+/i);
  return {
    home: home?.trim() || text.trim(),
    away: away?.trim() || "",
  };
}

function groupName(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) return "Grupo";
  return normalizeKey(text).startsWith("grupo") ? text : `Grupo ${text}`;
}

function buildLongTermPicks(rows: Record<string, unknown>[], participants: Participant[]) {
  return rows
    .map((row) => {
      const participantName = String(cell(row, ["Participante"]) ?? "");
      const participant = participants.find((item) => normalizeKey(item.name) === normalizeKey(participantName));
      return participant
        ? {
            participantId: participant.id,
            champion: String(cell(row, ["Campeão", "Campeao"]) ?? ""),
            runnerUp: String(cell(row, ["Vice-Campeão", "Vice Campeão", "Vice-Campeao", "Vice Campeao", "Vice"]) ?? ""),
            topScorer: String(cell(row, ["Artilheiro"]) ?? ""),
            brazilPosition: String(cell(row, ["Posição do Brasil", "Posição Brasil", "Posicao do Brasil", "Posicao Brasil"]) ?? ""),
          }
        : undefined;
    })
    .filter(Boolean) as LongTermPick[];
}

function importWorkbook(file: File, onData: (data: PoolData) => void) {
  const reader = new FileReader();
  reader.onload = (event) => {
    const workbook = XLSX.read(event.target?.result, { type: "array" });
    const allSheets = readAllSheets(workbook);
    const matrixSheet = allSheets.find(({ rows }) =>
      rows.some((row) => cell(row, ["Grupo"]) && cell(row, ["Jogo"]) && cell(row, ["Resultado Real", "Resultado"])),
    );
    const longTermRows =
      allSheets.find(({ rows }) => rows.some((row) => cell(row, ["Participante"]) && cell(row, ["Campeão", "Campeao"]) && cell(row, ["Artilheiro"])))
        ?.rows ?? readSheet<Record<string, unknown>>(workbook, "Longo Prazo");

    if (matrixSheet) {
      const fixedColumns = ["grupo", "jogo", "resultadoreal", "resultado"];
      const participantNames = Array.from(
        new Set(
          matrixSheet.rows.flatMap((row) =>
            Object.keys(row)
              .filter((key) => !fixedColumns.includes(normalizeKey(key)))
              .filter((key) => matrixSheet.rows.some((candidate) => parseScore(candidate[key]))),
          ),
        ),
      );
      const longTermNames = longTermRows.map((row) => String(cell(row, ["Participante"]) ?? "")).filter(Boolean);
      const participants: Participant[] = Array.from(new Set([...participantNames, ...longTermNames])).map((name) => ({
        id: toId(name),
        name,
        avatar: name.slice(0, 1).toUpperCase(),
      }));
      const matches: Match[] = matrixSheet.rows
        .filter((row) => cell(row, ["Grupo"]) && cell(row, ["Jogo"]))
        .map((row, index) => {
          const teams = splitMatchName(cell(row, ["Jogo"]));
          return {
            id: toId(`${cell(row, ["Grupo"])}-${cell(row, ["Jogo"])}`),
            round: index + 1,
            group: groupName(cell(row, ["Grupo"])),
            home: { name: teams.home, flag: "🏳️" },
            away: { name: teams.away, flag: "🏳️" },
            result: parseScore(cell(row, ["Resultado Real", "Resultado"])),
          };
        });
      const predictions: Prediction[] = matrixSheet.rows.flatMap((row) => {
        const match = matches.find((item) => item.id === toId(`${cell(row, ["Grupo"])}-${cell(row, ["Jogo"])}`));
        if (!match) return [];
        return participantNames
          .map((name) => {
            const score = parseScore(row[name]);
            const participant = participants.find((item) => normalizeKey(item.name) === normalizeKey(name));
            return score && participant ? { participantId: participant.id, matchId: match.id, score } : undefined;
          })
          .filter(Boolean) as Prediction[];
      });

      onData({ participants, matches, predictions, longTermPicks: buildLongTermPicks(longTermRows, participants), longTermOfficial: {} });
      return;
    }

    const jogos = readSheet<Record<string, unknown>>(workbook, "Jogos");
    const palpites = readSheet<Record<string, unknown>>(workbook, "Palpites");
    const longoPrazo = readSheet<Record<string, unknown>>(workbook, "Longo Prazo");
    const matches: Match[] = jogos.map((row, index) => {
      const home = String(cell(row, ["Mandante", "Home"]) ?? "");
      const away = String(cell(row, ["Visitante", "Away"]) ?? "");
      return {
        id: toId(`${cell(row, ["Grupo"]) || index}-${home}-${away}`),
        round: index + 1,
        group: groupName(cell(row, ["Grupo"]) ?? index + 1),
        home: { name: home, flag: "🏳️" },
        away: { name: away, flag: "🏳️" },
        result: parseScore(cell(row, ["Resultado Real", "Resultado"])),
      };
    });
    const participantNames = Array.from(
      new Set([...palpites.map((row) => String(cell(row, ["Participante"]) ?? "")), ...longoPrazo.map((row) => String(cell(row, ["Participante"]) ?? ""))].filter(Boolean)),
    );
    const participants: Participant[] = participantNames.map((name) => ({ id: toId(name), name, avatar: name.slice(0, 1).toUpperCase() }));
    const predictions: Prediction[] = palpites
      .map((row) => {
        const score = parseScore(cell(row, ["Palpite"]));
        const game = String(cell(row, ["Jogo"]) ?? "");
        const match = matches.find((item) => matchLabel(item) === game || item.group === game || item.id === toId(game));
        const participant = participants.find((item) => item.name === cell(row, ["Participante"]));
        return score && match && participant ? { participantId: participant.id, matchId: match.id, score } : undefined;
      })
      .filter(Boolean) as Prediction[];

    onData({ participants, matches, predictions, longTermPicks: buildLongTermPicks(longoPrazo, participants), longTermOfficial: {} });
  };
  reader.readAsArrayBuffer(file);
}

const DATA_VERSION = "group-final-results-2026-06-29";

async function fetchOfficialResults(matches: Match[], apiKey: string, leagueId: string, season: string): Promise<OfficialResultResponse> {
  const response = await fetch("/api/update-results", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ matches, apiKey, leagueId, season }),
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "API-Football indisponível.");
  }

  const apiUpdates = Array.isArray(payload.updates) ? payload.updates : [];
  const apiUpdateIds = new Set(apiUpdates.map((item: OfficialResultUpdate) => item.matchId));
  const verifiedUpdates = matches
    .map((match) => {
      const result = localVerifiedResults[matchKey(match)];
      return result && !apiUpdateIds.has(match.id)
        ? {
            matchId: match.id,
            result,
            source: "Resultados verificados manualmente",
          }
        : undefined;
    })
    .filter(Boolean) as OfficialResultUpdate[];

  return {
    updates: [...apiUpdates, ...verifiedUpdates],
    fixturesFound: Number(payload.fixturesFound ?? 0),
    source: payload.source ?? "API-Football / API-Sports",
  };
}

export default function App() {
  const [data, setData] = useState<PoolData>(() => {
    const stored = localStorage.getItem("world-cup-pool-data");
    const version = localStorage.getItem("world-cup-pool-version");
    return sanitizeResults(stored && version === DATA_VERSION ? JSON.parse(stored) : initialData);
  });
  const [tab, setTab] = useState<Tab>("dashboard");
  const [selectedParticipant, setSelectedParticipant] = useState(data.participants[0]?.id ?? "");
  const [group, setGroup] = useState("Todos");
  const [search, setSearch] = useState("");
  const [isUpdatingResults, setIsUpdatingResults] = useState(false);
  const [updatingMatchId, setUpdatingMatchId] = useState("");
  const [resultUpdateMessage, setResultUpdateMessage] = useState("");
  const [manualSavedResults, setManualSavedResults] = useState<SavedResultMap>(() => readSavedResultMap());
  const savedResultIds = useMemo(() => Object.keys(manualSavedResults), [manualSavedResults]);
  const [apiFootballKey, setApiFootballKey] = useState(() => localStorage.getItem("api-football-key") ?? "");
  const [apiFootballLeagueId, setApiFootballLeagueId] = useState(() => localStorage.getItem("api-football-league-id") ?? "1");
  const [apiFootballSeason, setApiFootballSeason] = useState(() => localStorage.getItem("api-football-season") ?? "2026");

  const ranking = useMemo(
    () => buildRanking(data.participants, data.matches, data.predictions, data.longTermPicks, data.longTermOfficial),
    [data],
  );
  const groups = ["Todos", ...Array.from(new Set(data.matches.map((match) => match.group)))];
  const leader = ranking[0];
  const completed = data.matches.filter((match) => match.result).length;
  const upcomingPredictionMatches = data.matches.filter((match) => !match.result);
  const avgHitRate = ranking.length ? Math.round(ranking.reduce((sum, row) => sum + row.hitRate, 0) / ranking.length) : 0;
  const selected = data.participants.find((participant) => participant.id === selectedParticipant) ?? data.participants[0];
  const recentMatches = data.matches.filter((match) => match.result).slice(-4);
  const totalExactScores = ranking.reduce((sum, row) => sum + row.exactScores, 0);
  const totalHits = ranking.reduce((sum, row) => sum + row.exactScores + row.winnerHits, 0);
  const totalPoints = ranking.reduce((sum, row) => sum + row.totalPoints, 0);
  const pageBackgroundImage = tabBackgroundImages[tab] ?? stadiumImage;
  const pageBackgroundPosition = tabBackgroundPositions[tab] ?? "center";

  function persist(next: PoolData) {
    const sanitized = sanitizeResults(next, manualSavedResults);
    setData(sanitized);
    localStorage.setItem("world-cup-pool-data", JSON.stringify(sanitized));
    localStorage.setItem("world-cup-pool-version", DATA_VERSION);
  }

  const evolution = useMemo(() => {
    return data.matches
      .filter((match) => match.result)
      .map((match, index) => {
        const rows: Record<string, string | number> = { rodada: `J${index + 1}` };
        data.participants.forEach((participant) => {
          rows[participant.name] = data.predictions
            .filter((prediction) => prediction.participantId === participant.id)
            .filter((prediction) => {
              const predictionMatch = data.matches.find((item) => item.id === prediction.matchId);
              return predictionMatch && predictionMatch.round <= match.round;
            })
            .reduce((sum, prediction) => {
              const predictionMatch = data.matches.find((item) => item.id === prediction.matchId);
              return predictionMatch ? sum + scorePrediction(prediction, predictionMatch).points : sum;
            }, 0);
        });
        return rows;
      });
  }, [data]);

  const accuracyBars = ranking.map((row) => ({
    name: row.participant.name,
    "Placares exatos": row.exactScores,
    Acertos: row.winnerHits,
    Erros: row.errors,
  }));

  const exactLeader = ranking.slice().sort((a, b) => b.exactScores - a.exactScores)[0];
  const streakLeader = ranking.slice().sort((a, b) => b.streak - a.streak)[0];
  const errorLeader = ranking.slice().sort((a, b) => b.errors - a.errors)[0];
  const fallingLeader = ranking
    .map((row) => ({ row, fall: row.position - row.previousPosition }))
    .filter((item) => item.fall > 0)
    .sort((a, b) => b.fall - a.fall)[0];
  const improvingLeader = ranking
    .map((row) => ({ row, rise: row.previousPosition - row.position }))
    .filter((item) => item.rise > 0)
    .sort((a, b) => b.rise - a.rise || b.row.hitRate - a.row.hitRate)[0];
  const leaderGap = ranking.length > 1 ? ranking[0].totalPoints - ranking[1].totalPoints : 0;

  const medalRows: MedalRow[] = [
    {
      label: "Líder",
      value: leader?.participant.name ?? "-",
      note: `${leader?.totalPoints ?? 0} pontos no topo`,
      icon: Trophy,
      tone: "text-amber-300 bg-amber-300/15",
    },
    {
      label: "Mais placares exatos",
      value: exactLeader?.participant.name ?? "-",
      note: `${exactLeader?.exactScores ?? 0} placares cravados`,
      icon: ShieldCheck,
      tone: "text-emerald-300 bg-emerald-300/15",
    },
    {
      label: "Maior sequência",
      value: streakLeader?.participant.name ?? "-",
      note: `${streakLeader?.streak ?? 0} jogos pontuando em sequência`,
      icon: Activity,
      tone: "text-sky-300 bg-sky-300/15",
    },
    {
      label: "Rei dos erros",
      value: errorLeader?.participant.name ?? "-",
      note: `${errorLeader?.errors ?? 0} palpites sem pontuar`,
      icon: Sparkles,
      tone: "text-rose-300 bg-rose-300/15",
    },
    {
      label: "De mal a pior",
      value: fallingLeader?.row.participant.name ?? "-",
      note: fallingLeader ? `Caiu ${fallingLeader.fall} posição(ões)` : "Ninguém caiu de posição agora",
      icon: History,
      tone: "text-orange-300 bg-orange-300/15",
    },
    {
      label: "Evoluindo",
      value: improvingLeader?.row.participant.name ?? "-",
      note: improvingLeader ? `Subiu ${improvingLeader.rise} posição(ões)` : "Ninguém subiu de posição agora",
      icon: BarChart3,
      tone: "text-lime-300 bg-lime-300/15",
    },
    {
      label: "Ninguém segura",
      value: leaderGap > 10 ? leader?.participant.name ?? "-" : "-",
      note: leaderGap > 10 ? `${leaderGap} pontos de vantagem na liderança` : `Líder ainda abriu só ${leaderGap} ponto(s)`,
      icon: Medal,
      tone: "text-fuchsia-300 bg-fuchsia-300/15",
    },
  ];

  const participantScores = selected
    ? data.predictions
        .filter((prediction) => prediction.participantId === selected.id)
        .map((prediction) => {
          const match = data.matches.find((item) => item.id === prediction.matchId);
          return match ? scorePrediction(prediction, match) : undefined;
        })
        .filter(Boolean) as ScoredPrediction[]
    : [];
  const participantRank = selected ? ranking.find((row) => row.participant.id === selected.id) : undefined;
  const participantLongTerm = selected ? data.longTermPicks.find((pick) => pick.participantId === selected.id) : undefined;

  const filteredMatches = data.matches.filter((match) => group === "Todos" || match.group === group);

  function exportRankingExcel() {
    const rows = ranking.map((row) => ({
      Posicao: row.position,
      Participante: row.participant.name,
      Pontos: row.totalPoints,
      "Jogos acertados": row.exactScores + row.winnerHits,
      "Placar exato": row.exactScores,
      Aproveitamento: `${row.hitRate}%`,
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Ranking");
    XLSX.writeFile(book, "ranking-bolao-copa-2026.xlsx");
  }

  function exportRankingPdf(individual = false) {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(individual && selected ? `Relatório - ${selected.name}` : "Ranking Bolão Dus Mininu Copa 2026", 14, 18);
    const rows = individual
      ? participantScores.map((item) => [matchLabel(item.match), scoreText(item.prediction.score), scoreText(item.match.result), item.points, item.status])
      : ranking.map((row) => [row.position, row.participant.name, row.totalPoints, row.exactScores + row.winnerHits, `${row.hitRate}%`]);
    autoTable(doc, {
      startY: 28,
      head: individual ? [["Jogo", "Palpite", "Resultado", "Pontos", "Status"]] : [["Posição", "Participante", "Pontos", "Acertos", "Aproveitamento"]],
      body: rows,
    });
    doc.save(individual && selected ? `relatorio-${selected.id}.pdf` : "ranking-bolao-copa-2026.pdf");
  }

  function exportStatsExcel() {
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(ranking), "Ranking");
    XLSX.utils.book_append_sheet(
      book,
      XLSX.utils.json_to_sheet(
        data.matches.map((match) => ({
          Grupo: match.group,
          Partida: matchLabel(match),
          Resultado: scoreText(match.result),
          Palpites: data.predictions.filter((prediction) => prediction.matchId === match.id).length,
        })),
      ),
      "Jogos",
    );
    XLSX.writeFile(book, "estatisticas-bolao-copa-2026.xlsx");
  }

  function updateOfficial(matchId: string, field: "home" | "away", value: string) {
    if (savedResultIds.includes(matchId)) return;

    const updater = (matches: Match[]) =>
      matches.map((match) =>
        match.id === matchId
          ? {
              ...match,
              result: {
                home: field === "home" ? Number(value) : match.result?.home ?? 0,
                away: field === "away" ? Number(value) : match.result?.away ?? 0,
              },
            }
          : match,
      );
    persist({ ...data, matches: updater(data.matches) });
  }

  function saveOfficialResult(match: Match) {
    if (!match.result || Number.isNaN(match.result.home) || Number.isNaN(match.result.away)) {
      setResultUpdateMessage(`Informe o placar de ${matchLabel(match)} antes de salvar.`);
      return;
    }

    if (savedResultIds.includes(match.id)) {
      setResultUpdateMessage(`${matchLabel(match)} já está salvo e travado.`);
      return;
    }

    const nextManualResults = { ...manualSavedResults, [match.id]: match.result };
    const nextData = {
      ...data,
      matches: data.matches.map((item) => (item.id === match.id ? { ...item, result: match.result } : item)),
    };
    setManualSavedResults(nextManualResults);
    writeSavedResultMap(nextManualResults);
    setData(nextData);
    localStorage.setItem("world-cup-pool-data", JSON.stringify(nextData));
    localStorage.setItem("world-cup-pool-version", DATA_VERSION);
    setResultUpdateMessage(`${matchLabel(match)} salvo como ${scoreText(match.result)}. Esse placar ficou travado.`);
  }

  function predictionFor(matchId: string, participantId: string) {
    const prediction = data.predictions.find((item) => item.matchId === matchId && item.participantId === participantId);
    return prediction ? scoreText(prediction.score) : "-";
  }

  async function updateOfficialResults() {
    setIsUpdatingResults(true);
    setResultUpdateMessage("Buscando resultados oficiais...");

    try {
      const response = await fetchOfficialResults(
        data.matches,
        apiFootballKey.trim(),
        apiFootballLeagueId.trim() || "1",
        apiFootballSeason.trim() || "2026",
      );
      const updates = response.updates;
      const changedUpdates = updates.filter((update) => {
        if (savedResultIds.includes(update.matchId)) return false;
        const match = data.matches.find((item) => item.id === update.matchId);
        return !match?.result || match.result.home !== update.result.home || match.result.away !== update.result.away;
      });

      if (!changedUpdates.length) {
        const stillPending = data.matches.filter((match) => !match.result).slice(0, 4).map(matchLabel);
        const pendingText = stillPending.length ? ` Pendentes sem placar confirmado: ${stillPending.join(", ")}.` : "";
        setResultUpdateMessage(
          response.fixturesFound
            ? `${response.fixturesFound} resultado(s) conferido(s), mas nenhum placar novo para atualizar.${pendingText}`
            : `Não encontrei novos resultados confirmados agora.${pendingText}`,
        );
        return;
      }

      const nextMatches = data.matches.map((match) => {
        const update = changedUpdates.find((item) => item.matchId === match.id);
        return update ? { ...match, result: update.result } : match;
      });
      persist({ ...data, matches: nextMatches });
      setResultUpdateMessage(`${changedUpdates.length} resultado(s) atualizado(s) via ${response.source}. Ranking recalculado.`);
    } catch {
      setResultUpdateMessage("Não consegui buscar os resultados agora. Tente novamente em alguns minutos.");
    } finally {
      setIsUpdatingResults(false);
    }
  }

  async function updateSingleOfficialResult(match: Match) {
    setUpdatingMatchId(match.id);
    setResultUpdateMessage(`Buscando resultado de ${matchLabel(match)}...`);

    try {
      const verifiedResult = localVerifiedResults[matchKey(match)];
      if (verifiedResult) {
        const alreadyCurrent = match.result && match.result.home === verifiedResult.home && match.result.away === verifiedResult.away;
        if (alreadyCurrent) {
          setResultUpdateMessage(`${matchLabel(match)} já estava atualizado: ${scoreText(verifiedResult)}.`);
          return;
        }

        const nextMatches = data.matches.map((item) => (item.id === match.id ? { ...item, result: verifiedResult } : item));
        persist({ ...data, matches: nextMatches });
        setResultUpdateMessage(`${matchLabel(match)} atualizado para ${scoreText(verifiedResult)}. Ranking recalculado.`);
        return;
      }

      const response = await fetchOfficialResults(
        [match],
        apiFootballKey.trim(),
        apiFootballLeagueId.trim() || "1",
        apiFootballSeason.trim() || "2026",
      );
      const update = response.updates.find((item) => item.matchId === match.id);

      if (!update) {
        setResultUpdateMessage(`Ainda não encontrei placar confirmado para ${matchLabel(match)}.`);
        return;
      }

      const alreadyCurrent = match.result && match.result.home === update.result.home && match.result.away === update.result.away;
      if (alreadyCurrent) {
        setResultUpdateMessage(`${matchLabel(match)} já estava atualizado: ${scoreText(update.result)}.`);
        return;
      }

      const nextMatches = data.matches.map((item) => (item.id === match.id ? { ...item, result: update.result } : item));
      persist({ ...data, matches: nextMatches });
      setResultUpdateMessage(`${matchLabel(match)} atualizado para ${scoreText(update.result)}. Ranking recalculado.`);
    } catch {
      setResultUpdateMessage(`Ainda não tenho placar confirmado para ${matchLabel(match)}. Quando o resultado sair, eu cadastro e esse botão aplica.`);
    } finally {
      setUpdatingMatchId("");
    }
  }

  return (
    <main
      className="min-h-screen bg-[#020b13] bg-cover bg-fixed bg-center text-white lg:flex"
      style={{ backgroundImage: `linear-gradient(rgba(2,11,19,.86), rgba(2,11,19,.94)), url(${pageBackgroundImage})`, backgroundPosition: pageBackgroundPosition }}
    >
      <aside className="sidebar-shell hidden lg:flex">
        <div className="px-5 py-6">
          <img src={bolaoLogo} alt="Bolao Dus Mininu Copa 2026" className="mx-auto h-28 w-28 rounded-full object-cover shadow-[0_0_28px_rgba(251,191,36,.28)]" />
          <div className="mt-3 text-center">
            <p className="text-lg font-black uppercase leading-5">Bolao Dus Mininu</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300">Copa 2026</p>
          </div>
        </div>
        <nav className="mt-2 grid gap-1 px-3">
          <SideNav icon={BarChart3} active={tab === "dashboard"} onClick={() => setTab("dashboard")}>Home/Dashboard</SideNav>
          <SideNav icon={Trophy} active={tab === "ranking"} onClick={() => setTab("ranking")}>Ranking</SideNav>
          <SideNav icon={Activity} active={tab === "matches"} onClick={() => setTab("matches")}>Jogos</SideNav>
          <SideNav icon={FileSpreadsheet} active={tab === "predictions"} onClick={() => setTab("predictions")}>Palpites</SideNav>
          <SideNav icon={Users} active={tab === "participant"} onClick={() => setTab("participant")}>Participantes</SideNav>
          <SideNav icon={Medal} active={tab === "medals"} onClick={() => setTab("medals")}>Medalhas</SideNav>
          <SideNav icon={Sparkles} active={tab === "longTerm"} onClick={() => setTab("longTerm")}>Longo Prazo</SideNav>
          <SideNav icon={Images} active={tab === "moments"} onClick={() => setTab("moments")}>Momentos da Copa</SideNav>
        </nav>
        <div className="mt-auto p-5 text-center">
          <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-200">Viva a Copa</p>
            <p className="mt-1 text-lg font-black text-amber-300">Juntos!</p>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:pl-[230px]">
        <div className="sticky top-0 z-30 border-b border-white/10 bg-[#061423]/90 px-4 py-3 backdrop-blur lg:hidden">
          <nav className="flex gap-2 overflow-x-auto">
            <IconButton icon={BarChart3} active={tab === "dashboard"} onClick={() => setTab("dashboard")}>Home/Dashboard</IconButton>
            <IconButton icon={Trophy} active={tab === "ranking"} onClick={() => setTab("ranking")}>Ranking</IconButton>
            <IconButton icon={Medal} active={tab === "medals"} onClick={() => setTab("medals")}>Medalhas</IconButton>
            <IconButton icon={Sparkles} active={tab === "longTerm"} onClick={() => setTab("longTerm")}>Longo Prazo</IconButton>
            <IconButton icon={Images} active={tab === "moments"} onClick={() => setTab("moments")}>Momentos</IconButton>
            <IconButton icon={Users} active={tab === "participant"} onClick={() => setTab("participant")}>Participantes</IconButton>
            <IconButton icon={Activity} active={tab === "matches"} onClick={() => setTab("matches")}>Jogos</IconButton>
            <IconButton icon={FileSpreadsheet} active={tab === "predictions"} onClick={() => setTab("predictions")}>Palpites</IconButton>
          </nav>
        </div>

        <div className="mx-auto max-w-[1720px] px-4 py-5 sm:px-6 lg:px-8">
        {tab === "dashboard" && (
          <div className="grid gap-5">
            <section
              className="hero-shell"
              style={{ backgroundImage: `linear-gradient(90deg, rgba(2,11,19,.95) 0%, rgba(2,11,19,.74) 42%, rgba(2,11,19,.2) 100%), url(${tabBackgroundImages.dashboard})`, backgroundPosition: tabBackgroundPositions.dashboard }}
            >
              <div className="relative z-10 flex min-h-[260px] flex-col justify-between gap-5 p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-300">Copa do Mundo 2026</p>
                    <p className="mt-2 text-xs font-black uppercase tracking-[0.22em] text-slate-300">Home / Dashboard</p>
                    <h1 className="mt-3 max-w-4xl text-4xl font-black uppercase leading-none sm:text-6xl">Bolão Dus Mininu Copa 2026</h1>
                    <p className="mt-4 max-w-xl text-base font-semibold text-slate-200">
                      Acompanhe palpites, resultados, classificação e estatísticas em tempo real.
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-4">
                    <img src={bolaoLogo} alt="Bolao Dus Mininu Copa 2026" className="hidden h-28 w-28 rounded-full object-cover shadow-[0_0_38px_rgba(251,191,36,.32)] sm:block" />
                    <div className="flex flex-wrap justify-end gap-2">
                      <button className="btn-gold" onClick={updateOfficialResults} disabled={isUpdatingResults}>
                        <RefreshCcw className={cx("h-4 w-4", isUpdatingResults && "animate-spin")} /> Atualizar resultados
                      </button>
                      <button className="btn-dark" onClick={() => exportRankingPdf(false)}>
                        <Download className="h-4 w-4" /> PDF
                      </button>
                    </div>
                  </div>
                </div>
                {resultUpdateMessage && (
                  <div className="max-w-3xl rounded-lg border border-amber-300/30 bg-black/35 px-4 py-3 text-sm font-bold text-amber-100 backdrop-blur">
                    {resultUpdateMessage}
                  </div>
                )}
              </div>
            </section>

            <Card className="overflow-hidden">
              <SectionTitle title="Elenco do bolão" />
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 xl:grid-cols-9">
                {ranking.map((row) => (
                  <button
                    key={row.participant.id}
                    className="avatar-card"
                    onClick={() => {
                      setSelectedParticipant(row.participant.id);
                      setTab("participant");
                    }}
                  >
                    <img src={participantAvatar(row.participant)} alt={row.participant.name} className="avatar-card-image" />
                    <span className="avatar-card-rank">#{row.position}</span>
                    <span className="mt-2 truncate text-sm font-black text-white">{row.participant.name}</span>
                    <span className="text-xs font-bold text-amber-300">{row.totalPoints} pts</span>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="overflow-hidden">
              <SectionTitle title="Momentos da Copa" action={<button className="btn-ghost" onClick={() => setTab("moments")}>Abrir galeria</button>} />
              <div className="grid gap-4 md:grid-cols-3">
                {fifaMomentCards.map((card) => (
                  <a
                    key={card.title}
                    href={card.href}
                    target="_blank"
                    rel="noreferrer"
                    className="fifa-moment-card"
                    style={{ backgroundImage: `linear-gradient(180deg, rgba(2,11,19,.08), rgba(2,11,19,.86)), url(${card.image})`, backgroundPosition: card.position }}
                  >
                    <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-black text-slate-950">FIFA</span>
                    <span className="mt-auto text-lg font-black text-white">{card.title}</span>
                    <span className="text-sm font-bold text-amber-300">{card.label}</span>
                  </a>
                ))}
              </div>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric title="Líder atual" value={leader?.participant.name ?? "-"} note={`${leader?.totalPoints ?? 0} pontos`} icon={Trophy} />
              <Metric title="Participantes" value={String(data.participants.length)} note="amigos no bolão" icon={Users} />
              <Metric title="Jogos computados" value={`${completed}/${data.matches.length}`} note="resultados oficiais" icon={ShieldCheck} />
              <Metric title="Média de acertos" value={`${avgHitRate}%`} note="aproveitamento geral" icon={Activity} />
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
              <Card className="xl:row-span-2">
                <SectionTitle title="Ranking geral" action={<button className="btn-ghost" onClick={exportStatsExcel}>Exportar estatísticas</button>} />
                <RankingTable rows={ranking} onSelect={(id) => { setSelectedParticipant(id); setTab("participant"); }} />
              </Card>
              <Card>
                <SectionTitle title="Medalhas da Copa" action={<button className="btn-ghost" onClick={() => setTab("medals")}>Ver todas</button>} />
                <div className="grid gap-3">
                  {medalRows.slice(0, 4).map((medal) => (
                    <div key={medal.label} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
                      <span className={cx("grid h-10 w-10 place-items-center rounded-full", medal.tone)}>
                        <medal.icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-xs font-black uppercase text-amber-300">{medal.label}</p>
                        <p className="mt-1 text-lg font-black text-white">{medal.value}</p>
                        <p className="text-xs font-bold text-slate-400">{medal.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <ChartCard title="Evolução da pontuação">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={evolution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.12)" />
                    <XAxis dataKey="rodada" hide />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ background: "#061423", border: "1px solid rgba(255,255,255,.16)", color: "#fff" }} />
                    <Legend iconType="circle" verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: 12 }} formatter={lineLegendFormatter} />
                    {data.participants.map((participant, index) => (
                      <Line key={participant.id} name={participant.name} dataKey={participant.name} stroke={participantLineColor(participant, index)} strokeWidth={3} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
              <ChartCard title="Acertos por participante">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={accuracyBars}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.12)" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ background: "#061423", border: "1px solid rgba(255,255,255,.16)", color: "#fff" }} />
                    <Bar dataKey="Placares exatos" stackId="a" fill="#16a34a" />
                    <Bar dataKey="Acertos" stackId="a" fill="#2563eb" />
                    <Bar dataKey="Erros" stackId="a" fill="#dc2626" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
              <Card>
                <SectionTitle title="Estatísticas gerais" />
                <div className="grid gap-3">
                  <StatTile label="Placares exatos" value={String(totalExactScores)} />
                  <StatTile label="Jogos acertados" value={String(totalHits)} />
                  <StatTile label="Pontos distribuídos" value={String(totalPoints)} />
                  <StatTile label="Média geral" value={`${avgHitRate}%`} />
                </div>
              </Card>
            </div>

            <Card className="stadium-card">
              <SectionTitle title="Jogos recentes" action={<button className="btn-ghost" onClick={() => setTab("matches")}>Ver todos os jogos</button>} />
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {recentMatches.map((match) => (
                  <div key={match.id} className="match-tile">
                    <p className="text-xs font-black uppercase text-amber-300">{match.group}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="font-black">{match.home.flag} {match.home.name}</span>
                      <span className="score-pill">{scoreText(match.result)}</span>
                      <span className="font-black text-right">{match.away.flag} {match.away.name}</span>
                    </div>
                    <p className="mt-3 text-xs font-bold uppercase text-slate-400">Resultado oficial</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === "ranking" && (
          <div className="grid gap-5">
            <section
              className="hero-shell"
              style={{ backgroundImage: `linear-gradient(90deg, rgba(2,11,19,.95) 0%, rgba(2,11,19,.78) 48%, rgba(2,11,19,.35) 100%), url(${tabBackgroundImages.ranking})`, backgroundPosition: tabBackgroundPositions.ranking }}
            >
              <div className="relative z-10 flex min-h-[210px] flex-col justify-between gap-5 p-6 sm:p-8">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-300">Classificação geral</p>
                  <h1 className="mt-3 text-4xl font-black uppercase leading-none sm:text-5xl">Ranking</h1>
                  <p className="mt-3 max-w-2xl text-sm font-semibold text-slate-200">
                    Pontuação geral, aproveitamento, placares exatos e variação de posição.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="btn-gold" onClick={() => exportRankingPdf(false)}>
                    <Download className="h-4 w-4" /> Ranking PDF
                  </button>
                  <button className="btn-dark" onClick={exportRankingExcel}>
                    <FileSpreadsheet className="h-4 w-4" /> Ranking Excel
                  </button>
                  <button className="btn-dark" onClick={exportStatsExcel}>
                    <BarChart3 className="h-4 w-4" /> Estatísticas
                  </button>
                </div>
              </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric title="Líder atual" value={leader?.participant.name ?? "-"} note={`${leader?.totalPoints ?? 0} pontos`} icon={Trophy} />
              <Metric title="Jogos computados" value={`${completed}/${data.matches.length}`} note="resultados oficiais" icon={ShieldCheck} />
              <Metric title="Média de acertos" value={`${avgHitRate}%`} note="aproveitamento geral" icon={Activity} />
              <Metric title="Pontos distribuídos" value={String(totalPoints)} note="total do bolão" icon={Medal} />
            </div>

            <Card>
              <SectionTitle title="Ranking completo" />
              <RankingTable rows={ranking} onSelect={(id) => { setSelectedParticipant(id); setTab("participant"); }} />
            </Card>

            <ChartCard title="Evolução da pontuação">
              <ResponsiveContainer width="100%" height={340}>
                <LineChart data={evolution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.12)" />
                  <XAxis dataKey="rodada" hide />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: "#061423", border: "1px solid rgba(255,255,255,.16)", color: "#fff" }} />
                  <Legend iconType="circle" verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: 12 }} formatter={lineLegendFormatter} />
                  {data.participants.map((participant, index) => (
                    <Line key={participant.id} name={participant.name} dataKey={participant.name} stroke={participantLineColor(participant, index)} strokeWidth={3} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {tab === "moments" && (
          <div className="grid gap-5">
            <section
              className="hero-shell"
              style={{ backgroundImage: `linear-gradient(90deg, rgba(2,11,19,.96) 0%, rgba(2,11,19,.68) 52%, rgba(2,11,19,.18) 100%), url(${worldCupGallery[1].image})`, backgroundPosition: worldCupGallery[1].position }}
            >
              <div className="relative z-10 min-h-[240px] p-6 sm:p-8">
                <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-300">Galeria visual</p>
                <h1 className="mt-3 text-4xl font-black uppercase leading-none sm:text-5xl">Momentos da Copa</h1>
                <p className="mt-3 max-w-2xl text-sm font-semibold text-slate-200">
                  Fotos marcantes para acompanhar a vibe do bolão. A galeria fica pronta para receber novas imagens.
                </p>
              </div>
            </section>

            <Card>
              <SectionTitle title="Galeria de visualizações" />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {worldCupGallery.map((item) => (
                  <figure key={item.image} className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] shadow-2xl">
                    <img src={item.image} alt={item.title} className="aspect-[4/3] w-full object-cover transition duration-300 hover:scale-105" style={{ objectPosition: item.position }} />
                    <figcaption className="border-t border-white/10 px-4 py-3 text-sm font-black text-white">{item.title}</figcaption>
                  </figure>
                ))}
              </div>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              {fifaMomentCards.map((card) => (
                <a
                  key={card.title}
                  href={card.href}
                  target="_blank"
                  rel="noreferrer"
                  className="fifa-moment-card"
                  style={{ backgroundImage: `linear-gradient(180deg, rgba(2,11,19,.08), rgba(2,11,19,.86)), url(${card.image})`, backgroundPosition: card.position }}
                >
                  <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-black text-slate-950">FIFA</span>
                  <span className="mt-auto text-lg font-black text-white">{card.title}</span>
                  <span className="text-sm font-bold text-amber-300">{card.label}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {tab === "medals" && (
          <div className="grid gap-5">
            <section
              className="hero-shell"
              style={{ backgroundImage: `linear-gradient(90deg, rgba(2,11,19,.96) 0%, rgba(2,11,19,.72) 50%, rgba(2,11,19,.25) 100%), url(${tabBackgroundImages.medals})`, backgroundPosition: tabBackgroundPositions.medals }}
            >
              <div className="relative z-10 min-h-[210px] p-6 sm:p-8">
                <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-300">Modalidades do bolão</p>
                <h1 className="mt-3 text-4xl font-black uppercase leading-none sm:text-5xl">Medalhas</h1>
                <p className="mt-3 max-w-2xl text-sm font-semibold text-slate-200">
                  Premiações automáticas conforme o ranking, sequência, erros, evolução e vantagem na liderança.
                </p>
              </div>
            </section>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {medalRows.map((medal) => (
                <Card key={medal.label} className="relative overflow-hidden">
                  <div className="flex items-start gap-4">
                    <span className={cx("grid h-14 w-14 shrink-0 place-items-center rounded-full", medal.tone)}>
                      <medal.icon className="h-7 w-7" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">{medal.label}</p>
                      <p className="mt-2 truncate text-2xl font-black text-white">{medal.value}</p>
                      <p className="mt-2 text-sm font-semibold text-slate-300">{medal.note}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tab === "longTerm" && (
          <div className="grid gap-5">
            <section
              className="hero-shell"
              style={{ backgroundImage: `linear-gradient(90deg, rgba(2,11,19,.96) 0%, rgba(2,11,19,.74) 48%, rgba(2,11,19,.25) 100%), url(${tabBackgroundImages.longTerm})`, backgroundPosition: tabBackgroundPositions.longTerm }}
            >
              <div className="relative z-10 min-h-[210px] p-6 sm:p-8">
                <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-300">Palpites especiais</p>
                <h1 className="mt-3 text-4xl font-black uppercase leading-none sm:text-5xl">Longo Prazo</h1>
                <p className="mt-3 max-w-2xl text-sm font-semibold text-slate-200">
                  Campeão, vice-campeão, artilheiro e campanha do Brasil para cada participante.
                </p>
              </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric title="Campeão" value={data.longTermOfficial.champion ?? "-"} note="resultado oficial" icon={Trophy} />
              <Metric title="Vice" value={data.longTermOfficial.runnerUp ?? "-"} note="resultado oficial" icon={Medal} />
              <Metric title="Artilheiro" value={data.longTermOfficial.topScorer ?? "-"} note="resultado oficial" icon={Sparkles} />
              <Metric title="Brasil" value={data.longTermOfficial.brazilPosition ?? "-"} note="posição oficial" icon={ShieldCheck} />
            </div>

            <Card>
              <SectionTitle title="Pontuação dos palpites" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatTile label="Campeão" value="30 pts" />
                <StatTile label="Vice-campeão" value="20 pts" />
                <StatTile label="Artilheiro" value="15 pts" />
                <StatTile label="Posição do Brasil" value="20 pts" />
              </div>
            </Card>

            <Card>
              <SectionTitle title="Palpites de longo prazo" />
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Participante</th>
                      <th>Campeão</th>
                      <th>Vice</th>
                      <th>Artilheiro</th>
                      <th>Posição do Brasil</th>
                      <th>Pontos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.longTermPicks.map((pick) => {
                      const participant = data.participants.find((item) => item.id === pick.participantId);
                      const row = ranking.find((item) => item.participant.id === pick.participantId);
                      return (
                        <tr key={pick.participantId} className="cursor-pointer" onClick={() => {
                          setSelectedParticipant(pick.participantId);
                          setTab("participant");
                        }}>
                          <td>
                            <span className="inline-flex items-center gap-2 font-bold">
                              {participant && <img src={participantAvatar(participant)} alt={participant.name} className="h-9 w-9 rounded-full border-2 border-amber-300 object-cover shadow-lg" />}
                              {participant?.name ?? pick.participantId}
                            </span>
                          </td>
                          <td>{pick.champion}</td>
                          <td>{pick.runnerUp}</td>
                          <td>{pick.topScorer}</td>
                          <td>{pick.brazilPosition}</td>
                          <td className="font-black text-amber-300">{row?.longTermPoints ?? 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.longTermPicks.map((pick) => {
                const participant = data.participants.find((item) => item.id === pick.participantId);
                return (
                  <Card key={pick.participantId}>
                    <div className="flex items-center gap-3">
                      {participant && <img src={participantAvatar(participant)} alt={participant.name} className="h-14 w-14 rounded-full border-2 border-amber-300 object-cover" />}
                      <div>
                        <p className="text-xl font-black text-white">{participant?.name ?? pick.participantId}</p>
                        <p className="text-xs font-bold uppercase text-amber-300">Palpites finais</p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <LongPick label="Campeão" value={pick.champion} official={data.longTermOfficial.champion} />
                      <LongPick label="Vice" value={pick.runnerUp} official={data.longTermOfficial.runnerUp} />
                      <LongPick label="Artilheiro" value={pick.topScorer} official={data.longTermOfficial.topScorer} />
                      <LongPick label="Brasil" value={pick.brazilPosition} official={data.longTermOfficial.brazilPosition} />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {tab === "participant" && selected && (
          <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
            <Card>
              <SectionTitle title="Participante" />
              <div className="relative mb-4">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input className="input pl-9" placeholder="Buscar participante" value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
              <div className="grid gap-2">
                {data.participants
                  .filter((participant) => participant.name.toLowerCase().includes(search.toLowerCase()))
                  .map((participant) => (
                    <button
                      key={participant.id}
                      className={cx(
                        "flex items-center gap-3 rounded-lg p-3 text-left text-white transition hover:bg-white/10",
                        selectedParticipant === participant.id && "bg-amber-300/15 ring-1 ring-amber-300/40",
                      )}
                      onClick={() => setSelectedParticipant(participant.id)}
                    >
                      <img src={participantAvatar(participant)} alt={participant.name} className="h-11 w-11 rounded-full border-2 border-amber-300 object-cover" />
                      <span className="font-bold">{participant.name}</span>
                    </button>
                  ))}
              </div>
            </Card>

            <div className="grid gap-5">
              <div className="grid gap-4 sm:grid-cols-4">
                <Metric title="Pontuação" value={String(participantRank?.totalPoints ?? 0)} note="pontos atuais" icon={Trophy} />
                <Metric title="Posição" value={`#${participantRank?.position ?? "-"}`} note="ranking geral" icon={Medal} />
                <Metric title="Acertos" value={String((participantRank?.exactScores ?? 0) + (participantRank?.winnerHits ?? 0))} note="jogos pontuados" icon={ShieldCheck} />
                <Metric title="Exatos" value={String(participantRank?.exactScores ?? 0)} note="placares perfeitos" icon={Sparkles} />
              </div>
              <Card>
                <SectionTitle title="Palpites realizados" action={<button className="btn-ghost" onClick={() => exportRankingPdf(true)}>Relatório PDF</button>} />
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Jogo</th>
                        <th>Palpite</th>
                        <th>Resultado real</th>
                        <th>Pontos</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participantScores.map((item) => (
                        <tr key={item.match.id}>
                          <td>{item.match.group} · {matchLabel(item.match)}</td>
                          <td>{scoreText(item.prediction.score)}</td>
                          <td>{scoreText(item.match.result)}</td>
                          <td className="font-black">{item.points}</td>
                          <td><span className={cx("status", statusTone(item.status))}>{item.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              <Card>
                <SectionTitle title="Longo prazo" />
                <div className="grid gap-3 sm:grid-cols-4">
                  <LongPick label="Campeão" value={participantLongTerm?.champion} official={data.longTermOfficial.champion} />
                  <LongPick label="Vice" value={participantLongTerm?.runnerUp} official={data.longTermOfficial.runnerUp} />
                  <LongPick label="Artilheiro" value={participantLongTerm?.topScorer} official={data.longTermOfficial.topScorer} />
                  <LongPick label="Brasil" value={participantLongTerm?.brazilPosition} official={data.longTermOfficial.brazilPosition} />
                </div>
              </Card>
            </div>
          </div>
        )}

        {tab === "predictions" && (
          <div className="grid gap-5">
            <section
              className="hero-shell"
              style={{ backgroundImage: `linear-gradient(90deg, rgba(2,11,19,.96) 0%, rgba(2,11,19,.76) 50%, rgba(2,11,19,.24) 100%), url(${tabBackgroundImages.predictions})`, backgroundPosition: tabBackgroundPositions.predictions }}
            >
              <div className="relative z-10 min-h-[210px] p-6 sm:p-8">
                <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-300">Matriz do bolão</p>
                <h1 className="mt-3 text-4xl font-black uppercase leading-none sm:text-5xl">Palpites</h1>
                <p className="mt-3 max-w-2xl text-sm font-semibold text-slate-200">
                  Veja o que cada participante marcou para os próximos jogos ainda pendentes.
                </p>
              </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-3">
              <Metric title="Jogos pendentes" value={String(upcomingPredictionMatches.length)} note="sem resultado oficial" icon={Activity} />
              <Metric title="Participantes" value={String(data.participants.length)} note="colunas de palpites" icon={Users} />
              <Metric
                title="Palpites exibidos"
                value={String(upcomingPredictionMatches.reduce((sum, match) => sum + data.predictions.filter((prediction) => prediction.matchId === match.id).length, 0))}
                note="nos próximos jogos"
                icon={FileSpreadsheet}
              />
            </div>

            <Card>
              <SectionTitle title="Próximos jogos" />
              {upcomingPredictionMatches.length ? (
                <div className="overflow-x-auto">
                  <table className="data-table min-w-[980px]">
                    <thead>
                      <tr>
                        <th>Jogo</th>
                        {data.participants.map((participant) => (
                          <th key={participant.id}>{participant.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingPredictionMatches.map((match) => (
                        <tr key={match.id}>
                          <td className="sticky left-0 z-10 min-w-[260px] bg-[#061423] font-black text-white">
                            <span className="block text-xs font-black uppercase text-amber-300">{match.group}</span>
                            {match.home.name} x {match.away.name}
                          </td>
                          {data.participants.map((participant) => (
                            <td key={participant.id} className="text-center font-black">
                              {predictionFor(match.id, participant.id)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6 text-sm font-bold text-slate-200">
                  Não há jogos pendentes no momento.
                </div>
              )}
            </Card>
          </div>
        )}

        {tab === "matches" && (
          <div className="grid gap-5">
          <Card>
            <SectionTitle
              title="Jogos escolhidos por grupo"
              action={
                <button className="btn-gold" onClick={updateOfficialResults} disabled={isUpdatingResults}>
                  <RefreshCcw className={cx("h-4 w-4", isUpdatingResults && "animate-spin")} /> Atualizar resultados
                </button>
              }
            />
            {resultUpdateMessage && (
              <div className="mb-4 rounded-lg border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-bold text-amber-100">
                {resultUpdateMessage}
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Grupo</th>
                    <th>Partida</th>
                    <th>Resultado oficial</th>
                    <th>Ações</th>
                    <th>Palpites</th>
                    <th>Maior acerto</th>
                    <th>% acertaram</th>
                  </tr>
                </thead>
                <tbody>
                  {data.matches.map((match) => {
                    const scored = data.predictions.filter((prediction) => prediction.matchId === match.id).map((prediction) => scorePrediction(prediction, match));
                    const hits = scored.filter((item) => item.points > 0).length;
                    const resultSaved = savedResultIds.includes(match.id);
                    return (
                      <tr key={match.id}>
                        <td>{match.group}</td>
                        <td className="font-bold">{match.home.flag} {match.home.name} x {match.away.flag} {match.away.name}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <input className="score-input" value={match.result?.home ?? ""} disabled={resultSaved} onChange={(event) => updateOfficial(match.id, "home", event.target.value)} />
                            <span>x</span>
                            <input className="score-input" value={match.result?.away ?? ""} disabled={resultSaved} onChange={(event) => updateOfficial(match.id, "away", event.target.value)} />
                          </div>
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-2">
                            <a className="btn-dark whitespace-nowrap" href={googleResultSearchUrl(match)} target="_blank" rel="noreferrer">
                              <Search className="h-4 w-4" /> Pesquisar
                            </a>
                            <button className={cx("whitespace-nowrap", resultSaved ? "btn-gold" : "btn-ghost")} onClick={() => saveOfficialResult(match)} disabled={resultSaved}>
                              <ShieldCheck className="h-4 w-4" /> {resultSaved ? "Salvo" : "Salvar"}
                            </button>
                          </div>
                        </td>
                        <td>{scored.length}</td>
                        <td>{Math.max(0, ...scored.map((item) => item.points))} pts</td>
                        <td>{scored.length ? Math.round((hits / scored.length) * 100) : 0}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          </div>
        )}

        {tab === "import" && (
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <Card>
              <SectionTitle title="Importação Excel" />
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-amber-300/60 bg-white/[0.04] p-8 text-center text-white transition hover:bg-white/[0.07]">
                <Upload className="h-10 w-10 text-amber-300" />
                <span className="mt-3 text-lg font-black">Selecionar arquivo .xlsx</span>
                <span className="mt-1 text-sm text-slate-300">Aceita a matriz de jogos/palpites do seu print e a aba de longo prazo</span>
                <input
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) importWorkbook(file, persist);
                  }}
                />
              </label>
              <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-white">
                <p className="text-sm font-black">API-Football / API-Sports</p>
                <p className="mt-1 text-sm text-slate-300">
                  Opcional. Sem chave, o botão Atualizar resultados usa busca pública na web.
                </p>
                <input
                  className="input mt-3"
                  type="password"
                  placeholder="Cole sua chave x-apisports-key"
                  value={apiFootballKey}
                  onChange={(event) => {
                    setApiFootballKey(event.target.value);
                    localStorage.setItem("api-football-key", event.target.value);
                  }}
                />
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="text-sm font-bold text-slate-200">
                    League ID
                    <input
                      className="input mt-1"
                      value={apiFootballLeagueId}
                      onChange={(event) => {
                        setApiFootballLeagueId(event.target.value);
                        localStorage.setItem("api-football-league-id", event.target.value);
                      }}
                    />
                  </label>
                  <label className="text-sm font-bold text-slate-200">
                    Season
                    <input
                      className="input mt-1"
                      value={apiFootballSeason}
                      onChange={(event) => {
                        setApiFootballSeason(event.target.value);
                        localStorage.setItem("api-football-season", event.target.value);
                      }}
                    />
                  </label>
                </div>
              </div>
              <button className="btn-danger mt-4" onClick={() => persist(initialData)}>Restaurar dados de demonstração</button>
            </Card>
            <Card>
              <SectionTitle title="Formato esperado" />
              <div className="grid gap-3 text-sm text-slate-200">
                <FormatLine title="Aba de jogos e palpites" text="Grupo, Jogo, Resultado Real, Willie, Rhômulo, JP, Heitor, Zanuto, Estevão, Rhenan, Roger, Amim..." />
                <FormatLine title="Aba de longo prazo" text="Participante, Campeão, Vice-Campeão, Artilheiro, Posição do Brasil" />
                <FormatLine title="Compatibilidade" text="Também continua aceitando o formato antigo com abas Jogos, Palpites e Longo Prazo." />
              </div>
            </Card>
          </div>
        )}
      </div>
      </div>
    </main>
  );
}

function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-lg font-black">{title}</h2>
      {action}
    </div>
  );
}

function Metric({ title, value, note, icon: Icon }: { title: string; value: string; note: string; icon: React.ElementType }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-amber-100" />
      <Icon className="relative h-5 w-5 text-emerald-700" />
      <p className="relative mt-4 text-sm font-semibold text-slate-500">{title}</p>
      <p className="relative mt-1 truncate text-2xl font-black">{value}</p>
      <p className="relative mt-1 text-xs text-slate-500">{note}</p>
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <SectionTitle title={title} />
      {children}
    </Card>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-amber-300">{value}</p>
    </div>
  );
}

function RankingTable({ rows, compact, onSelect }: { rows: ReturnType<typeof buildRanking>; compact?: boolean; onSelect: (id: string) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Posição</th>
            <th>Participante</th>
            <th>Pontos</th>
            {!compact && <th>Jogos acertados</th>}
            {!compact && <th>Placar exato</th>}
            {!compact && <th>Aproveitamento</th>}
            <th>Variação</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.participant.id} className="cursor-pointer" onClick={() => onSelect(row.participant.id)}>
              <td className="font-black">#{row.position}</td>
              <td>
                <span className="inline-flex items-center gap-2 font-bold">
                  <img src={participantAvatar(row.participant)} alt={row.participant.name} className="h-9 w-9 rounded-full border-2 border-amber-300 object-cover shadow-lg" />
                  {row.participant.name}
                </span>
              </td>
              <td className="font-black text-emerald-700">{row.totalPoints}</td>
              {!compact && <td>{row.exactScores + row.winnerHits}</td>}
              {!compact && <td>{row.exactScores}</td>}
              {!compact && <td>{row.hitRate}%</td>}
              <td>{row.previousPosition - row.position > 0 ? `+${row.previousPosition - row.position}` : row.previousPosition - row.position}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GroupStats({ matches, predictions }: { matches: Match[]; predictions: Prediction[] }) {
  return (
    <div className="grid gap-3">
      {matches.map((match) => {
        const scored = predictions.filter((prediction) => prediction.matchId === match.id).map((prediction) => scorePrediction(prediction, match));
        const hits = scored.filter((item) => item.points > 0).length;
        return (
          <div key={match.id} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-black">{match.group}</p>
              <span className="text-sm font-bold text-emerald-700">{scored.length ? Math.round((hits / scored.length) * 100) : 0}% acertaram</span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{matchLabel(match)} · {scoreText(match.result)}</p>
          </div>
        );
      })}
    </div>
  );
}

function LongPick({ label, value, official }: { label: string; value?: string; official?: string }) {
  const checked = official ? official === value : undefined;
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-white">
      <p className="text-xs font-bold uppercase text-amber-300">{label}</p>
      <p className="mt-2 font-black text-white">{value || "-"}</p>
      <p className={cx("mt-2 text-xs font-bold", checked === undefined ? "text-slate-300" : checked ? "text-emerald-300" : "text-rose-300")}>
        {checked === undefined ? "Aguardando oficial" : checked ? "Acertou" : "Não acertou"}
      </p>
    </div>
  );
}

function FormatLine({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-white">
      <p className="font-black text-amber-300">{title}</p>
      <p className="mt-1 text-slate-200">{text}</p>
    </div>
  );
}







