import axios from "axios";
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "src/@/components/ui/button";
import { Skeleton } from "src/@/components/ui/skeleton";
import {
  GAME_STATUSES,
  GameStatusBucket,
  MlbGame,
  THREE_MINUTES,
} from "src/interfaces/interfaces";
import ErrorPage from "./ErrorPage";
import { Boxscore } from "src/components/Boxscore";
import {
  api,
  formatYMDLocal,
  mlbGameStatus,
  parseYMDLocal,
  sortGamesArr,
} from "src/utils/utils";
import DatePicker from "src/components/DatePicker";
import { GameCard } from "src/components/GameCard";
import { ScrollArea } from "src/@/components/ui/scroll-area";
import { isDate } from "date-fns";
import { Option, Select } from "react-day-picker";
import { Label } from "src/@/components/ui/label";
import { ScheduleResponse } from "src/interfaces/teams.types";
import { MiniGameCard } from "src/components/MiniGameCard";

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
          //  console.log("Request canceled:", error.message);
        } else {
          // console.error("Error fetching team:", error);
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
  
  const gamesMiniScreen = sortedGames.map((game, indx) => {
    return (
      <MiniGameCard game={game} key={"miniGameCard_" + indx}></MiniGameCard>
    );
  });

  return (
    <div className="flex flex-col gap-2 flex-grow w-full h-[80vh] overflow-hidden">
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

      <ScrollArea>
        <div className="flex flex-col md:items-center bg-slate-50">
          <div className="grid shadow-lg md:grid-cols-1 lg:grid-cols-2 md:w-full md:max-w-[400px] lg:max-w-full lg:w-3/4">
            {gamesMiniScreen}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
