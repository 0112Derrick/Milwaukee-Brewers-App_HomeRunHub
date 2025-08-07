import { TeamRecord, Player, SplitRowExtended } from "src/interfaces";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

export const columns: ColumnDef<TeamRecord>[] = [
  {
    accessorKey: "team.name",
    header: "Name",
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

const col = createColumnHelper<SplitRowExtended>();

export const splitColumns: ColumnDef<SplitRowExtended, any>[] = [
  col.accessor("season", { header: "Season" }),

  col.accessor("gameType", { header: "Game Type" }),

  // Now all the stat fields:
  col.accessor((row) => row.stat.gamesPlayed, {
    id: "gamesPlayed",
    header: "G",
  }),
  col.accessor((row) => row.stat.gamesStarted, {
    id: "gamesStarted",
    header: "GS",
  }),
  col.accessor((row) => row.stat.groundOuts, {
    id: "groundOuts",
    header: "GO",
  }),
  col.accessor((row) => row.stat.airOuts, { id: "airOuts", header: "AO" }),
  col.accessor((row) => row.stat.runs, { id: "runs", header: "R" }),
  col.accessor((row) => row.stat.doubles, { id: "doubles", header: "2B" }),
  col.accessor((row) => row.stat.triples, { id: "triples", header: "3B" }),
  col.accessor((row) => row.stat.homeRuns, { id: "homeRuns", header: "HR" }),
  col.accessor((row) => row.stat.strikeOuts, {
    id: "strikeOuts",
    header: "SO",
  }),
  col.accessor((row) => row.stat.baseOnBalls, {
    id: "baseOnBalls",
    header: "BB",
  }),
  col.accessor((row) => row.stat.intentionalWalks, {
    id: "intentionalWalks",
    header: "IBB",
  }),
  col.accessor((row) => row.stat.hits, { id: "hits", header: "H" }),
  col.accessor((row) => row.stat.hitByPitch, {
    id: "hitByPitch",
    header: "HBP",
  }),
  col.accessor((row) => row.stat.avg, { id: "avg", header: "AVG" }),
  col.accessor((row) => row.stat.atBats, { id: "atBats", header: "AB" }),
  col.accessor((row) => row.stat.obp, { id: "obp", header: "OBP" }),
  col.accessor((row) => row.stat.slg, { id: "slg", header: "SLG" }),
  col.accessor((row) => row.stat.ops, { id: "ops", header: "OPS" }),
  col.accessor((row) => row.stat.caughtStealing, {
    id: "caughtStealing",
    header: "CS",
  }),
  col.accessor((row) => row.stat.stolenBases, {
    id: "stolenBases",
    header: "SB",
  }),
  col.accessor((row) => row.stat.stolenBasePercentage, {
    id: "stolenBasePercentage",
    header: "SB%",
  }),
  col.accessor((row) => row.stat.groundIntoDoublePlay, {
    id: "groundIntoDoublePlay",
    header: "GIDP",
  }),
  col.accessor((row) => row.stat.numberOfPitches, {
    id: "numberOfPitches",
    header: "Pitches",
  }),
  col.accessor((row) => row.stat.era, { id: "era", header: "ERA" }),
  col.accessor((row) => row.stat.inningsPitched, {
    id: "inningsPitched",
    header: "IP",
  }),
  col.accessor((row) => row.stat.wins, { id: "wins", header: "W" }),
  col.accessor((row) => row.stat.losses, { id: "losses", header: "L" }),
  col.accessor((row) => row.stat.saves, { id: "saves", header: "SV" }),
  col.accessor((row) => row.stat.saveOpportunities, {
    id: "saveOpportunities",
    header: "SVO",
  }),
  col.accessor((row) => row.stat.holds, { id: "holds", header: "HLD" }),
  col.accessor((row) => row.stat.blownSaves, {
    id: "blownSaves",
    header: "BS",
  }),
  col.accessor((row) => row.stat.earnedRuns, {
    id: "earnedRuns",
    header: "ER",
  }),
  col.accessor((row) => row.stat.whip, { id: "whip", header: "WHIP" }),
  col.accessor((row) => row.stat.battersFaced, {
    id: "battersFaced",
    header: "BF",
  }),
  col.accessor((row) => row.stat.outs, { id: "outs", header: "Outs" }),
  col.accessor((row) => row.stat.gamesPitched, {
    id: "gamesPitched",
    header: "GP",
  }),
  col.accessor((row) => row.stat.completeGames, {
    id: "completeGames",
    header: "CG",
  }),
  col.accessor((row) => row.stat.shutouts, { id: "shutouts", header: "SHO" }),
  col.accessor((row) => row.stat.strikes, { id: "strikes", header: "Strikes" }),
  col.accessor((row) => row.stat.strikePercentage, {
    id: "strikePercentage",
    header: "K%",
  }),
  col.accessor((row) => row.stat.hitBatsmen, {
    id: "hitBatsmen",
    header: "HB",
  }),
  col.accessor((row) => row.stat.balks, { id: "balks", header: "Balks" }),
  col.accessor((row) => row.stat.wildPitches, {
    id: "wildPitches",
    header: "WP",
  }),
  col.accessor((row) => row.stat.pickoffs, { id: "pickoffs", header: "PO" }),
  col.accessor((row) => row.stat.totalBases, {
    id: "totalBases",
    header: "TB",
  }),
  col.accessor((row) => row.stat.groundOutsToAirouts, {
    id: "groundOutsToAirouts",
    header: "GO/AO",
  }),
  col.accessor((row) => row.stat.winPercentage, {
    id: "winPercentage",
    header: "W%",
  }),
  col.accessor((row) => row.stat.pitchesPerInning, {
    id: "pitchesPerInning",
    header: "P/Inn",
  }),
  col.accessor((row) => row.stat.gamesFinished, {
    id: "gamesFinished",
    header: "GF",
  }),
  col.accessor((row) => row.stat.strikeoutWalkRatio, {
    id: "strikeoutWalkRatio",
    header: "K/BB",
  }),
  col.accessor((row) => row.stat.strikeoutsPer9Inn, {
    id: "strikeoutsPer9Inn",
    header: "K/9",
  }),
  col.accessor((row) => row.stat.walksPer9Inn, {
    id: "walksPer9Inn",
    header: "BB/9",
  }),
  col.accessor((row) => row.stat.hitsPer9Inn, {
    id: "hitsPer9Inn",
    header: "H/9",
  }),
  col.accessor((row) => row.stat.runsScoredPer9, {
    id: "runsScoredPer9",
    header: "R/9",
  }),
  col.accessor((row) => row.stat.homeRunsPer9, {
    id: "homeRunsPer9",
    header: "HR/9",
  }),
  col.accessor((row) => row.stat.inheritedRunners, {
    id: "inheritedRunners",
    header: "IR",
  }),
  col.accessor((row) => row.stat.inheritedRunnersScored, {
    id: "inheritedRunnersScored",
    header: "IRS",
  }),
  col.accessor((row) => row.stat.catchersInterference, {
    id: "catchersInterference",
    header: "CI",
  }),
  col.accessor((row) => row.stat.sacBunts, { id: "sacBunts", header: "SB" }),
  col.accessor((row) => row.stat.sacFlies, { id: "sacFlies", header: "SF" }),
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
