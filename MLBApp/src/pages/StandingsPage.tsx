import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "src/@/components/ui/card";
import { Badge } from "src/@/components/ui/badge";
import { Spinner } from "src/components/Spinner";
import { ScrollArea, ScrollBar } from "src/@/components/ui/scroll-area";
import {
  getStandingsResp,
  getPlayoffBracketResp,
} from "src/repository/schedules";
import { StandingsResponseV2 } from "src/interfaces/teams.types";
import { DataTable } from "src/components/Table";
import { columns } from "src/data/columnDefs";
import { Label } from "src/@/components/ui/label";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "src/@/components/ui/tabs";
import { PlayoffBracket } from "src/components/PlayoffBrackets";
import { formatYYYYMMDD } from "src/utils/utils";
import LeagueAndDivisionFilterInputs from "src/components/TeamFilterRadioButtons";
import { BracketPayload } from "src/interfaces/playoff.series.types";

const today = new Date();

function seasonYear(today = new Date()) {
  // MLB season spans spring -> fall; Jan/Feb are the prior season.
  const m = today.getMonth(); // 0-based
  return m <= 1 ? today.getFullYear() - 1 : today.getFullYear();
}

function candidateStandingsDates(today = new Date()): string[] {
  const dates: string[] = [];
  // Try today, then the last 7 days
  for (let i = 0; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const strDt = formatYYYYMMDD(d);
    dates.push(strDt);
  }
  // Safe late-season anchors for the current season (avoid hard-coded "end dates")
  const sy = seasonYear(today);
  const anchors = [`${sy}-10-31`, `${sy}-10-15`, `${sy}-10-01`, `${sy}-09-30`];
  for (const a of anchors) dates.push(a);
  // Deduplicate while preserving order
  const uniqueDates = Array.from(new Set(dates));
  return uniqueDates;
}

