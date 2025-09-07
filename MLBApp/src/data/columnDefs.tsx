import { MlbGame, Player, SplitRowExtended } from "src/interfaces/interfaces";
import {
  ColumnDef,
  createColumnHelper,
  SortingFn,
  sortingFns,
} from "@tanstack/react-table";
import { TeamPages, TeamRecord } from "src/interfaces/teams.types";
import { Link } from "react-router-dom";
import { DateRange } from "src/interfaces/generated.game-content.types";
import { ArrowUpDown, ArrowBigDownIcon, ArrowBigUpIcon } from "lucide-react";
import { Button } from "src/@/components/ui/button";
import { teamLogoUrl } from "src/utils/utils";
import { TeamLogoName } from "src/components/TeamLogoName";
import { Split } from "../interfaces/generated.player.types";

export const columns: ColumnDef<TeamRecord>[] = [
  {
    id: "name",
    header: "Team",
    cell({ row }) {
      const teamName = row.original.team.name;
      const id = row.original.team.id;
      const logo = teamLogoUrl(id);
      return (
        <TeamLogoName id={id} teamName={teamName} logo={logo}></TeamLogoName>
      );
    },
  },
  {
    accessorKey: "gamesPlayed",
    header: "Games Played",
  },
  {
    accessorKey: "leagueRecord.wins",
    header: "Wins",
  },
  {
    accessorKey: "leagueRecord.losses",
    header: "Losses",
  },
  {
    accessorKey: "leagueRecord.pct",
    header: "Win %",
  },
  {
    accessorKey: "divisionRank",
    header: "Division Rank",
  },
  {
    id: "rd",
    header: "Run Differential",
    cell({ row }) {
      const { runDifferential } = row.original;
      return (
        <div>
          {runDifferential >= 0 ? `+${runDifferential}` : runDifferential}
        </div>
      );
    },
  },
  {
    header: "Streak",
    accessorKey: "streak.streakCode",
  },
  {
    id: "clinched",
    accessorKey: "clinched",
    header: "Clinched",
    cell({ getValue }) {
      const isClinched = getValue<boolean>();
      return (
        <div className={isClinched ? "text-green-600" : "text-red-600"}>
          {isClinched ? "✔️" : "❌"}
        </div>
      );
    },
  },
];

export const gamesColumns: ColumnDef<MlbGame>[] = [
  {
    accessorKey: "season",
    header: "Season",
  },
  {
    accessorKey: "officialDate",
    header: ({ column }) => {
      const sorted = column.getIsSorted(); // false | 'asc' | 'desc'
      return (
        <Button
          variant="ghost"
          className="px-2"
          onClick={
            () => column.toggleSorting(sorted === "asc") // flip asc/desc
          }
        >
          Date
          <span className="ml-1 inline-flex">
            {sorted === "asc" ? (
              <ArrowBigUpIcon className="h-4 w-4" />
            ) : sorted === "desc" ? (
              <ArrowBigDownIcon className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4 opacity-60" />
            )}
          </span>
        </Button>
      );
    },

    sortingFn: (a, b, id) => {
      const av = a.getValue<string>(id);
      const bv = b.getValue<string>(id);
      return new Date(av).getTime() - new Date(bv).getTime();
    },
    filterFn: (row, id, value: DateRange) => {
      const v = String(row.getValue(id) ?? "");
      if (!value?.from && !value?.to) return true;
      if (value.from && v < value.from) return false;
      if (value.to && v > value.to) return false;
      return true;
    },
  },
  {
    id: "matchup",
    header: "Matchup",
    cell({ row }) {
      const { gamePk, officialDate, teams } = row.original;
      const awayName = teams.away.team.name;
      const homeName = teams.home.team.name;

      return (
        <Link
          to={`/games/${officialDate}/${gamePk}`}
          className="hover:text-blue-400 focus:text-blue-400 outline-none cursor-pointer"
          tabIndex={0}
        >
          {awayName} @ {homeName}
        </Link>
      );
    },
  },
  {
    accessorKey: "venue.name",
    header: "Venue",
  },
  {
    id: "score",
    header: "Score",
    cell({ row }) {
      const { teams } = row.original;
      const awayScore = teams.away.score ?? "-";
      const homeScore = teams.home.score ?? "-";

      return (
        <div>
          {awayScore} - {homeScore}
        </div>
      );
    },
  },
  {
    accessorKey: "seriesGameNumber",
    header: "Game # in series",
  },
];

