import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { MlbGame, Player } from "src/interfaces/interfaces";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "src/@/components/ui/card";
import ErrorPage from "./ErrorPage";
import { Skeleton } from "src/@/components/ui/skeleton";
import { DataTable, RosterTable } from "src/components/Table";
import { columns, gamesColumns } from "src/data/columnDefs";
import { getRosterResp, getTeamsResp } from "src/repository/teams";
import {
  getStandingsResp,
  getTeamScheduleResp,
} from "src/repository/schedules";
import {
  MlbTeamDataModifiedI,
  TeamPages,
  TeamRecord,
} from "src/interfaces/teams.types";
import { ScrollArea } from "src/@/components/ui/scroll-area";
import { Label } from "src/@/components/ui/label";
import { useDebounce } from "src/hooks/debouncing";
import { TeamLogoName } from "src/components/TeamLogoName";
import { teamLogoUrl } from "src/utils/utils";
import { mlbTeamsDetails } from "src/data/teamData";

export default function TeamPage() {
  const { id, user_season, user_page } = useParams();

  const today = new Date();
  const defaultSeason = today.getFullYear();

  const pageFromParam = Number(user_page);
  const seasonFromParam = Number(user_season);

  const parsedPage: TeamPages = Number.isFinite(pageFromParam)
    ? (pageFromParam as TeamPages)
    : TeamPages.Description;

  const parsedSeason = Number.isFinite(seasonFromParam)
    ? seasonFromParam
    : defaultSeason;

  const [page, setPage] = useState<TeamPages>(parsedPage);
  const [season, setSeason] = useState<number>(parsedSeason);
  const [inputSeason, setInputSeason] = useState<number>(parsedSeason);
  const debouncedSeason = useDebounce<number>(inputSeason, 500);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const [team, setTeam] = useState<MlbTeamDataModifiedI | null>(null);
  const [divisionData, setDivisionData] = useState<TeamRecord[]>([]);
  const [rosterData, setRosterData] = useState<Player[]>([]);
  const [games, setGames] = useState<MlbGame[]>([]);

  const teamId = useMemo(() => Number(id ?? 0), [id]);
  const logo = useMemo(() => teamLogoUrl(teamId), [teamId]);

  useEffect(() => {
    setPage(parsedPage);
  }, [parsedPage]);

  useEffect(() => {
    setSeason(parsedSeason);
    setInputSeason(parsedSeason);
  }, [parsedSeason]);

  useEffect(() => {
    const ac = new AbortController();

    const getTeamData = async () => {
      const response = await getTeamsResp(ac, teamId); // ✅ use derived teamId
      if (!response) return;

      if (response.data?.teams?.length) {
        const team = response.data.teams[0];
        const extra = mlbTeamsDetails.find(
          (t) => t.team.toLowerCase() === team.name.toLowerCase()
        );
        if (!extra) throw new Error("Could not find additional team data.");
        setTeam({ ...team, ...extra });
      } else {
        throw new Error("No data returned");
      }
    };

    const fetchTeam = async () => {
      setLoading(true);
      // ✅ clear old team so previous name doesn’t render
      setTeam(null);
      try {
        const day = today.getDate().toString().padStart(2, "0");
        const month = (today.getMonth() + 1).toString().padStart(2, "0");
        const dt = `${season}-${month}-${day}`;

        await getTeamData();

        if (page === TeamPages.Standings) {
          const division = 105;
          const resp = await getStandingsResp(ac, dt, division);
          if (!resp || resp.status !== 200)
            throw new Error("Unable to get teams record.");
          setError(null);

          const foundDivision =
            resp.data.records.find((div: any) =>
              div.teamRecords.some((tr: any) => tr.team.id === teamId)
            )?.teamRecords ?? [];
          setDivisionData(foundDivision);
        } else if (page === TeamPages.Roster) {
          const resp = await getRosterResp(ac, teamId, dt);
          if (!resp || resp.status !== 200)
            throw new Error("Unable to get teams record.");
          setError(null);
          setRosterData(resp.data.roster);
        } else if (page === TeamPages.Schedule) {
          const resp = await getTeamScheduleResp(ac, teamId, season);
          if (!resp || resp.status !== 200)
            throw new Error("Unable to get teams record.");
          setError(null);
          const games: MlbGame[] = [];
          resp.data.dates.forEach((d: any) => {
            games.push(...d.games);
          });
          setGames(games);
        }
      } catch (e: any) {
        if (axios.isCancel(e)) setError(null);
        else setError("Unable to load the teams page");
      } finally {
        setTimeout(() => setLoading(false), 750);
      }
    };

    fetchTeam();
    return () => ac.abort();
  }, [teamId, page, season]); // ✅ key by teamId, not id

  useEffect(() => {
    if (debouncedSeason !== season) {
      setSeason(debouncedSeason);
    }
  }, [debouncedSeason, season]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);

    if (!isNaN(val)) {
      setInputSeason(val);
    }
  };

  const InnerNav = () => {
    return (
      <div className="flex flex-shrink items-center justify-end w-full p-4">
        <div className="flex gap-2">
          <div className="flex flex-col gap-3">
            <Label htmlFor="page" className="px-1 font-semibold">
              Page
            </Label>

            <select
              className="ring-0 border-none outline-none text-black w-32 h-6 rounded-md"
              defaultValue={page}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setPage(val);
              }}
            >
              <option value={TeamPages.Description}>Description</option>
              <option value={TeamPages.Standings}>Standings</option>
              <option value={TeamPages.Schedule}>Schedule</option>
              <option value={TeamPages.Roster}>Roster</option>
            </select>
          </div>
          <div
            className={
              page !== TeamPages.Description
                ? "visible text-white"
                : "invisible"
            }
          >
            <div className="flex flex-col gap-3">
              <Label htmlFor="season" className="px-1 font-semibold">
                Season
              </Label>
              <input
                className="ring-0 px-1 border-none outline-none text-black w-32 h-6 rounded-md"
                type="number"
                value={inputSeason}
                onChange={handleInputChange}
              ></input>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center w-full pb-6 overflow-auto">
        <div className="w-full self-end flex flex-col">
          <InnerNav></InnerNav>
        </div>
        <div className="flex items-center justify-center sm:flex-wrap lg:flex-nowrap border border-white w-3/4 h-fit rounded  gap-8 p-8 min-h-[80%]">
          <div>
            <Skeleton className="h-8 w-full p-12 bg-white" />
          </div>
          <div className="bg-gray-800 min-h-fit h-1/2 w-full max-w-[1000px] p-6 rounded">
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
    return (
      <div className="flex flex-col flex-grow w-full overflow-auto">
        <div className="w-full self-end flex flex-col">
          <InnerNav></InnerNav>
        </div>
        <ErrorPage pageError={error}></ErrorPage>
      </div>
    );
  }

  if (team) {
    if (page == TeamPages.Description) {
      return (
        <div className="flex flex-col flex-grow items-center w-full pb-6 overflow-auto">
          <div className="w-full self-end flex flex-col">
            <InnerNav></InnerNav>
          </div>
          <Card className="flex items-center flex-wrap justify-evenly flex-1 p-4 gap-4 border-0 sm:border-0 sm:gap-12 sm:p-24 md:w-4/5 md:p-4 lg:border-2 bg-inherit rounded-md">
            <CardContent className="flex flex-wrap gap-8">
              <img
                src={team.logo}
                alt={`${team.name} Logo`}
                className="w-20 h-20 sm:w-48 sm:h-48 md:h-20 md:w-20 justify-self-center self-center object-contain"
              />

              <div className="flex flex-col items-center bg-gray-800 text-white text-center px-4 py-8 sm:p-8 rounded-lg shadow-lg">
                <h1 className="text-2xl sm:text-4xl py-4">
                  <span
                    className="shadow-md bg-white rounded-md p-1"
                    style={{
                      color: team.color,
                      boxShadow: `${team.color} 1px 1px 3px`,
                    }}
                  >
                    {team.name}
                  </span>
                  <span className="text-xl"> , affectionately known as </span>
                  {team.nickname}
                </h1>
                <p className="text-xl">
                  Proud members of the {team.league} and dominating the{" "}
                  <strong>{team.division} Division.</strong>
                </p>
                <p className="text-lg sm:text-xl py-2">
                  {team.hallOfFamePlayers > 1 ? (
                    <span>
                      Founded in {team.founded}, our team has a rich history
                      with <strong>{team.hallOfFamePlayers}</strong> Hall of
                      Fame players.
                    </span>
                  ) : team.hallOfFamePlayers === 1 ? (
                    <span>
                      Founded in {team.founded}, our team has{" "}
                      <strong>{team.hallOfFamePlayers}</strong> Hall of Fame
                      player.
                    </span>
                  ) : (
                    <span>
                      Founded in {team.founded}, our team is building our
                      current players to be hall of famers.
                    </span>
                  )}
                </p>
                <p className="text-lg sm:text-xl py-2 max-w-[85%]">
                  {team.name === "New York Yankees" ? (
                    <span>
                      With a record{" "}
                      <strong>
                        {team.worldSeriesTitles} World Series victories
                      </strong>
                      , the Yankees stand as a monumental franchise in sports
                      history, epitomizing baseball excellence.
                    </span>
                  ) : team.worldSeriesTitles === 0 ? (
                    <span>
                      While we're still chasing our first World Series title,
                      our passion and determination remain unwavering. Join us
                      as we strive for greatness.
                    </span>
                  ) : team.worldSeriesTitles >= 5 ? (
                    <span>
                      With{" "}
                      <strong>
                        {team.worldSeriesTitles} World Series titles
                      </strong>{" "}
                      under our belt, we're a team with a storied legacy of
                      triumphs. Come experience the excellence.
                    </span>
                  ) : (
                    <span>
                      We've won the World Series{" "}
                      <strong>{team.worldSeriesTitles} times</strong>, a
                      testament to our enduring excellence.
                    </span>
                  )}
                </p>
                <p className="text-lg sm:text-xl py-2">
                  Join us in {team.city}, {team.state} for thrilling games and
                  unforgettable memories.
                </p>
                <div className="mt-8">
                  <a
                    href={`${team.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-lg bg-blue-600 hover:bg-blue-700 shadow-md shadow-black hover:shadow-none text-white font-bold py-2 px-2 sm:px-4 rounded-full"
                  >
                    Learn More About Us
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    if (page == TeamPages.Standings) {
      return (
        <div className="flex-1 flex flex-col flex-grow gap-4">
          <InnerNav></InnerNav>
          <div className="w-full flex flex-col flex-grow items-center bg-slate-50">
            <Card className="flex-1 rounded-none md:w-full lg:w-3/4 border-b-0">
              <CardHeader>
                <span className="font-semibold text-lg text-card-foreground">
                  {team.name}
                </span>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable
                  columns={columns}
                  data={divisionData}
                  showDateRange={false}
                ></DataTable>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
    if (page == TeamPages.Roster) {
      return (
        <div className="flex-1 min-h-0 w-full flex flex-col">
          <InnerNav />
          <div className="flex-1 min-h-0">
            <Card className="h-full flex flex-col overflow-hidden rounded-none">
              <CardHeader className="flex-shrink-0">
                <span className="font-semibold text-lg text-card-foreground">
                  <TeamLogoName id={teamId} teamName={team.name} logo={logo} />
                </span>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 min-w-full overflow-x-hidden p-0">
                <RosterTable data={rosterData} />
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
    if (page == TeamPages.Schedule) {
      return (
        <div className="flex flex-col flex-grow items-center flex-1 gap-4 overflow-hidden">
          <InnerNav></InnerNav>
          <div className="w-full flex-1 flex flex-col flex-grow items-center bg-slate-50 overflow-hidden">
            <Card className="flex-1 rounded-none overflow-y-auto border-b-0 md:w-full lg:w-3/4 ">
              <CardHeader>
                <span className="font-semibold text-lg text-card-foreground">
                  <TeamLogoName id={teamId} teamName={team.name} logo={logo} />
                </span>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto">
                <ScrollArea className="overflow-y-auto">
                  <DataTable
                    columns={gamesColumns}
                    data={games}
                    showDateRange={true}
                    date={
                      new Date(
                        `${season}-${(today.getMonth() + 1)
                          .toString()
                          .padStart(2, "0")}-${today
                          .getDate()
                          .toString()
                          .padStart(2, "0")}`
                      )
                    }
                    dateId="officialDate"
                  ></DataTable>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex flex-col flex-grow w-full overflow-auto">
      <div className="w-full self-end flex flex-col">
        <InnerNav></InnerNav>
      </div>
      <div className="flex flex-grow items-center justify-center">
        Unable to find team data.
      </div>
    </div>
  );
}
