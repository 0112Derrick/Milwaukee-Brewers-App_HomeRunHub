// PlayoffBracket.tsx
import React, { useId, useMemo, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ScrollArea, ScrollBar } from "src/@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "src/@/components/ui/card";
import {
  PlayoffBracketProps,
  BracketTeam,
  PlayoffSeries,
} from "src/interfaces/playoff.series.types";
import { mlbTeamsDetails } from "src/data/teamData";
import { Link } from "react-router-dom";

const roundOrder: Array<PlayoffSeries["round"]> = ["WC", "LDS", "LCS", "WS"];
const roundTitle: Record<PlayoffSeries["round"], string> = {
  WC: "Wild Card",
  LDS: "Division Series",
  LCS: "League Championship",
  WS: "World Series",
};

const colVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 16 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 18 },
  },
  exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.12 } },
};

// —————————————————————————————————————
// Helpers
// —————————————————————————————————————
const prettyPlaceholder = (name: string) =>
  name
    .replace(/\bAL\b/g, "American League")
    .replace(/\bNL\b/g, "National League")
    .replace(/Winner\s+ALWC\s*(\d)/gi, "Winner American League Wild Card $1")
    .replace(/Winner\s+NLWC\s*(\d)/gi, "Winner National League Wild Card $1")
    .replace(/\bHigher WPCT\b/gi, "American League Higher Seed")
    .replace(/\bLower WPCT\b/gi, "National League Higher Seed")
    .replace(/\bHigher Seed\b/gi, "Higher Seed")
    .replace(/\bLower Seed\b/gi, "Lower Seed");

const determineSeriesScore = (series: PlayoffSeries) => {
  type TeamScore = {
    id: number | undefined;
    wins: number;
    losses: number;
    draws: number;
  };

  const team1: TeamScore = { id: series.home.id, wins: 0, losses: 0, draws: 0 }; // fixed team on card left
  const team2: TeamScore = { id: series.away.id, wins: 0, losses: 0, draws: 0 }; // fixed team on card right

  const scores: Array<{
    gameDate: string;
    gamePk: number;
    team1: { id?: number; abbr?: string; name: string; score: number | null };
    team2: { id?: number; abbr?: string; name: string; score: number | null };
  }> = [];

  // only count completed games that actually have a score
  const finished = series.games.filter(
    (g) =>
      g.state?.toLowerCase() === "final" &&
      (g.homeScore != null || g.awayScore != null)
  );

  finished.forEach((g) => {
    const home = g.homeScore ?? 0;
    const away = g.awayScore ?? 0;

    let winnerId: number | undefined;
    let loserId: number | undefined;

    if (home > away) {
      // HOME wins
      winnerId = g.homeId;
      loserId = g.awayId;
    } else if (away > home) {
      // AWAY wins
      winnerId = g.awayId;
      loserId = g.homeId;
    } else {
      // tie/draw
      team1.draws += 1;
      team2.draws += 1;
    }

    if (winnerId !== undefined) {
      if (winnerId === team1.id) {
        team1.wins += 1;
        team2.losses += 1;
      } else if (winnerId === team2.id) {
        team2.wins += 1;
        team1.losses += 1;
      }
    }

    // Record the line as team1 vs team2 (constant order), not home/away
    const team1Score =
      g.homeId === team1.id ? g.homeScore ?? null : g.awayScore ?? null;
    const team2Score =
      g.homeId === team2.id ? g.homeScore ?? null : g.awayScore ?? null;

    scores.push({
      gameDate: g.date,
      gamePk: g.gamePk,
      team1: {
        id: series.home.id,
        abbr: series.home.abbreviation,
        name: series.home.name,
        score: team1Score,
      },
      team2: {
        id: series.away.id,
        abbr: series.away.abbreviation,
        name: series.away.name,
        score: team2Score,
      },
    });
  });

  return { team1, team2, scores };
};

// derive accent from team or friendly fallback
function getAccent(team?: BracketTeam): string {
  const teamDetail = mlbTeamsDetails.find((_team) =>
    _team.team.includes(team?.name ?? "")
  );
  const c = teamDetail?.color;
  if (c) return c;
  // friendly defaults for placeholders
  const n = team?.name?.toLowerCase() || "";
  if (n.includes("american")) return "#1d4ed8"; // blue-ish
  if (n.includes("national")) return "#b45309"; // amber-ish
  return "#69d2ff"; // sky
}

function getTeamImageUrl(team?: BracketTeam): string {
  const teamDetail = mlbTeamsDetails.find((_team) =>
    _team.team.includes(team?.name ?? "")
  );
  return teamDetail?.logo ?? team?.logoUrl ?? "";
}

const statusLabel = (s: PlayoffSeries["status"]) =>
  s === "final" ? "Final" : s === "in_progress" ? "Live" : "Scheduled";

// subtle glowing line style between rounds
const columnGlow =
  "relative before:absolute before:right-[-18px] before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-sky-400/20 before:via-sky-400/60 before:to-sky-400/20";