export const rosterColumns: ColumnDef<Player>[] = [
  {
    id: "expander",
    header: ({ table }) => (
      <button
        {...{
          onClick: table.getToggleAllRowsExpandedHandler(),
        }}
      >
        {table.getIsAllRowsExpanded() ? "▼" : "▶"}
      </button>
    ),
    cell: ({ row }) =>
      row.getCanExpand() ? (
        <button
          {...{
            onClick: row.getToggleExpandedHandler(),
            style: { cursor: "pointer" },
          }}
        >
          {row.getIsExpanded() ? "▼" : "▶"}
        </button>
      ) : (
        "⚪"
      ),
  },
  {
    accessorKey: "person.fullName",
    header: "Name",
    cell: ({ row }) => {
      const playerId = row.original.person.id;
      return (
        <Link
          to={`/players/${playerId}`}
          className="cursor-pointer hover:text-blue-300"
        >
          <p>{row.original.person.fullName}</p>
        </Link>
      );
    },
  },
  {
    accessorKey: "person.birthDate",
    header: "Birth Date",
  },
  {
    accessorKey: "person.height",
    header: "Height",
  },
  {
    accessorKey: "person.weight",
    header: "Weight",
  },
  {
    accessorKey: "person.primaryPosition.name",
    header: "Position",
  },
  {
    id: "active",
    accessorKey: "person.active",
    header: "Active",
    cell({ getValue }) {
      const isActive = getValue<boolean>();
      return (
        <div className={isActive ? "text-green-600" : "text-red-600"}>
          {isActive ? "✔️" : "❌"}
        </div>
      );
    },
  },
];

type SplitLike = Split | SplitRowExtended; // your union

const col = createColumnHelper<SplitLike>();

// Nice labels for common stat keys; fallback is the raw key
const STAT_LABELS: Record<string, string> = {
  // hitting
  gamesPlayed: "G",
  gamesStarted: "GS",
  atBats: "AB",
  hits: "H",
  doubles: "2B",
  triples: "3B",
  homeRuns: "HR",
  rbi: "RBI",
  baseOnBalls: "BB",
  strikeOuts: "SO",
  avg: "AVG",
  obp: "OBP",
  slg: "SLG",
  ops: "OPS",
  stolenBases: "SB",
  caughtStealing: "CS",
  // pitching
  era: "ERA",
  inningsPitched: "IP",
  wins: "W",
  losses: "L",
  saves: "SV",
  saveOpportunities: "SVO",
  whip: "WHIP",
  battersFaced: "BF",
  hitsPer9Inn: "H/9",
  strikeoutsPer9Inn: "K/9",
  walksPer9Inn: "BB/9",
  homeRunsPer9: "HR/9",
  strikeoutWalkRatio: "K/BB",
  // fielding
  assists: "A",
  putOuts: "PO",
  errors: "E",
  chances: "Ch",
  doublePlays: "DP",
  triplePlays: "TP",
  fielding: "Fld%", // often a string like "0.987"
  throwingErrors: "TE",
  passedBall: "PB",
  // misc
  leftOnBase: "LOB",
  plateAppearances: "PA",
  // note: you already handle leftonbase/plateappearances casing elsewhere if needed
};

function humanizeKey(k: string) {
  return STAT_LABELS[k] ?? k;
}

