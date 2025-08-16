import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "src/@/components/ui/card";
import { Badge } from "src/@/components/ui/badge";
import { StandingsResponseV2 } from "src/interfaces/interfaces";
import { Spinner } from "src/components/Spinner";
import { Link } from "react-router-dom";
import { api } from "src/utils";
import { ScrollArea } from "src/@/components/ui/scroll-area";

const StandingsPage: React.FC = () => {
  const [standings, setStandings] = useState<StandingsResponseV2 | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [division, setDivision] = useState<number>(105);

  const ac = new AbortController();

  const fetchStandings = async () => {
    setLoading(true);

    // Create a new CancelToken
    const endpoint = `mlb/standings`;

    try {
      const response = await api.post(
        endpoint,
        {
          leagueId: division,
          seasonDt: new Date().toISOString().split("T")[0],
        },
        { signal: ac.signal }
      );

      if (response.status !== 200)
        throw new Error(`Fetch error: ${response.statusText}`);
      const data: StandingsResponseV2 = await response.data;

      setStandings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 450);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchStandings();
    }, 300);
    return () => clearTimeout(timeout);
  }, [division]);

  if (loading)
    return (
      <div className="flex flex-col flex-grow h-full w-full items-center justify-center p-4">
        <Spinner />
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col items-center justify-center flex-grow">
        <p className="text-red-500">{error}</p>
      </div>
    );
  if (!standings) return null;

  return (
    <ScrollArea>
      <div className="p-4 space-y-8 flex flex-col flex-grow overflow-auto bg-inherit">
        <h1 className="text-2xl font-bold">MLB Standings</h1>
        <div className="flex justify-end text-black">
          <select
            defaultValue={division}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setDivision(val);
            }}
          >
            <option value={105}>All</option>
            <option value={103}>American league</option>
            <option value={104}>National league</option>
          </select>
        </div>
        {standings.records.map((division) => (
          <Card
            key={division.division.id}
            className="bg-gradient-to-b from-slate-300/50 to-slate-400/45 mix-blend-hard-light"
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-black">
                <span>
                  {division.division.id
                    ? standings.divisions.find(
                        (d) => d.id === division.division.id
                      )?.name
                    : ""}
                </span>
                <Badge>{division.standingsType}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {division.teamRecords.map((team) => (
                  <Link to={`/teams/${team.team.id}`}>
                    <Card
                      key={team.team.id}
                      className="bg-gradient-to-br from-slate-100 to-slate-400/20 mix-blend-hard-light hover:ring-2 hover:ring-blue-900/35 hover:shadow-lg"
                    >
                      <CardHeader>
                        <CardTitle>{team.team.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Rank: {team.divisionRank}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <p>
                          W: {team.wins} - L: {team.losses}
                        </p>
                        <p>GB: {team.gamesBack}</p>
                        <p>
                          RD:{" "}
                          {team.runDifferential >= 0
                            ? `+${team.runDifferential}`
                            : team.runDifferential}
                        </p>
                        <p>Streak: {team.streak.streakCode}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default StandingsPage;
