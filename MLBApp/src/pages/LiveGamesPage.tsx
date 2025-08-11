import axios from "axios";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "src/@/components/ui/button";
import { Skeleton } from "src/@/components/ui/skeleton";
import { ScheduleResponse, THREE_MINUTES } from "src/interfaces";
import ErrorPage from "./ErrorPage";
import { Boxscore } from "src/components/Boxscore";
import useScreenSize from "src/hooks/useScreenSize";
import { Table, TableBody } from "src/@/components/ui/table";
import { teamLogoUrl } from "src/utils";
import DatePicker from "src/components/DatePicker";
import { PlayCircle } from "lucide-react";
import { GameCard } from "src/components/GameCard";

export function LiveGames() {
  const [gamesData, setGamesData] = useState<ScheduleResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [date, setDate] = useState<Date>(new Date());

  const navigate = useNavigate();
  const screenSize = useScreenSize();

  useEffect(() => {
    const ac = new AbortController();

    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const serverIpAddress = ""; //NOTE -  Placeholder for server IP address.
        const localhost = "http://localhost:8080/";

        //Fallback to localhost if needed
        const defaultAddress = serverIpAddress || localhost;

        let endpoint = `${defaultAddress}`;

        endpoint += `mlb/schedule`;
        const currentDate = date.toLocaleDateString("en-CA");

        const { data } = await axios.post<ScheduleResponse>(
          endpoint,
          {
            startDt: currentDate,
            endDt: currentDate,
          },
          { signal: ac.signal }
        );

        setGamesData(data);
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

  const setDateWrapper = (arg: string | undefined | Date) => {
    if (arg) setDate(new Date(arg));
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

  if (gamesData) {
    const currentDayGames = gamesData.dates.find(
      (games) => new Date(games.date) <= new Date()
    );

    if (!currentDayGames) {
      return (
        <div className="flex flex-col flex-grow">
          <div className="w-full self-end">
            <DatePicker date={date} setDate={setDateWrapper}></DatePicker>
          </div>
          No games
        </div>
      );
    }
    const games = currentDayGames.games.map((game) => {
      return (
        <Link
          to={`/games/${game.gameDate.split("T")[0]}/${game.gamePk}`}
          key={`${game.gamePk}`}
        >
          <GameCard game={game}>
            <Boxscore
              gamePk={game.gamePk}
              homeAbbr={game.teams.home.team.name}
              awayAbbr={game.teams.away.team.name}
            />
          </GameCard>
        </Link>
      );
    });

    const gamesMiniScreen = currentDayGames.games.map((game) => {
      const awayLogo = teamLogoUrl(game.teams.away.team.id);
      const homeLogo = teamLogoUrl(game.teams.home.team.id);

      const awayAbbr =
        game.teams.away.team.name.split(" ")[1] ??
        game.teams.away.team.name.split(" ")[0];
      const homeAbbr =
        game.teams.home.team.name.split(" ")[1] ??
        game.teams.home.team.name.split(" ")[0];

      const gameHref = `/games/${game.gameDate.split("T")[0]}/${game.gamePk}`;
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
              <div>{game.teams.away.score ?? "-"}</div>

              <div className="flex justify-self-start gap-2 items-center">
                <img
                  src={homeLogo}
                  alt={`${homeAbbr} logo`}
                  className="h-8 w-8"
                />
                <p>{homeAbbr}</p>
              </div>
              <div>{game.teams.home.score ?? "-"}</div>
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
      <div className="flex flex-col gap-4 flex-grow w-full h-[80vh] overflow-hidden mt-24 sm:mt-24 md:mt-24 lg:mt-20">
        <div className="px-2 italic">
          Games today: {currentDayGames.totalGames} | In-progress:{" "}
          {currentDayGames.totalGamesInProgress} | {"Games ended: "}
          {
            currentDayGames.games.filter((game) =>
              game.status.detailedState.toLowerCase().includes("final")
            ).length
          }
        </div>
        <div className="self-end px-2">
          <DatePicker date={date} setDate={setDateWrapper}></DatePicker>
        </div>
        {screenSize.width < 768 ? (
          <div className="w-full overflow-auto">
            <Table>
              <TableBody>
                <div className="flex flex-wrap justify-center">
                  {gamesMiniScreen}
                </div>
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid gap-4 p-4 bg-gray-800 sm:grid-cols-2 lg:grid-cols-3 overflow-auto">
            {games}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-grow items-center justify-center">
      Something went wrong. No data was found.
    </div>
  );
}
