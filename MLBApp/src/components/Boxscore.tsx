import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "src/@/components/ui/table";

type InningRow = { inning: number; away?: number; home?: number };

export function Boxscore({ gamePk }: { gamePk: number }) {
  const [inningsData, setInningsData] = useState<InningRow[]>([]);
  const [totalsData, setTotalsData] = useState<{
    away: { R: number; H: number; E: number; abbr?: string };
    home: { R: number; H: number; E: number; abbr?: string };
  }>({
    away: { R: 0, H: 0, E: 0, abbr: "AWY" },
    home: { R: 0, H: 0, E: 0, abbr: "HOM" },
  });

  useEffect(() => {
    const cancel = axios.CancelToken.source();

    async function fetchBoxscore() {
      try {
        const defaultAddress = "http://localhost:8080/";
        const endpoint = `${defaultAddress}mlb/linescore`;

        const { data, status } = await axios.post(
          endpoint,
          { gamePk },
          { cancelToken: cancel.token }
        );
        if (status !== 200) return;

        // Pull what we need from StatsAPI live feed
        const ls = data?.liveData?.linescore;

        // IMPORTANT: keep undefined instead of defaulting to 0
        // so we can render "-" for unplayed halves.
        const innings: InningRow[] = (ls?.innings ?? []).map(
          (inn: any, i: number) => ({
            inning: inn?.num ?? i + 1,
            away: inn?.away?.runs, // may be undefined if not yet played
            home: inn?.home?.runs, // may be undefined if not yet played
          })
        );

        const totals = {
          away: {
            R: ls?.teams?.away?.runs ?? 0,
            H: ls?.teams?.away?.hits ?? 0,
            E: ls?.teams?.away?.errors ?? 0,
            abbr: ls?.teams?.away?.team?.abbreviation ?? "AWY",
          },
          home: {
            R: ls?.teams?.home?.runs ?? 0,
            H: ls?.teams?.home?.hits ?? 0,
            E: ls?.teams?.home?.errors ?? 0,
            abbr: ls?.teams?.home?.team?.abbreviation ?? "HOM",
          },
        };

        setInningsData(innings);
        setTotalsData(totals);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("Error fetching linescore:", err);
        }
      }
      // no finally: we don’t show a loader here
    }

    fetchBoxscore();
    return () => cancel.cancel("linescore request canceled");
  }, [gamePk]);

  const displayedInnings = useMemo(() => {
    const maxInningsFromData = inningsData.reduce(
      (m, r) => Math.max(m, r.inning || 0),
      0
    );
    return Math.max(9, maxInningsFromData || 0);
  }, [inningsData]);

  // Helper to render a cell: number or '-'
  const val = (n: number | undefined) => (typeof n === "number" ? n : "−");

  // Special case: show 'X' in the bottom of the final inning
  // when the home team didn’t bat because they were already leading.
  const homeCell = (innIdx: number) => {
    const row = inningsData.find((r) => r.inning === innIdx);
    if (row?.home === undefined) {
      const isNinthOrLater = innIdx >= 9;
      const homeLed = totalsData.home.R > totalsData.away.R;
      // Only render X if away value exists for this inning (i.e., top was played)
      const topPlayed = typeof row?.away === "number";
      if (isNinthOrLater && homeLed && topPlayed) return "X";
    }
    return val(row?.home);
  };

  const awayCell = (innIdx: number) => {
    const row = inningsData.find((r) => r.inning === innIdx);
    return val(row?.away);
  };

  return (
    <div className="w-full rounded-md border bg-background">
      {/* Sticky header area with team labels and R/H/E */}
      {/* <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium text-muted-foreground">
            Linescore
          </div>
        </div>
      </div> */}

      {/* Horizontal scroll for many innings */}
      <div className="overflow-x-auto">
        <Table className="min-w-max">
          <TableHeader>
            <TableRow className="bg-muted/90">
              <TableHead className="w-16 sticky left-0 bg-muted/30 z-10">
                Team
              </TableHead>
              {Array.from({ length: displayedInnings }, (_, i) => i + 1).map(
                (inn) => (
                  <TableHead
                    key={inn}
                    className="w-10 text-center tabular-nums"
                  >
                    {inn}
                  </TableHead>
                )
              )}
              <TableHead className="w-10 text-center">R</TableHead>
              <TableHead className="w-10 text-center">H</TableHead>
              <TableHead className="w-10 text-center">E</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Away row */}
            <TableRow>
              <TableCell className="sticky left-0 bg-background font-medium z-10">
                {totalsData.away.abbr}
              </TableCell>
              {Array.from({ length: displayedInnings }, (_, i) => i + 1).map(
                (inn) => (
                  <TableCell
                    key={inn}
                    className="text-center tabular-nums align-middle"
                  >
                    {awayCell(inn)}
                  </TableCell>
                )
              )}
              <TableCell className="text-center font-semibold tabular-nums">
                {totalsData.away.R}
              </TableCell>
              <TableCell className="text-center tabular-nums">
                {totalsData.away.H}
              </TableCell>
              <TableCell className="text-center tabular-nums">
                {totalsData.away.E}
              </TableCell>
            </TableRow>

            {/* Home row */}
            <TableRow>
              <TableCell className="sticky left-0 bg-background font-medium z-10">
                {totalsData.home.abbr}
              </TableCell>
              {Array.from({ length: displayedInnings }, (_, i) => i + 1).map(
                (inn) => (
                  <TableCell
                    key={inn}
                    className="text-center tabular-nums align-middle"
                  >
                    {homeCell(inn)}
                  </TableCell>
                )
              )}
              <TableCell className="text-center font-semibold tabular-nums">
                {totalsData.home.R}
              </TableCell>
              <TableCell className="text-center tabular-nums">
                {totalsData.home.H}
              </TableCell>
              <TableCell className="text-center tabular-nums">
                {totalsData.home.E}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