/**
 * Build columns from the splits in a tab.
 * - Adds meta columns (Season, Team, Game Type, Group if present on the row)
 * - Inspects `stat` objects to find all keys that have at least one non-empty value
 */
export function buildSplitColumnsFromData(
  splits: SplitLike[]
): ColumnDef<SplitLike, any>[] {
  // --- META COLUMNS (stable) ---
  const base: ColumnDef<SplitLike, any>[] = [
    col.accessor((row) => (row as any).season ?? "", {
      id: "season",
      header: "Season",
      sortingFn: withTotalsLast((a, b, id) => {
        const av = Number(a.getValue(id) ?? 0);
        const bv = Number(b.getValue(id) ?? 0);
        return av - bv; // asc; Table's sort direction toggle still works
      }),
    }),
    col.accessor((row) => row.team?.name ?? "Total", {
      id: "team",
      header: "Team",
      sortingFn: withTotalsLast(sortingFns.alphanumeric),
      cell({ row }) {
        const current = row.original;
        if (current.team) {
          return (
            <Link
              to={`/teams/${current.team.id}/${
                current.season ?? new Date().getFullYear()
              }/${TeamPages.Roster}`}
              className="hover:text-blue-400 focus:text-blue-400 outline-none cursor-pointer"
              tabIndex={0}
            >
              <p>{current.team.name}</p>
            </Link>
          );
        } else {
          return <p>Total</p>;
        }
      },
    }),
    col.accessor((row) => (row as any).gameType ?? "", {
      id: "gameType",
      header: "Game Type",
    }),
    col.accessor((row) => row.position?.abbreviation ?? "—", {
      id: "pos",
      header: "Pos",
    }),
    // Only if your data actually carries group on the row (it usually lives on parent StatElement)
    col.accessor((row) => (row as any).group ?? "", {
      id: "group",
      header: "Group",
    }),
  ];

  // --- GATHER STAT KEYS PRESENT ---
  const keySet = new Set<string>();
  for (const s of splits) {
    const stat = (s as any)?.stat ?? {};
    Object.keys(stat).forEach((k) => keySet.add(k));
  }

  // Decide which keys are worth showing: keep keys that have a value
  const statCols: ColumnDef<SplitLike, any>[] = [];
  const keys = Array.from(keySet);
  for (const key of keys) {
    // Skip nested objects (e.g., position) and obvious non-stats if needed
    if (typeof (splits[0] as any)?.stat?.[key] === "object") continue;

    statCols.push(
      col.accessor((row) => (row as any)?.stat?.[key], {
        id: key,
        header: humanizeKey(key),
        // text align numerics
        cell: ({ getValue }) => {
          const v = getValue();
          if (v == null || v === "") return null;
          // Slight numeric alignment
          const isNum =
            typeof v === "number" || /^-?\d+(\.\d+)?$/.test(String(v));
          return (
            <div className={isNum ? "text-right tabular-nums" : ""}>{v}</div>
          );
        },
      })
    );
  }

  return [...base, ...statCols];
}

const isTotal = (s: Split | SplitRowExtended) => !s.team; // your rule

// Wrap any base sorting fn so totals are always last
const withTotalsLast =
  (
    base: SortingFn<Split | SplitRowExtended>
  ): SortingFn<Split | SplitRowExtended> =>
  (a, b, columnId) => {
    const aTotal = isTotal(a.original);
    const bTotal = isTotal(b.original);
    if (aTotal !== bTotal) return aTotal ? 1 : -1; // totals after non-totals
    return base(a, b, columnId);
  };

export const totalsLastColumn: ColumnDef<Split | SplitRowExtended> = {
  id: "__totalsLast",
  accessorFn: (row) => (isTotal(row) ? 1 : 0),
  enableSorting: true,
  sortingFn: "basic", // 0 before 1
  header: () => null, // never shown
  cell: () => null, // never shown
  meta: { hidden: true }, // (optional) if you use meta to hide
};
