import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "src/@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "src/@/components/ui/tabs";
import { ScrollArea } from "src/@/components/ui/scroll-area";
import { Badge } from "src/@/components/ui/badge";
import { Separator } from "src/@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "src/@/components/ui/accordion";
import { ToggleGroup, ToggleGroupItem } from "src/@/components/ui/toggle-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "src/@/components/ui/table";
import { cn } from "src/@/lib/utils"; // optional shadcn helper – remove or swap for your own
import {
  ChevronDown,
  ChevronRight,
  CircleDot,
  Flag,
  Trophy,
  Drill,
  Ban,
  AlertTriangle,
  Play as PlayIcon,
  SquareGanttChart,
} from "lucide-react";
import {
  PlayEvent,
  GameHeader,
  PlayByPlayProps,
  PlayByPlayResponse,
  THIRTY_SEC,
  BoxscoreResponse,
  PlayerIdKey,
  ScheduleResponse,
} from "src/interfaces";
import {
  adaptHeader,
  adaptPlays,
  groupPlays,
  teamLogoUrl,
  api,
} from "src/utils";
import axios from "axios";
import { Spinner } from "src/components/Spinner";
import { Link, useParams } from "react-router-dom";
import { Button } from "src/@/components/ui/button";
import { Boxscore } from "src/components/Boxscore";

function resultBadgeVariant(result: PlayEvent["result"]) {
  switch (result) {
    case "Home Run":
      return "destructive" as const;
    case "Triple":
    case "Double":
    case "Single":
      return "default" as const;
    case "Walk":
    case "Hit By Pitch":
      return "secondary" as const;
    case "Strikeout":
    case "Out":
      return "outline" as const;
    default:
      return "outline" as const;
  }
}

function ResultIcon({ result }: { result: PlayEvent["result"] }) {
  switch (result) {
    case "Home Run":
      return <Trophy className="h-4 w-4" />;
    case "Triple":
      return <SquareGanttChart className="h-4 w-4" />;
    case "Double":
      return <Drill className="h-4 w-4" />;
    case "Single":
      return <CircleDot className="h-4 w-4" />;
    case "Walk":
      return <Flag className="h-4 w-4" />;
    case "Hit By Pitch":
      return <AlertTriangle className="h-4 w-4" />;
    case "Strikeout":
      return <Ban className="h-4 w-4" />;
    case "Out":
    default:
      return <PlayIcon className="h-4 w-4" />;
  }
}

function ScoreBug({ header, gamePk }: { header: GameHeader; gamePk: number }) {
  const { away, home, statusText, count } = header;
  console.log(away.team.name);
  const splitAwayName = away.team.name.split(" ");
  const splitHomeName = home.team.name.split(" ");

  const awayAbbr = away.team.abbr ?? splitAwayName[splitAwayName.length - 1];
  const homeAbbr = home.team.abbr ?? splitHomeName[splitHomeName.length - 1];

  const awayLogo = away.logoUrl ?? teamLogoUrl(away.team.id);
  const homeLogo = home.logoUrl ?? teamLogoUrl(home.team.id);

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr] items-center">
      {/* Away */}
      <div className="flex items-center gap-3">
        {awayLogo ? (
          <img src={awayLogo} alt={`${awayAbbr} logo`} className="h-8 w-8" />
        ) : (
          <div className="h-8 w-8 rounded bg-muted" />
        )}
        <div className="font-medium">{awayAbbr}</div>
        <div className="text-lg font-bold tabular-nums">
          {away.score ?? "-"}
        </div>
      </div>

      {/* Status */}
      <div className="hidden md:flex items-center justify-center text-sm text-muted-foreground">
        {statusText ?? ""}
      </div>

      {/* Home */}
      <div className="flex items-center gap-3 justify-end">
        <div className="text-lg font-bold tabular-nums">
          {home.score ?? "-"}
        </div>
        <div className="font-medium">{homeAbbr}</div>
        {homeLogo ? (
          <img src={homeLogo} alt={`${homeAbbr} logo`} className="h-8 w-8" />
        ) : (
          <div className="h-8 w-8 rounded bg-muted" />
        )}
      </div>

      {/* Count/outs row */}
      <div className="md:col-span-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">B {count?.balls ?? 0}</Badge>
        <Badge variant="outline">S {count?.strikes ?? 0}</Badge>
        <Badge variant="outline">O {count?.outs ?? 0}</Badge>
        <Separator orientation="vertical" className="mx-2 h-4" />
        <span>{statusText}</span>
      </div>

      <div className="w-full col-span-3">
        <Boxscore
          gamePk={gamePk}
          awayAbbr={awayAbbr}
          homeAbbr={homeAbbr}
        ></Boxscore>
      </div>
    </div>
  );
}