// ---------- component ----------
const StandingsPage: React.FC = () => {
  // view state
  const [tab, setTab] = useState<"regular" | "playoffs">("regular");

  // regular standings state
  const [standings, setStandings] = useState<StandingsResponseV2 | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [league, setLeague] = useState<number>(105);
  const [division, setDivision] = useState<number>(0);

  // playoffs state
  const [season, setSeason] = useState<number>(seasonYear(today));
  const [bracket, setBracket] = useState<BracketPayload | null>(null);
  const [bracketLoading, setBracketLoading] = useState(false);
  const [bracketError, setBracketError] = useState<string | null>(null);

  // prevent stale writes if user flips season quickly
  const bracketReqIdRef = useRef(0);

  // AbortController should survive renders
  const acRef = useRef<AbortController | null>(null);
  useEffect(() => {
    return () => {
      if (acRef.current) acRef.current.abort();
    };
  }, []);

  // ---- regular standings fetch with resilient date fallback ----
  const reqIdRef = useRef(0);

  const fetchStandings = async () => {
    const myReq = ++reqIdRef.current; // mark this as the latest request
    setLoading(true);
    setError(null);

    // abort any in-flight request
    if (acRef.current) acRef.current.abort();
    acRef.current = new AbortController();

    const candidates = candidateStandingsDates(new Date());
    let found: StandingsResponseV2 | null = null;

    try {
      for (const date of candidates) {
        const resp = await getStandingsResp(
          acRef.current,
          date,
          league,
          division
        );
        if (myReq !== reqIdRef.current) return; // a newer request started; bail

        if (resp?.status === 200 && resp.data?.records?.length) {
          found = resp.data;
          break;
        }
      }

      // Only the latest request is allowed to set state
      if (myReq === reqIdRef.current) {
        setStandings(found); // either data or null
      }
    } catch (e: any) {
      if (myReq === reqIdRef.current)
        setError(e?.message || "Failed to load standings.");
    } finally {
      if (myReq === reqIdRef.current) setLoading(false);
    }
  };

  // ---- playoff bracket fetch (season-based) ----
  const fetchBracket = async () => {
    const myReq = ++bracketReqIdRef.current;
    setBracketLoading(true);
    setBracketError(null);
    setBracket(null);

    if (acRef.current) acRef.current.abort();
    acRef.current = new AbortController();

    try {
      const data = await getPlayoffBracketResp(acRef.current, season, league);

      if (myReq === bracketReqIdRef.current) {
        if (!data?.series?.length) {
          setBracket(null);
          setBracketError("No playoff data available for this season.");
        } else {
          setBracket(data);
        }
      }
    } catch (e: any) {
      if (myReq === bracketReqIdRef.current) {
        setBracket(null);
        setBracketError(e?.message || "Failed to load playoff bracket.");
      }
    } finally {
      if (myReq === bracketReqIdRef.current) setBracketLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "regular") {
      const t = setTimeout(fetchStandings, 300);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(fetchBracket, 300);
      return () => clearTimeout(t);
    }
  }, [tab, league, division, season]);

  if (tab === "regular" && loading) {
    return (
      <div className="flex flex-col flex-grow h-full w-full items-center justify-center p-4">
        <Spinner />
      </div>
    );
  }
  if (tab === "playoffs" && bracketLoading) {
    return (
      <div className="flex flex-col flex-grow h-full w-full items-center justify-center p-4">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="py-4 flex flex-col flex-grow max-w-[100vw] overflow-auto bg-inherit text-inherit">
      <ScrollArea>
        <h1 className="text-2xl ml-4 font-bold">MLB Standings</h1>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as any)}
          className="mt-4"
        >
          <TabsList className="mb-4 mx-4">
            <TabsTrigger value="regular">Regular</TabsTrigger>
            <TabsTrigger value="playoffs">Playoffs</TabsTrigger>
          </TabsList>

          {/* ---------- REGULAR STANDINGS ---------- */}
          <TabsContent value="regular" className="m-0">
            {error && (
              <div className="flex flex-col items-center justify-center flex-grow">
                <p className="text-red-500">{error}</p>
              </div>
            )}
            {!error && !standings && (
              <div className="p-4 space-y-8 flex flex-col flex-grow overflow-auto bg-inherit">
                No results found
              </div>
            )}
            {standings && (
              <ScrollArea>
                <div className="flex flex-col flex-grow max-w-[100vw] overflow-auto">
                  <div className="px-4">
                    <LeagueAndDivisionFilterInputs
                      league={league}
                      division={division}
                      setDivision={setDivision}
                      setLeague={setLeague}
                    ></LeagueAndDivisionFilterInputs>
                  </div>

                  <div className="flex flex-col mt-4 rounded-none border-none bg-secondary md:items-start lg:items-center">
                    {standings.records.map((division) => (
                      <Card
                        key={division.division.id}
                        className="rounded-none overflow-hidden m-0 border-none md:min-w-full md:max-w-full lg:min-w-[70%] lg:max-w-[70%]"
                      >
                        <CardHeader className="border-none h-fit">
                          <CardTitle className="flex flex-wrap items-center justify-between border-none">
                            <span>
                              {division.division.id
                                ? standings.divisions.find(
                                    (d) => d.id === division.division.id
                                  )?.name
                                : ""}
                            </span>
                            <Badge className="bg-secondary text-primary">
                              {division.standingsType}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 h-full min-h-0 min-w-full">
                          <ScrollArea>
                            <DataTable
                              columns={columns}
                              data={division.teamRecords}
                              showDateRange={false}
                              sortOrder="desc"
                            ></DataTable>
                            <ScrollBar orientation="horizontal" />
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* ---------- PLAYOFFS TAB ---------- */}
          <TabsContent value="playoffs" className="m-0">
            <div className="flex-grow flex flex-wrap gap-2 justify-end">
              <div className="flex flex-col gap-3 px-4">
                <Label>Season</Label>
                <select
                  className="ring-1 border-none bg-inherit outline-none w-32 h-6 rounded-md cursor-pointer"
                  value={season}
                  onChange={(e) => setSeason(parseInt(e.target.value, 10))}
                >
                  {Array.from({ length: 8 }).map((_, i) => {
                    const y = new Date().getFullYear() - i;
                    return (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {bracketLoading && (
              <div className="flex flex-col items-center justify-center flex-grow py-10">
                <Spinner />
              </div>
            )}

            {!bracketLoading && bracketError && (
              <div className="flex flex-col items-center justify-center flex-grow py-6">
                <p className="text-red-500">{bracketError}</p>
              </div>
            )}

            {!bracketLoading &&
              !bracketError &&
              (!bracket || !bracket.series?.length) && (
                <div className="p-4 space-y-8 flex flex-col flex-grow overflow-auto bg-inherit">
                  No playoff data
                </div>
              )}

            {!bracketLoading && !bracketError && bracket?.series?.length ? (
              // Your bracket component expects { season, series }
              <PlayoffBracket bracket={bracket} />
            ) : null}
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
};

export default StandingsPage;
