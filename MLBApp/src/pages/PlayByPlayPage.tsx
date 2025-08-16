import { useEffect, useMemo, useRef, useState } from "react";
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
import { Accordion } from "src/@/components/ui/accordion";
import { ToggleGroup, ToggleGroupItem } from "src/@/components/ui/toggle-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "src/@/components/ui/table";
import {
  GameHeader,
  PlayByPlayProps,
  PlayByPlayResponse,
  THIRTY_SEC,
  BoxscoreResponse,
  PlayerIdKey,
  ScheduleResponse,
  FIVE_MINUTES,
  GameStatusBucket,
} from "src/interfaces/interfaces";
import {
  adaptPlays,
  groupPlays,
  teamLogoUrl,
  api,
  adaptHeader,
  mlbGameStatus,
} from "src/utils";
import axios from "axios";
import { Spinner } from "src/components/Spinner";
import { Link, useParams } from "react-router-dom";
import { Button } from "src/@/components/ui/button";
import { Boxscore } from "src/components/Boxscore";
import { GameContentResponse } from "src/interfaces/generated.game-content.types";
import { getImagesFromGameContent, getVideo } from "src/repository/images";
import ImageCarousel from "src/components/ImageCarousel";
import { InningPanel, PlayRow } from "src/components/InningPanel";
import {
  BaseballFieldHandle,
  PlayEvent,
} from "src/interfaces/baseballField.types";
import {
  BaseballField,
  outsRecordedOnPlay,
  toRunnerMovements,
} from "src/components/BaseBallField";

export function ScoreBug({
  header,
  gamePk,
  status,
}: {
  header: GameHeader;
  gamePk: number;
  status: GameStatusBucket;
}) {
  const { away, home, statusText, count } = header;
  const splitAwayName = away.team.name.split(" ");
  const splitHomeName = home.team.name.split(" ");

  const awayAbbr = away.team.abbr ?? splitAwayName[splitAwayName.length - 1];
  const homeAbbr = home.team.abbr ?? splitHomeName[splitHomeName.length - 1];

  const awayLogo = away.logoUrl ?? teamLogoUrl(away.team.id);
  const homeLogo = home.logoUrl ?? teamLogoUrl(home.team.id);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center">
      <div className="flex gap-3 flex-col md:flex-row md:justify-around col-span-3">
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
        <div className="hidden lg:flex items-center justify-center text-sm text-muted-foreground">
          {statusText ?? ""}
        </div>

        {/* Home */}
        <div className="flex items-center gap-3 justify-end flex-row-reverse sm:justify-start md:flex-row lg:justify-end">
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
      </div>

      {/* Count/outs row */}
      <div className="lg:col-span-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">B {count?.balls ?? 0}</Badge>
        <Badge variant="outline">S {count?.strikes ?? 0}</Badge>
        <Badge variant="outline">O {count?.outs ?? 0}</Badge>
        <Separator orientation="vertical" className="mx-2 h-4" />
        <span>{statusText}</span>
      </div>

      {/* Boxscore */}
      <div className="w-full col-span-3">
        <Boxscore
          gamePk={gamePk}
          awayAbbr={awayAbbr}
          homeAbbr={homeAbbr}
          gameStatus={status}
        ></Boxscore>
      </div>
    </div>
  );
}