function PlayRow({
  play,
  onClick,
}: {
  play: PlayEvent; // see updated type below
  onClick?: (p: PlayEvent) => void;
}) {
  const scoring = play.isScoringPlay;
  const batterName = play.matchup?.batter?.fullName ?? "";
  const rbi = play.resultObj?.rbi ?? 0;

  return (
    <TableRow
      className={cn(
        "hover:bg-muted/50 transition-colors",
        scoring && "bg-amber-50 dark:bg-amber-900/20"
      )}
      onClick={() => onClick?.(play)}
    >
      <TableCell className="w-[44px] text-muted-foreground tabular-nums text-xs">
        {play.count ?? ""}
      </TableCell>
      <TableCell className="w-[44px] text-muted-foreground tabular-nums text-xs">
        {play.outsAfter ?? ""}
      </TableCell>
      <TableCell className="w-[140px]">
        <div className="flex items-center gap-2">
          <ResultIcon result={play.result} />
          <Badge variant={resultBadgeVariant(play.result)}>{play.result}</Badge>
        </div>
      </TableCell>
      <TableCell>
        <div className="leading-tight">
          <div className="font-medium">{play.description}</div>
          <div className="text-xs text-muted-foreground">
            {batterName}
            {rbi > 0 ? ` • ${rbi} RBI` : ""}
          </div>
        </div>
      </TableCell>
      <TableCell className="w-[80px] text-right tabular-nums">
        {play.awayScore != null && play.homeScore != null ? (
          <span>
            {play.awayScore}-{play.homeScore}
          </span>
        ) : null}
      </TableCell>
    </TableRow>
  );
}

