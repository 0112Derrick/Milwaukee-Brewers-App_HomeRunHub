import React, { useEffect, useState } from "react";
import axios from "axios";
import { MlbTeamDataI } from "src/interfaces";
import { useParams } from "react-router-dom";
import { Card } from "src/@/components/ui/card";
import { Button } from "src/@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MlbTeamDataModifiedI } from "src/interfaces";
import { mlbTeamsDetails } from "src/data/teamData";
import ErrorPage from "./ErrorPage";
import { Skeleton } from "src/@/components/ui/skeleton";

// Defines a React component that displays a detailed page for a specific MLB team.
function TeamPage() {
  const { id } = useParams(); // Retrieves 'id' from the URL parameters.
  const [team, setTeam] = useState<MlbTeamDataModifiedI | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const navigate = useNavigate(); // Hook to programmatically navigate between routes.

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source(); // Creates a source to cancel the request if needed (e.g., component unmounting).

    const fetchTeam = async () => {
      setLoading(true);

      console.log("ID:" + id);
      try {
        const serverIpAddress = ""; //NOTE -  Placeholder for server IP address.
        const localhost = "http://localhost:8080";

        const defaultAddress = serverIpAddress || localhost; // Fallback to localhost if needed
        const endpoint = `${defaultAddress}/teams?id=${id}`;

        const response = await axios.get(endpoint, {
          cancelToken: cancelTokenSource.token, // Passes cancel token to axios request.
        });

        if (response.data && response.data.teams) {
          const team = response.data.teams[0] as MlbTeamDataI;

          // Adds in additional team data from /data/teamData this adds in info about world series won and hall of fame players that was not provided with the brewers api.
          let additionalTeamDetails = mlbTeamsDetails.find(
            (mlbTeam) => mlbTeam.team.toLowerCase() === team.name.toLowerCase()
          );

          console.log("Team data:" + additionalTeamDetails);

          if (!additionalTeamDetails)
            throw new Error(
              "Could not find additional team data. Please contact support."
            );

          let modifiedTeam = { ...team, ...additionalTeamDetails };
          setTeam(modifiedTeam);
        } else {
          throw new Error("No data returned");
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

    fetchTeam();

    // Cleanup function to cancel the request if component unmounts
    return () => {
      cancelTokenSource.cancel("Component unmounted");
    };
  }, [id]); // Effect depends on `id` to refetch data if it changes.

  // Render logic based on the state of the data fetching.
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

  

  if (team) {
    // Render the team data using a styled Card component.
    return (
      <div className="flex flex-grow w-full h-full mt-24 items-center justify-center">
        <Card className="flex items-center flex-wrap justify-evenly gap-8 sm:gap-12 h-fit px-2 py-8 sm:p-24 border-0 md:border-2 space-y-4 bg-inherit rounded-md">
          <div className="flex flex-col gap-8">
            <Button
              variant={"outline"}
              className="bg-blue-500 hover:bg-blue-600 text-lg text-white hover:text-white"
              onClick={() => {
                navigate("/");
              }}
            >
              Back to home
            </Button>
            <img
              src={team.logo}
              alt={`${team.name} Logo`}
              className="w-28 h-28 sm:w-48 sm:h-48 object-contain"
            />
          </div>
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
                  Founded in {team.founded}, our team has a rich history with{" "}
                  <strong>{team.hallOfFamePlayers}</strong> Hall of Fame
                  players.
                </span>
              ) : team.hallOfFamePlayers === 1 ? (
                <span>
                  Founded in {team.founded}, our team has{" "}
                  <strong>{team.hallOfFamePlayers}</strong> Hall of Fame player.
                </span>
              ) : (
                <span>
                  Founded in {team.founded}, our team is building our current{" "}
                  players to be hall of famers.
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
                  While we're still chasing our first World Series title, our
                  passion and determination remain unwavering. Join us as we
                  strive for greatness.
                </span>
              ) : team.worldSeriesTitles >= 5 ? (
                <span>
                  With{" "}
                  <strong>{team.worldSeriesTitles} World Series titles</strong>{" "}
                  under our belt, we're a team with a storied legacy of
                  triumphs. Come experience the excellence.
                </span>
              ) : (
                <span>
                  We've won the World Series{" "}
                  <strong>{team.worldSeriesTitles} times</strong>, a testament
                  to our enduring excellence.
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
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-grow items-center justify-center">
      Unable to find team data.
    </div>
  );
}

export default TeamPage;
