import axios from "axios";
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "src/@/components/ui/button";
import { Skeleton } from "src/@/components/ui/skeleton";
import {
  GAME_STATUSES,
  GameStatusBucket,
  MlbGame,
  ScheduleResponse,
  THREE_MINUTES,
} from "src/interfaces/interfaces";
import ErrorPage from "./ErrorPage";
import { Boxscore } from "src/components/Boxscore";
import useScreenSize from "src/hooks/useScreenSize";
import { Table, TableBody } from "src/@/components/ui/table";
import {
  api,
  formatYMDLocal,
  mlbGameStatus,
  parseYMDLocal,
  sortGamesArr,
  teamLogoUrl,
} from "src/utils";
import DatePicker from "src/components/DatePicker";
import { PlayCircle, TriangleIcon } from "lucide-react";
import { GameCard } from "src/components/GameCard";
import { ScrollArea } from "src/@/components/ui/scroll-area";
import { isDate } from "date-fns";
import { Option, Select } from "react-day-picker";
import { Label } from "src/@/components/ui/label";

export function LiveGames() {
  const { gameDate } = useParams();
  const [gamesData, setGamesData] = useState<ScheduleResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [date, setDate] = useState<Date>(() =>
    gameDate ? parseYMDLocal(gameDate) : new Date()
  );
  const [sort, setSort] = useState<GameStatusBucket>("live");
  const [noGamesFound, setNoGamesFound] = useState<boolean>(false);
  const [sortedGames, setSortedGames] = useState<MlbGame[]>([]);

  const navigate = useNavigate();
  const screenSize = useScreenSize();

  useEffect(() => {
    if (!gameDate) return;
    setDate(parseYMDLocal(gameDate));
  }, [gameDate]);

  useEffect(() => {
    setSortedGames(sortGamesArr(sortedGames, sort));
  }, [sort]);

  useEffect(() => {
    const ac = new AbortController();

    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const currentDate = formatYMDLocal(date);

        const { data } = await api.post<ScheduleResponse>(
          `mlb/schedule`,
          {
            startDt: currentDate,
            endDt: currentDate,
          },
          { signal: ac.signal }
        );

        setGamesData(data);

        if (data) {
          const currentDayGames = data.dates.find(
            (games) => new Date(games.date) <= date
          );

          if (!currentDayGames || currentDayGames.games.length <= 0) {
            setNoGamesFound(true);
            return;
          }

          setSortedGames(sortGamesArr(currentDayGames.games));
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Request canceled:", error.message);
        } else {
          console.error("Error fetching team:", error);
          setError(error);
        }
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 750);
      }
    };

    fetchSchedule();

    const tickId = window.setInterval(fetchSchedule, THREE_MINUTES);
    fetchSchedule();
    return () => {
      ac.abort();
      window.clearInterval(tickId);
    };
  }, [date]);

  const setDateWrapper = (d: string | undefined | Date) => {
    if (!d) {
      d = date;
    }

    if (isDate(d)) {
      setDate(new Date(d));
    }

    if (d && typeof d == "string") {
      setDate(parseYMDLocal(d));
    }

    if (!d) return;
    const next = typeof d === "string" ? d : formatYMDLocal(d);
    navigate(`/games/${next}`, { replace: false });
  };

  if (loading) {
    return (
      <div className="flex flex-grow items-center justify-center p-8">
        <div className="border border-white w-3/4 h-fit rounded flex flex-col items-center justify-center gap-8 p-8 sm:flex-row">
          <div className="grid grid-cols-1 gap-4">
            <Button
              variant={"outline"}
              className="bg-blue-500 hover:bg-blue-600 text-lg text-white hover:text-white"
              onClick={() => {
                navigate("/");
              }}
            >
              Back to home
            </Button>
            <Skeleton className="h-32 w-32 rounded-full bg-white p-4" />
          </div>

          <div className="bg-gray-800 h-full w-full p-6 rounded">
            <Skeleton className="h-8 w-full p-2 m-2 bg-white" />
            <Skeleton className="h-8 w-3/4 p-2 m-2 bg-white" />
            <Skeleton className="h-8 w-3/6 p-2 m-2 bg-white" />
            <Skeleton className="h-8 w-3/4 p-2 m-2 bg-white" />
            <Skeleton className="h-8 w-full p-2 m-2 bg-white" />
            <div className="w-full flex items-center justify-center">
              <Skeleton className="h-8 w-3/12 rounded-full p-2 mt-4 bg-blue-500 shadow-md shadow-black" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorPage pageError={error}></ErrorPage>;
  }

  if (noGamesFound) {
    return (
      <div className="flex flex-col flex-grow">
        <div className="w-full self-end">
          <DatePicker
            label="Search for games by date"
            date={date}
            setDate={setDateWrapper}
          ></DatePicker>
        </div>
        No games
      </div>
    );
  }
  const currentDate = formatYMDLocal(date);

  const games = sortedGames.map((game) => {
    const splitAwayName = game.teams.away.team.name.split(" ");
    const splitHomeName = game.teams.home.team.name.split(" ");

    const awayAbbr =
      splitAwayName[splitAwayName.length - 1] ?? splitHomeName[0];
    const homeAbbr =
      splitHomeName[splitHomeName.length - 1] ?? splitHomeName[0];
    const state = game?.status?.detailedState ?? "";
    const bucket = mlbGameStatus(state);

    return (
      <Link to={`/games/${currentDate}/${game.gamePk}`} key={`${game.gamePk}`}>
        <GameCard game={game} color="red">
          <Boxscore
            gamePk={game.gamePk}
            homeAbbr={homeAbbr}
            awayAbbr={awayAbbr}
            gameStatus={bucket}
          />
        </GameCard>
      </Link>
    );
  });

  const gamesMiniScreen = sortedGames.map((game) => {
    const state = game?.status?.detailedState ?? "";
    const bucket = mlbGameStatus(state);
    const isFinal = bucket === "final";

    const homeWinner = isFinal && game.teams.home.score > game.teams.away.score;

    const awayWinner = isFinal && game.teams.away.score > game.teams.home.score;

    const awayLogo = teamLogoUrl(game.teams.away.team.id);
    const homeLogo = teamLogoUrl(game.teams.home.team.id);
    const ymd = formatYMDLocal(new Date(game.gameDate));

    const awayAbbr =
      game.teams.away.team.name.split(" ")[1] ??
      game.teams.away.team.name.split(" ")[0];
    const homeAbbr =
      game.teams.home.team.name.split(" ")[1] ??
      game.teams.home.team.name.split(" ")[0];

    const gameHref = `/games/${ymd}/${game.gamePk}`;
    const videoHref = `https://www.mlb.com/stories/game/${game.gamePk}`;

    return (
      <div
        key={game.gamePk}
        role="link"
        tabIndex={0}
        onClick={() => navigate(gameHref)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate(gameHref);
          }
        }}
        className="bg-slate-100 text-black cursor-pointer max-w-fit hover:bg-slate-200 transition-colors"
      >
        <div className="flex items-center px-4 border-l border-black">
          {/* teams/score block */}
          <div className="grid grid-cols-2 items-center justify-items-end flex-grow gap-2 py-4 w-[150px]">
            <div className="flex justify-self-start gap-2 items-center">
              <img
                src={awayLogo}
                alt={`${awayAbbr} logo`}
                className="h-8 w-8"
              />
              <p>{awayAbbr}</p>
            </div>
            <div className="flex items-center">
              {game.teams.away.score ?? "-"}{" "}
              <span className={`${awayWinner ? "visible" : "invisible"}`}>
                <TriangleIcon className="-rotate-90 scale-50 fill-black"></TriangleIcon>
              </span>
            </div>

            <div className="flex justify-self-start gap-2 items-center">
              <img
                src={homeLogo}
                alt={`${homeAbbr} logo`}
                className="h-8 w-8"
              />
              <p>{homeAbbr}</p>
            </div>
            <div className="flex items-center">
              {game.teams.home.score ?? "-"}
              <span className={`${homeWinner ? "visible" : "invisible"}`}>
                <TriangleIcon className="-rotate-90 scale-50 fill-black"></TriangleIcon>
              </span>
            </div>
          </div>

          <div className="flex-shrink px-2">
            <a
              href={videoHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label="Open game highlights in a new tab"
              title="Open game highlights"
              className="group"
            >
              <PlayCircle
                className="h-7 w-7 group-hover:stroke-green-600"
                aria-hidden="true"
              />
            </a>
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="flex flex-col gap-4 flex-grow w-full h-[80vh] overflow-hidden mt-24 sm:mt-24 md:mt-24 lg:mt-16">
      <div className="p-2 italic">Games today: {gamesData?.totalGames}</div>
      <div className="flex items-end gap-4 self-end px-2">
        <Label className="flex flex-col gap-3">
          <span className="font-semibold"> Sort Games</span>
          <Select
            defaultValue={sort}
            onChange={(val) => setSort(val.target.value as GameStatusBucket)}
            className="rounded text-black outline-none ring-0 h-6 w-20"
          >
            {GAME_STATUSES.map((val, indx) => {
              return (
                <Option key={indx} value={val}>
                  {val}
                </Option>
              );
            })}
          </Select>
        </Label>
        <DatePicker
          date={date}
          setDate={setDateWrapper}
          label="Search for games by date"
        ></DatePicker>
      </div>
      {screenSize.width < 800 ? (
        <ScrollArea>
          <Table>
            <TableBody>
              <div className="flex flex-wrap justify-center">
                {gamesMiniScreen}
              </div>
            </TableBody>
          </Table>
        </ScrollArea>
      ) : (
        <ScrollArea>
          <div className="grid gap-4 p-2 bg-gray-800 sm:grid-cols-2 lg:grid-cols-3">
            {games}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
