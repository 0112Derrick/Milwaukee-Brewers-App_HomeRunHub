import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { MlbGame, Player } from "src/interfaces/interfaces";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "src/@/components/ui/card";
import ErrorPage from "./ErrorPage";
import { Skeleton } from "src/@/components/ui/skeleton";
import { DataTable, RosterTable } from "src/components/Table";
import { columns, gamesColumns } from "src/data/columnDefs";
import { getRosterResp, getTeamResp } from "src/repository/teams";
import {
  getStandingsResp,
  getTeamScheduleResp,
} from "src/repository/schedules";
import {
  MlbTeamDataModifiedI,
  TeamPages,
  TeamRecord,
} from "src/interfaces/teams.types";
import { ScrollArea, ScrollBar } from "src/@/components/ui/scroll-area";
import { TeamLogoName } from "src/components/TeamLogoName";
import { teamLogoUrl } from "src/utils/utils";
import { mlbTeamsDetails } from "src/data/teamData";
import { Button } from "src/@/components/ui/button";
import { SeasonPicker } from "src/components/SeasonPicker";

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const [team, setTeam] = useState<MlbTeamDataModifiedI | null>(null);
  const [divisionData, setDivisionData] = useState<TeamRecord[]>([]);
  const [rosterData, setRosterData] = useState<Player[]>([]);
  const [games, setGames] = useState<MlbGame[]>([]);

  const teamId = useMemo(() => Number(id ?? 0), [id]);
  const logo = useMemo(() => teamLogoUrl(teamId), [teamId]);

  const navigate = useNavigate();

  useEffect(() => {
    setPage(parsedPage);
  }, [parsedPage]);

  useEffect(() => {
    setSeason(parsedSeason);
    setInputSeason(parsedSeason);
  }, [parsedSeason]);

  useEffect(() => {
    const ac = new AbortController();
    navigate(`/teams/${teamId}/${season}/${page}`, {
      replace: true,
    });

    const getTeamData = async () => {
      const response = await getTeamResp(ac, teamId); // ✅ use derived teamId
      if (!response) return;

      if (response.data?.teams?.length) {
        const team = response.data.teams[0];
        const extra = mlbTeamsDetails.find(
          (t) => t.team.toLowerCase() === team.name.toLowerCase()
        );
        if (!extra) throw new Error("Could not find additional team data.");
        setTeam({ ...team, ...extra });
        setError(null);
      } else {
        throw new Error("No data returned");
      }
    };

    const fetchTeam = async () => {
      setLoading(true);

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

  const InnerNav = () => {
    return (
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-3 py-2">
          {/* Season chip */}
          <SeasonPicker season={season} setSeason={setSeason}></SeasonPicker>
          {/* Pills */}
          <ScrollArea className="w-[70%]">
            <div className="flex gap-2">
              {[
                ["Description", TeamPages.Description],
                ["Standings", TeamPages.Standings],
                ["Schedule", TeamPages.Schedule],
                ["Roster", TeamPages.Roster],
              ].map(([label, val]) => (
                <Button
                  key={label}
                  variant={page === val ? "default" : "outline"}
                  size="sm"
                  disabled={page === val}
                  className={`rounded-full bg-blue-400 border-blue-300 hover:shadow-md`}
                  onClick={() => navigate(`/teams/${teamId}/${season}/${val}`)}
                >
                  {label}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
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
        <div className="flex items-center justify-center flex-wrap sm:flex-wrap lg:flex-nowrap border border-white w-3/4 h-fit rounded  gap-8 p-8 min-h-[80%]">
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
          <div className="w-full self-end flex flex-col h-fit">
            <InnerNav></InnerNav>
          </div>
          <Card className="flex items-center flex-wrap justify-evenly flex-1 p-4 gap-4 border-0 sm:border-0 sm:gap-12 sm:p-24 md:w-4/5 md:p-4 lg:border-2 bg-inherit rounded-md">
            <CardContent className="flex flex-wrap gap-8 items-center justify-center sm:items-center ">
              <img
                src={team.logo}
                alt={`${team.name} Logo`}
                className="w-20 aspect-square sm:w-20 md:w-28 object-contain"
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
        <div className="flex-1 flex flex-col gap-4">
          <InnerNav></InnerNav>
          <ScrollArea className="h-full flex flex-col bg-slate-50">
            <div className="w-full flex flex-col flex-1 items-center">
              <Card className="flex-1 flex flex-col md:w-full lg:w-3/4 border-b-0 overflow-hidden rounded-none">
                <CardHeader className="flex-shrink-0">
                  <span className="font-semibold text-lg text-card-foreground">
                    <TeamLogoName
                      id={teamId}
                      teamName={team.name}
                      logo={logo}
                      isLink={false}
                    />
                  </span>
                </CardHeader>
                <CardContent className="p-0 h-full min-h-0 min-w-full">
                  <DataTable
                    columns={columns}
                    data={divisionData}
                    showDateRange={false}
                  ></DataTable>
                </CardContent>
              </Card>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      );
    }
    if (page == TeamPages.Roster) {
      return (
        <div className="flex-1 flex flex-col w-full min-h-0">
          <InnerNav />
          <ScrollArea className="flex-1 min-h-0 w-full">
            <Card className="flex flex-col h-full w-full rounded-none">
              <CardHeader className="flex-shrink-0">
                <span className="font-semibold text-lg text-card-foreground">
                  <TeamLogoName
                    id={teamId}
                    teamName={team.name}
                    logo={logo}
                    isLink={false}
                  />
                </span>
              </CardHeader>
              <CardContent className="p-0 h-full min-h-0 min-w-full">
                <RosterTable data={rosterData} />
              </CardContent>
            </Card>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      );
    }
    if (page == TeamPages.Schedule) {
      return (
        <div className="flex-1 flex flex-col gap-4">
          <InnerNav></InnerNav>
          <ScrollArea>
            <div className="w-full flex flex-col flex-1 items-center bg-slate-50">
              <Card className="flex-1 flex flex-col md:w-full lg:w-3/4 border-b-0 overflow-hidden rounded-none">
                <CardHeader className="flex-shrink-0">
                  <span className="font-semibold text-lg text-card-foreground">
                    <TeamLogoName
                      id={teamId}
                      teamName={team.name}
                      logo={logo}
                      isLink={false}
                    />
                  </span>
                </CardHeader>
                <CardContent className="p-0 h-full min-h-0 min-w-full">
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
                </CardContent>
              </Card>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
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