function InningPanel({
  title,
  plays,
  onPlayClick,
}: {
  title: string;
  plays: PlayEvent[];
  onPlayClick?: (p: PlayEvent) => void;
}) {
  return (
    <AccordionItem value={title} className="border-none">
      <AccordionTrigger className="px-0 text-left hover:no-underline">
        <div className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 data-[state=open]:hidden" />
          <ChevronDown className="h-4 w-4 hidden data-[state=open]:block" />
          <span className="font-semibold">{title}</span>
          <Badge variant="outline" className="ml-2">
            {plays.length} plays
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[44px]">Ct</TableHead>
                <TableHead className="w-[44px]">Out</TableHead>
                <TableHead className="w-[140px]">Result</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plays.map((p) => (
                <PlayRow key={p.id} play={p} onClick={onPlayClick} />
              ))}
            </TableBody>
          </Table>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function PlayByPlay({
  groupByInning = true,
  maxHeightClass = "max-h-[70vh]",
  initialFilter = "all",
  onPlayClick,
}: PlayByPlayProps) {
  const { id, gameDate } = useParams();
  const [tab, setTab] = useState<string>("pbp");
  const [lineupsTab, setLineupsTab] = useState<"home" | "away">("home");
  const [filter, setFilter] = useState<"all" | "scoring" | "home" | "away">(
    initialFilter
  );
  const today = new Date();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [noGameFound, setNoGameFound] = useState<boolean>(false);
  const [header, setHeader] = useState<GameHeader | null>(null);
  const [plays, setPlays] = useState<PlayEvent[]>([]);
  const [boxscore, setBoxscore] = useState<BoxscoreResponse | null>(null);
  const [date, setDate] = useState<Date | undefined>(
    new Date(gameDate ?? today)
  );
  const [lastUpdateTime, setLastUpdateTime] = useState<string>(
    today.toLocaleString()
  );

  const filtered = useMemo(() => {
    return plays.filter((p) => {
      if (filter === "scoring") return !!p.isScoringPlay;
      if (filter === "home") return p.team === "home";
      if (filter === "away") return p.team === "away";
      return true;
    });
  }, [plays, filter]);

  const grouped = useMemo(
    () => (groupByInning ? groupPlays(filtered) : []),
    [filtered, groupByInning]
  );

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);

        const gamePk = parseInt(id ?? "0");
        const ac = new AbortController();
        const scheduleEndPoint = `mlb/schedule`;

        const scheduleResp = await api.post<ScheduleResponse>(
          scheduleEndPoint,
          {
            startDt: date,
            endDt: date,
          }
        );

        const currentGame = scheduleResp.data.dates[0].games.find((game) => {
          return game.gamePk === gamePk;
        });

        if (!currentGame) {
          setNoGameFound(true);
          return;
        } else {
          setNoGameFound(false);
        }

        const tick = async () => {
          const endpoint = `mlb/playbyplay`;
          const boxscoreEndPoint = `mlb/boxscore`;

          try {
            const [pbpResp, boxScoreResp] = await Promise.all([
              api.post<PlayByPlayResponse>(
                endpoint,
                {
                  gameDt: currentGame?.gameDate,
                  gamePk: currentGame?.gamePk,
                },
                { signal: ac.signal }
              ),

              api.post<BoxscoreResponse>(
                boxscoreEndPoint,
                {
                  gamePk: currentGame?.gamePk,
                  gameDt: currentGame?.gameDate,
                },
                { signal: ac.signal }
              ),
            ]);

            const data = pbpResp.data;

            const bxsData = boxScoreResp.data;
            setBoxscore(bxsData);
            console.table(currentGame.teams.away);
            setHeader(
              adaptHeader(data, {
                away: {
                  id: currentGame.teams.away.team.id ?? 0,
                  name: currentGame.teams.away.team.name ?? "",
                },
                home: {
                  id: currentGame.teams.home.team.id ?? 0,
                  name: currentGame.teams.home.team.name ?? "",
                },
                statusText: "",
              })
            );

            const _plays = adaptPlays(data);

            setPlays(_plays);
            setLastUpdateTime(new Date().toLocaleString());
          } catch (e: any) {
            if ((e as any).name === "AbortError") return;
            setError(e);
          } finally {
            setTimeout(() => {
              setLoading(false);
            }, 750);
          }
        };

        const tickId = window.setInterval(tick, THIRTY_SEC);
        tick();
        return () => {
          ac.abort();
          window.clearInterval(tickId);
        };
      } catch (err: any) {
        if (!axios.isCancel(err))
          setError(err.message || "Failed to load play-by-play");
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 750);
      }
    };

    run();
  }, [id, date]);

  if (loading)
    return (
      <div className="flex flex-col flex-grow h-full w-full items-center justify-center p-4">
        <Spinner />
      </div>
    );
  if (error) return <p className="text-red-500">{error}</p>;

  if (noGameFound) {
    return (
      <div className="flex-grow max-h-full overflow-hidden flex flex-col mt-16 p-4">
        <div className="flex flex-col w-full self-end items-center justify-center">
          <div className="w-fit my-4 flex gap-4 items-center">
            <Link to={`/games`} className="w-full h-full">
              <Button variant={"secondary"} className="bg-blue-300">
                Back
              </Button>
            </Link>
          </div>
          <div>Last update time: {lastUpdateTime}</div>
        </div>
        <Card className="w-full h-[30vh] overflow-y-hidden overflow-x-auto">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">No Game found.</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>Try adjusting your search date.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const h: GameHeader = {
    away: {
      team: {
        id: 0,
        name: "",
        abbr: undefined,
      },
      score: null,
      logoUrl: undefined,
    },
    home: {
      team: {
        id: 0,
        name: "",
        abbr: undefined,
      },
      score: null,
      logoUrl: undefined,
    },
    statusText: "",
    count: {
      balls: 0,
      strikes: 0,
      outs: 0,
    },
  };

  return (
    <div className="flex-grow max-h-full overflow-hidden flex flex-col mt-16 p-4">
      <div className="flex flex-col w-full self-end items-end justify-center">
        <div className="w-fit my-4 flex gap-4 items-end">
          <Link to={`/games`} className="w-full h-full">
            <Button variant={"secondary"} className="bg-blue-300">
              Back
            </Button>
          </Link>
        </div>
        <div>Last update time: {lastUpdateTime}</div>
      </div>

      <Card className="w-full h-[70vh] overflow-y-hidden overflow-x-auto">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Play-by-Play</CardTitle>
          {/* <CardDescription>Live events, grouped by inning</CardDescription> */}
        </CardHeader>
        <CardContent className="space-y-3">
          <ScoreBug header={header ?? h} gamePk={parseInt(id ?? "0")} />
          <Separator className="my-2" />

          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <ToggleGroup
              type="single"
              value={filter}
              onValueChange={(v) => v && setFilter(v as any)}
            >
              <ToggleGroupItem value="all">All plays</ToggleGroupItem>
              <ToggleGroupItem value="scoring">Scoring</ToggleGroupItem>
              <ToggleGroupItem value="home">Home batting</ToggleGroupItem>
              <ToggleGroupItem value="away">Away batting</ToggleGroupItem>
            </ToggleGroup>

            <Tabs value={tab} onValueChange={setTab} className="ml-auto">
              <TabsList>
                <TabsTrigger value="pbp">PBP</TabsTrigger>
                <TabsTrigger value="lineups">Lineups</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsContent value="pbp" className="mt-0 overflow-clip">
              <ScrollArea className={cn("rounded-md border", maxHeightClass)}>
                <div className="p-3 max-h-72 overflow-auto">
                  {groupByInning ? (
                    <Accordion type="multiple" className="w-full">
                      {grouped.map(({ key, plays }) => {
                        const [inning, half] = key.split("-");
                        const title = `${half} ${inning}`;
                        return (
                          <InningPanel
                            key={key}
                            title={title}
                            plays={plays}
                            onPlayClick={onPlayClick}
                          />
                        );
                      })}
                    </Accordion>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[44px]">Ct</TableHead>
                            <TableHead className="w-[44px]">Out</TableHead>
                            <TableHead className="w-[140px]">Result</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Score</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filtered.map((p) => (
                            <PlayRow
                              key={p.id}
                              play={p}
                              onClick={onPlayClick}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="lineups" className="flex flex-col">
              <div className="mt-0 h-[300px] overflow-auto">
                <ScrollArea>
                  <Tabs
                    value={lineupsTab}
                    onValueChange={(val: string) => {
                      if (val !== "home" && val !== "away") {
                        setLineupsTab("home");
                      } else {
                        setLineupsTab(val);
                      }
                    }}
                    className="ml-auto self-end"
                  >
                    <TabsList>
                      <TabsTrigger value="home">Home</TabsTrigger>
                      <TabsTrigger value="away">Away</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <p className="font-semibold">Batting</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead>AB</TableHead>
                        <TableHead>R</TableHead>
                        <TableHead>H</TableHead>
                        <TableHead>BB</TableHead>
                        <TableHead>RBI</TableHead>
                        <TableHead>HR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {boxscore &&
                      boxscore.teams[lineupsTab] &&
                      boxscore.teams[lineupsTab].battingOrder ? (
                        boxscore?.teams[lineupsTab].battingOrder.map((id) => {
                          const player =
                            boxscore!.teams[lineupsTab].players[
                              `ID${id}` as PlayerIdKey
                            ];

                          return (
                            <TableRow key={id}>
                              <TableCell>
                                <div className="flex gap-3">
                                  <div>{player.jerseyNumber}</div>
                                  <div>{player.person.boxscoreName}</div>
                                  <div>
                                    &nbsp;·&nbsp;
                                    {player.position.abbreviation}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {player.stats.batting.atBats}
                              </TableCell>
                              <TableCell>{player.stats.batting.runs}</TableCell>
                              <TableCell>{player.stats.batting.hits}</TableCell>
                              <TableCell>
                                {player.stats.batting.baseOnBalls}
                              </TableCell>
                              <TableCell>{player.stats.batting.rbi}</TableCell>
                              <TableCell>
                                {player.stats.batting.homeRuns}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <div>No data</div>
                      )}
                    </TableBody>
                  </Table>

                  <p className="font-semibold">Pitching</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead>H</TableHead>
                        <TableHead>ER</TableHead>
                        <TableHead>BB</TableHead>
                        <TableHead>SO</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {boxscore &&
                      boxscore.teams[lineupsTab] &&
                      boxscore.teams[lineupsTab].pitchers ? (
                        boxscore.teams[lineupsTab].pitchers.map((id) => {
                          const player =
                            boxscore!.teams[lineupsTab].players[
                              `ID${id}` as PlayerIdKey
                            ];

                          return (
                            <TableRow key={id}>
                              <TableCell>
                                <div className="flex gap-3">
                                  <div>{player.jerseyNumber}</div>
                                  <div>{player.person.boxscoreName}</div>
                                  <div>
                                    &nbsp;·&nbsp;
                                    {player.position.abbreviation}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {player.stats.pitching.inningsPitched}
                              </TableCell>
                              <TableCell>
                                {player.stats.pitching.hits}
                              </TableCell>
                              <TableCell>
                                {player.stats.pitching.earnedRuns}
                              </TableCell>
                              <TableCell>
                                {player.stats.pitching.baseOnBalls}
                              </TableCell>
                              <TableCell>{player.stats.batting.rbi}</TableCell>
                              <TableCell>
                                {player.stats.pitching.strikeOuts}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <div>No data</div>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
