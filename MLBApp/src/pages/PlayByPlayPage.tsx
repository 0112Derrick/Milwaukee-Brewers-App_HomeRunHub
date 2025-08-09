import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  MlbTeamDataI,
} from "src/interfaces";
import { adaptHeader, adaptPlays, groupPlays } from "src/utils";
import axios from "axios";
import { Spinner } from "src/components/Spinner";
import { Link, useParams } from "react-router-dom";
import { Boxscore } from "src/components/Boxscore";
import { Button } from "src/@/components/ui/button";

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

// Optional helper to derive a team logo if you don’t pass one
const teamLogoUrl = (
  teamId: number,
  theme: "dark" | "light" = "dark",
  variant: "cap" | "primary" = "cap"
) =>
  `https://www.mlbstatic.com/team-logos/team-${variant}-on-${theme}/${teamId}.svg`;

function ScoreBug({ header }: { header: GameHeader }) {
  const { away, home, statusText, count } = header;

  const awayAbbr = away.team.abbr ?? away.team.name.slice(0, 3).toUpperCase();
  const homeAbbr = home.team.abbr ?? home.team.name.slice(0, 3).toUpperCase();

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
  const rbi = play.resultObj?.rbi ?? 0; // resultObj holds the raw result object if you keep it

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
  const { id, homeId, awayId } = useParams();
  const [tab, setTab] = useState<string>("pbp");
  const [filter, setFilter] = useState<"all" | "scoring" | "home" | "away">(
    initialFilter
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [header, setHeader] = useState<GameHeader | null>(null);
  const [plays, setPlays] = useState<PlayEvent[]>([]);
  const [pbp, setPbp] = useState<PlayByPlayResponse | null>(null);

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

  const serverIpAddress = "";
  const localhost = "http://localhost:8080/";
  const defaultAddress = serverIpAddress || localhost;

  const api = axios.create(); // Instance of axios with default settings.

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const endpoint = `${defaultAddress}mlb/playbyplay`;
        const teamSearch = `${defaultAddress}mlb/teams`;

        if (!homeId || !awayId) {
          setLoading(false);
          setError("HomeId and AwayId are required");
          return;
        }

        const awayIdInt = parseInt(awayId);
        const homeIdInt = parseInt(homeId);

        const ac = new AbortController();
        const tick = async () => {
          try {
            const [pbpResp, teamSearchResp] = await Promise.all([
              api.post<PlayByPlayResponse>(
                endpoint,
                {
                  gameDt: new Date().toLocaleDateString("en-CA"),
                  gamePk: parseInt(id ?? "0"),
                },
                { signal: ac.signal }
              ),
              api.post<MlbTeamDataI[]>(
                teamSearch,
                {
                  teams: [homeIdInt, awayIdInt],
                },
                { signal: ac.signal }
              ),
            ]);

            const data = pbpResp.data;
            setPbp(data);

            const teams = {
              away: teamSearchResp.data.find((team) => team.id === awayIdInt),
              home: teamSearchResp.data.find((team) => team.id === homeIdInt),
            };

            setHeader(
              adaptHeader(data, {
                away: {
                  id: teams.away?.id ?? 0,
                  name: teams.away?.name ?? "",
                  abbr: teams.away?.nickname,
                  logoUrl: teams.away?.logo,
                },
                home: {
                  id: teams.home?.id ?? 0,
                  name: teams.home?.name ?? "",
                  abbr: teams.home?.nickname,
                  logoUrl: teams.home?.logo,
                },
                statusText: "",
              })
            );

            const _plays = adaptPlays(data);

            setPlays(_plays);
          } catch (e: any) {
            if ((e as any).name === "AbortError") return;
            setError(e);
          }
        };

        const tickId = window.setInterval(tick, 30000);
        tick();
        return () => {
          ac.abort();
          window.clearInterval(tickId);
        };
      } catch (err: any) {
        if (!axios.isCancel(err))
          setError(err.message || "Failed to load play-by-play");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id]);

  if (loading)
    return (
      <div className="flex flex-col flex-grow h-full w-full items-center justify-center p-4">
        <Spinner />
      </div>
    );
  if (error) return <p className="text-red-500">{error}</p>;

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
    <div className="flex-grow flex flex-col mt-24 p-8">
      <div className="w-fit self-end my-4">
        <Link to={`/feed`} className="w-full h-full">
          <Button variant={"secondary"} className="bg-blue-300">
            Back
          </Button>
        </Link>
      </div>

      <Card className="w-full max-h-[600px] overflow-auto">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Play-by-Play</CardTitle>
          <CardDescription>Live events, grouped by inning</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ScoreBug header={header ?? h} />
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
                <TabsTrigger value="box">Box</TabsTrigger>
                <TabsTrigger value="lineups">Lineups</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsContent value="pbp" className="mt-0">
              <ScrollArea className={cn("rounded-md border", maxHeightClass)}>
                <div className="p-3">
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

            <TabsContent value="box">
              <Boxscore gamePk={parseInt(id ?? "0")}></Boxscore>
            </TabsContent>
            <TabsContent value="lineups">
              <div className="text-sm text-muted-foreground p-4">
                Hook your Lineups here.
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
