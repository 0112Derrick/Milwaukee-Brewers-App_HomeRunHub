import axios from "axios";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "src/@/components/ui/button";
import { Skeleton } from "src/@/components/ui/skeleton";
import { ScheduleResponse } from "src/interfaces";
import ErrorPage from "./ErrorPage";
import { Card, CardContent, CardHeader } from "src/@/components/ui/card";
import { Boxscore } from "src/components/Boxscore";

export function LiveGames() {
  const [gamesData, setGamesData] = useState<ScheduleResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancel: ReturnType<typeof axios.CancelToken.source> | null =
      axios.CancelToken.source();

    const fetchSchedule = async () => {
      setLoading(true);

      try {
        const serverIpAddress = ""; //NOTE -  Placeholder for server IP address.
        const localhost = "http://localhost:8080/";

        //Fallback to localhost if needed
        const defaultAddress = serverIpAddress || localhost;

        let endpoint = `${defaultAddress}`;

        endpoint += `mlb/schedule`;
        const today = new Date().toLocaleDateString("en-CA");

        const { data } = await axios.post<ScheduleResponse>(
          endpoint,
          {
            startDt: today,
            endDt: today,
          },
          {
            cancelToken: cancel!.token,
          }
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
  }, []);

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
      return <div>No games</div>;
    }
    //console.table(currentDayGames);
    const games = currentDayGames.games.map((game) => {
      // console.table(game.teams);

      return (
        <Link
          to={`/feed/${game.gamePk}/${game.teams.home.team.id}/${game.teams.away.team.id}`}
          key={`${game.gamePk}`}
        >
          <Card className="h-fit aspect-video py-8 overflow-x-auto overflow-y-hidden hover:border-4 hover:shadow-md hover: border-blue-400">
            <CardHeader>
              <div>
                {game.teams.home.team.name} vs. {game.teams.away.team.name}
              </div>
              <div className="text-sm text-muted-foreground flex flex-col">
                <span>
                  Start time: {new Date(game.gameDate).toLocaleString()}
                </span>
                <span>
                  Status: {game.status.detailedState} | Location:{" "}
                  {game.venue.name}
                </span>
                <span></span>
              </div>
            </CardHeader>
            {
              <CardContent>
                <Boxscore gamePk={game.gamePk}></Boxscore>
              </CardContent>
            }
          </Card>
        </Link>
      );
    });

    return (
      <div className="flex flex-col gap-4 w-full h-[80vh] mt-20 overflow-hidden">
        <div className="px-2 italic">
          Games today: {currentDayGames.totalGames}
        </div>
        <div className="flex flex-wrap w-full h-full items-center justify-evenly gap-4 overflow-auto">
          {games}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-grow items-center justify-center">
      Something went wrong. No data was found.
    </div>
  );
}