export const PlayoffBracket: React.FC<PlayoffBracketProps> = ({ bracket }) => {
  const rootId = useId();
  const [expanded, setExpanded] = useState<string | null>(null);

  const byRound = useMemo(
    () =>
      roundOrder.map((r) => ({
        round: r,
        series: bracket.series.filter((s) => s.round === r),
      })),
    [bracket.series]
  );

  return (
    <div className="mt-2 w-full bg-secondary/90">
      <ScrollArea>
        <div
          id={rootId}
          className="
            grid gap-6 mt-4 p-4 px-6
            bg-inherit
            sm:grid-cols-2 lg:grid-cols-4 grid-cols-1
            max-w-[900px]
            min-w-full
          "
        >
          <AnimatePresence initial={false}>
            {byRound.map(({ round, series }, colIdx) => (
              <motion.div
                key={round}
                variants={colVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
                className={`flex flex-col gap-4 ${
                  colIdx < byRound.length - 1 ? columnGlow : ""
                }`}
              >
                <h2 className="text-2xl font-semibold tracking-tight text-center">
                  {roundTitle[round]}
                </h2>

                <AnimatePresence initial={false}>
                  {series.map((s) => (
                    <motion.div
                      key={s.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                    >
                      <MatchupCard
                        series={s}
                        expanded={expanded === s.id}
                        onToggle={() =>
                          setExpanded((x) => (x === s.id ? null : s.id))
                        }
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

// —————————————————————————————————————
// Matchup Card
// —————————————————————————————————————
const MatchupCard: React.FC<{
  series: PlayoffSeries;
  expanded: boolean;
  onToggle: () => void;
}> = ({ series, expanded, onToggle }) => {
  const accentA = getAccent(series.home);
  const accentB = getAccent(series.away);
  const { team1, team2, scores } = determineSeriesScore(series);
  return (
    <Card
      className={`
        overflow-hidden cursor-pointer rounded-2xl border-slate-200/20
        bg-gradient-to-br from-primary-foreground/10 via-transparent to-secondary backdrop-blur
        shadow-[0_0_0_1px_rgba(56,189,248,0.15),0_12px_30px_-10px_rgba(56,189,248,0.2)]
        transition-transform
        hover:scale-[1.01]
      `}
      onClick={onToggle}
    >
      <CardHeader className="py-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="font-semibold">
            BO{series.bestOf} • {statusLabel(series.status)}
          </span>
          {series.startDate && (
            <span className="text-sm opacity-80 tabular-nums">
              {series.startDate}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-white/10">
          <TeamRow
            t={series.home}
            w={series.home.id == team1.id ? team1.wins : team2.wins}
            oppW={series.home.id == team1.id ? team2.wins : team1.wins}
            draws={team1.draws}
            accent={accentA}
          />
          <TeamRow
            t={series.away}
            w={series.home.id == team1.id ? team1.wins : team2.wins}
            oppW={series.home.id == team1.id ? team2.wins : team1.wins}
            draws={team1.draws}
            accent={accentB}
          />
        </div>

        {/* connector glow at bottom edge for a subtle futuristic vibe */}
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(90deg, ${accentA}33, ${accentA}66 40%, ${accentB}66 60%, ${accentB}33)`,
          }}
        />
      </CardContent>

      {/* Expandable details */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "tween", duration: 0.22 }}
            className="px-3 py-3"
          >
            <div className="rounded-xl border border-white/10 bg-background/50 p-3 text-sm leading-6">
              <p className="opacity-80">
                Series details, recent box scores, and highlights appear here.
              </p>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                <li className="opacity-90">• Best of {series.bestOf}</li>

                {series.startDate && (
                  <li className="opacity-90">• Starts: {series.startDate}</li>
                )}
                <li className="opacity-90">
                  • Status: {statusLabel(series.status)}
                </li>
                {series.status !== "scheduled" && (
                  <li className="flex flex-col items-start justify-start">
                    • Scores:
                    {scores.map((game) => {
                      return (
                        <Link
                          to={`/scores/${game.gameDate}/${game.gamePk}`}
                          className="text-primary-foreground hover:text-tertiary"
                        >
                          <div className="flex flex-col">
                            <div className="flex flex-row flex-wrap gap-1">
                              <span>
                                {game.team1.abbr} {game.team1.score}
                              </span>
                              -
                              <span>
                                {game.team2.score} {game.team2.abbr}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </li>
                )}
                {/* Add highlight clips */}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

// —————————————————————————————————————
// Team Row
// —————————————————————————————————————
const TeamRow: React.FC<{
  t: BracketTeam;
  w: number;
  oppW: number;
  draws: number;
  accent: string;
}> = ({ t, w, oppW, accent, draws }) => {
  const label = t?.name ? prettyPlaceholder(t.name) : "";
  const href = t?.id ? `/teams/${t.id}` : undefined;
  const showScore = oppW > 0 || draws > 0 || w > 0;

  return (
    <div
      className={`
        group flex items-center justify-between px-3 py-2
        transition-transform
        hover:scale-[1.01] active:scale-[0.995]
        outline-none
        relative
        after:pointer-events-none after:absolute after:inset-0
        after:rounded-md
        after:opacity-0 group-hover:after:opacity-100
      `}
      style={{
        // glowing underglow ring on hover
        boxShadow: "inset 0 0 0 0 rgba(0,0,0,0)",
      }}
    >
      <div className="flex items-center gap-2">
        <Link
          to={href ?? "#"}
          style={{ "--teamColor": accent } as React.CSSProperties}
          className="flex items-center gap-2 p-2 rounded hover:text-[var(--teamColor)] dark:hover:text-tertiary"
        >
          {getTeamImageUrl(t) ? (
            <img
              src={getTeamImageUrl(t)}
              alt={label}
              className="w-6 h-6 rounded-sm object-contain transition-transform group-hover:scale-105 dark:brightness-150 dark:contrast-110"
            />
          ) : (
            <div className="w-6 h-6 rounded-sm bg-slate-700/40" />
          )}
          <span className="font-medium">{label}</span>
        </Link>
        {t.record && <span className="text-xs opacity-70">{t.record}</span>}
        {t.seed != null && (
          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full border border-white/15 bg-white/5">
            Seed {t.seed}
          </span>
        )}
      </div>

      {/* right: score */}
      <div
        className={`tabular-nums font-semibold ${
          showScore ? "block" : "hidden"
        }`}
      >
        {draws > 0 ? `${w}–${draws}-${oppW}` : `${w}–${oppW}`}
      </div>
    </div>
  );
};