export function PlayByPlay({
  groupByInning = true,
  initialFilter = "all",
  onPlayClick,
}: PlayByPlayProps) {
  const today = new Date();

  const { id, gameDate } = useParams();
  const [tab, setTab] = useState<string>("pbp");
  const [lineupsTab, setLineupsTab] = useState<"home" | "away">("home");
  const [filter, setFilter] = useState<"all" | "scoring" | "home" | "away">(
    initialFilter
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const prmRef = useRef(prefersReducedMotion);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [noGameFound, setNoGameFound] = useState<boolean>(false);
  const [header, setHeader] = useState<GameHeader | null>(null);
  const [plays, setPlays] = useState<PlayEvent[]>([]);
  const [gameContent, setGameContent] = useState<GameContentResponse | null>(
    null
  );
  const [boxscore, setBoxscore] = useState<BoxscoreResponse | null>(null);
  const [gameImages, setGameImages] = useState<string[]>([]);

  const [hideHighlights, setHideHighlights] = useState<boolean>(true);
  const [hideVideoHighlights, setHideVideoHighlights] =
    useState<boolean>(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>(
    today.toLocaleString()
  );

  const video = useRef<HTMLVideoElement>(null);
  let videoUnmuted = false;
  const date = gameDate ?? today.toLocaleString();
  const [bucket, setBucket] = useState<GameStatusBucket>("other");

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

  const fieldRef = useRef<BaseballFieldHandle>(null);

  const handlePlayClick = (play: PlayEvent) => {
    const runners = toRunnerMovements(play);
    const outs = outsRecordedOnPlay(play);

    fieldRef.current?.simulate({
      team: play.team,
      description: play.description,
      runners,
      outsRecorded: outs,
      rbi: play.resultObj?.rbi,
      balls: play.count ? Number(play.count.split("-")[0]) : undefined, // if you encode like "3-2"
      strikes: play.count ? Number(play.count.split("-")[1]) : undefined,
      awayScore: play.awayScore,
      homeScore: play.homeScore,
    });
  };

  useEffect(() => {
    prmRef.current = prefersReducedMotion;
  }, [prefersReducedMotion]);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) =>
      setPrefersReducedMotion(
        "matches" in e ? e.matches : (e as MediaQueryList).matches
      );

    handler(mql);
    mql.addEventListener?.("change", handler);

    return () => {
      mql.removeEventListener?.("change", handler);
      // mql.removeListener && mql.removeListener(handler);
    };
  }, []);

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

        const state = currentGame?.status?.detailedState ?? "";
        setBucket(mlbGameStatus(state));

        const gameContentTick = async () => {
          try {
            const gameContentEndPoint = `mlb/game-content`;

            const gameContentResp = await api.post<GameContentResponse>(
              gameContentEndPoint,
              {
                gamePk: currentGame?.gamePk,
              },
              { signal: ac.signal }
            );

            const images = getImagesFromGameContent(gameContentResp.data, {
              variant: "different",
            });

            const imagesExist = images.length > 0;

            const videoExist =
              gameContentResp.data.media.epgAlternate &&
              gameContentResp.data.media.epgAlternate.length > 0;

            if (
              !gameContentResp.data ||
              (!imagesExist && !videoExist) ||
              (!imagesExist && videoExist && prmRef.current)
            ) {
              setHideHighlights(true);
            } else {
              if (!videoExist || prmRef.current) {
                setHideVideoHighlights(true);
              }
              setHideHighlights(false);
              setGameContent(gameContentResp.data);
              setGameImages(images);
            }
          } catch (e: any) {
            if ((e as any).name === "AbortError") return;
            setError(e);
          }
        };

        const scoreTick = async () => {
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
            const _plays = adaptPlays(data);

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
            setPlays(_plays);
            setBoxscore(bxsData);

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

        const tickId = window.setInterval(scoreTick, THIRTY_SEC);
        const gameContentTickId = window.setInterval(
          gameContentTick,
          FIVE_MINUTES
        );

        gameContentTick();
        scoreTick();

        return () => {
          ac.abort();
          window.clearInterval(tickId);
          window.clearInterval(gameContentTickId);
          // Cleanup function to remove the event listener
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

  if (loading) {
    return (
      <div className="flex flex-col flex-grow h-full w-full items-center justify-center p-4">
        <Spinner />
      </div>
    );
  }

  if (error) return <p className="text-red-500">{error}</p>;

  if (noGameFound) {
    return (
      <div className="h-screen overflow-hidden flex flex-col">
        <div className="flex-shrink-0 p-4">
          <div className="flex flex-col w-full items-center justify-center">
            <div className="w-fit my-4 flex gap-4 items-center">
              <Link to={`/games/${date}`} className="w-full h-full">
                <Button variant={"secondary"} className="bg-blue-300">
                  Back
                </Button>
              </Link>
            </div>
            <div>Last update time: {lastUpdateTime}</div>
          </div>
        </div>
        <div className="flex-1 p-4 pt-0">
          <Card className="w-full h-full flex flex-col">
            <CardHeader className="flex-shrink-0 pb-4">
              <CardTitle className="text-xl">No Game found.</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <div>Try adjusting your search date.</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-wrap overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Card className="w-full flex-grow flex flex-col rounded-none">
          <div className="flex-shrink-0 p-4">
            <div className="w-full my-4 gap-4 flex flex-col justify-center items-end">
              <Link to={`/games/${date}`}>
                <Button variant={"secondary"} className="bg-blue-300">
                  Back
                </Button>
              </Link>
              <p className="text-xs">Last update time: {lastUpdateTime}</p>
            </div>
          </div>
          <CardHeader className="flex-shrink-0 pb-4">
            <CardTitle className="text-xl">Play-by-Play</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 flex flex-col space-y-3">
            {/* Fixed content section */}
            <div className="flex-shrink-0">
              <ScoreBug
                header={header ?? h}
                gamePk={parseInt(id ?? "0")}
                status={bucket}
              />
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
                    <TabsTrigger
                      value="highlights"
                      className={`${hideHighlights ? "hidden" : "block"}`}
                    >
                      Highlights
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Scrollable content section */}
            <div className="flex-1 min-h-0">
              <Tabs value={tab} onValueChange={setTab} className="h-full">
                <TabsContent value="pbp" className="h-full mt-0">
                  <div className="h-full rounded-md border">
                    <ScrollArea className="h-full">
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
                                  onPlayClick={handlePlayClick}
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
                                  <TableHead className="w-[44px]">
                                    Out
                                  </TableHead>
                                  <TableHead className="w-[140px]">
                                    Result
                                  </TableHead>
                                  <TableHead>Description</TableHead>
                                  <TableHead className="text-right">
                                    Score
                                  </TableHead>
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
                  </div>
                </TabsContent>

                <TabsContent value="lineups" className="h-full mt-0">
                  <div className="h-full flex flex-col">
                    <div className="flex-shrink-0 mb-4">
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
                    </div>

                    <div className="flex-1 min-h-0 rounded-md border">
                      <ScrollArea className="h-full">
                        <div className="p-4 space-y-6">
                          <div>
                            <p className="font-semibold mb-2">Batting</p>
                            <div className="rounded-md border">
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
                                    boxscore?.teams[
                                      lineupsTab
                                    ].battingOrder.map((id) => {
                                      const player =
                                        boxscore!.teams[lineupsTab].players[
                                          `ID${id}` as PlayerIdKey
                                        ];

                                      return (
                                        <TableRow key={id}>
                                          <TableCell>
                                            <div className="flex gap-3">
                                              <div>{player.jerseyNumber}</div>
                                              <div>
                                                {player.person.boxscoreName}
                                              </div>
                                              <div>
                                                &nbsp;·&nbsp;
                                                {player.position.abbreviation}
                                              </div>
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            {player.stats.batting.atBats}
                                          </TableCell>
                                          <TableCell>
                                            {player.stats.batting.runs}
                                          </TableCell>
                                          <TableCell>
                                            {player.stats.batting.hits}
                                          </TableCell>
                                          <TableCell>
                                            {player.stats.batting.baseOnBalls}
                                          </TableCell>
                                          <TableCell>
                                            {player.stats.batting.rbi}
                                          </TableCell>
                                          <TableCell>
                                            {player.stats.batting.homeRuns}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })
                                  ) : (
                                    <TableRow>
                                      <TableCell colSpan={7}>No data</TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </div>

                          <div>
                            <p className="font-semibold mb-2">Pitching</p>
                            <div className="rounded-md border">
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
                                    boxscore.teams[lineupsTab].pitchers.map(
                                      (id) => {
                                        const player =
                                          boxscore!.teams[lineupsTab].players[
                                            `ID${id}` as PlayerIdKey
                                          ];

                                        return (
                                          <TableRow key={id}>
                                            <TableCell>
                                              <div className="flex gap-3">
                                                <div>{player.jerseyNumber}</div>
                                                <div>
                                                  {player.person.boxscoreName}
                                                </div>
                                                <div>
                                                  &nbsp;·&nbsp;
                                                  {player.position.abbreviation}
                                                </div>
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              {
                                                player.stats.pitching
                                                  .inningsPitched
                                              }
                                            </TableCell>
                                            <TableCell>
                                              {player.stats.pitching.hits}
                                            </TableCell>
                                            <TableCell>
                                              {player.stats.pitching.earnedRuns}
                                            </TableCell>
                                            <TableCell>
                                              {
                                                player.stats.pitching
                                                  .baseOnBalls
                                              }
                                            </TableCell>
                                            <TableCell>
                                              {player.stats.pitching.strikeOuts}
                                            </TableCell>
                                          </TableRow>
                                        );
                                      }
                                    )
                                  ) : (
                                    <TableRow>
                                      <TableCell colSpan={6}>No data</TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="highlights" className={`h-full mt-0`}>
                  <div className="h-full flex flex-col items-center justify-center rounded-md">
                    {hideVideoHighlights ? (
                      <ImageCarousel
                        images={gameImages}
                        autoPlay={{
                          delay: prmRef.current ? 10000 : 5000,
                        }}
                        classN="basis-3/4"
                        opts={{ align: "center", dragFree: true, loop: true }}
                      ></ImageCarousel>
                    ) : (
                      <video
                        ref={video}
                        muted={true}
                        onVolumeChange={() => {
                          if (
                            video &&
                            video.current &&
                            video.current.volume === 1 &&
                            !videoUnmuted
                          ) {
                            video.current.volume = 0.1;
                            videoUnmuted = true;
                          }
                        }}
                        controls
                        preload={"true"}
                        autoPlay={true}
                        loop={true}
                        className={`rounded-md min-w-[150px] max-w-[80%] scale-150 px-4 sm:scale-100 sm:mt-12 sm:max-w-[80%] ${
                          hideHighlights ? "hidden" : "block"
                        }`}
                      >
                        <source
                          src={getVideo(gameContent)}
                          type="video/mp4"
                        ></source>
                        Your Browser does not support video tag.
                      </video>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
      <BaseballField ref={fieldRef}></BaseballField>
    </div>
  );
}
