import React, { useEffect, useState } from "react";
import axios from "axios";
import { MlbTeamDataI } from "src/interfaces";
import { useParams } from "react-router-dom";
import { Card } from "src/@/components/ui/card";
import { Button } from "src/@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MlbTeamDataModifiedI } from "src/interfaces";
import { mlbTeamsDetails } from "src/data/teamData";

function TeamPage() {
  const { id } = useParams();
  const [team, setTeam] = useState<MlbTeamDataModifiedI | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();

    const fetchTeam = async () => {
      setLoading(true);

      console.log("ID:" + id);
      try {
        const serverIpAddress = "";
        const localhost = "http://localhost:8080";

        const defaultAddress = serverIpAddress || localhost; // Fallback to localhost if needed
        const endpoint = `${defaultAddress}/teams?id=${id}`;
        const response = await axios.get(endpoint, {
          cancelToken: cancelTokenSource.token,
        });

        if (response.data && response.data.teams) {
          const team = response.data.teams[0] as MlbTeamDataI;

          let additionalTeamDetails = mlbTeamsDetails.find(
            (mlbTeam) => mlbTeam.team.toLowerCase() === team.name.toLowerCase()
          );
          console.log("Team data:" + additionalTeamDetails);
          if (!additionalTeamDetails) return;

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
        }, 500);
      }
    };

    fetchTeam();

    // Cleanup function to cancel the request if component unmounts
    return () => {
      cancelTokenSource.cancel("Component unmounted");
    };
  }, [id]); // Depend on `id` to refetch if it changes

  if (loading) {
    return <div className="flex flex-grow p-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500 flex items-center justify-center flex-grow">
        Error: {error.message || "An error occurred"}
      </div>
    );
  }

  if (team) {
    return (
      <div className="flex flex-grow w-full h-full mt-24 items-center justify-center">
        <Card className="flex items-center flex-wrap justify-evenly h-fit p-4 border-0 md:border-2 sm:p-24 gap-12 space-y-4 bg-inherit rounded-md">
          <div className="flex flex-col gap-4">
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
          <div className="flex flex-col items-center bg-gray-800 text-white text-center p-8 rounded-lg shadow-lg">
            <h1 className="text-4xl sm:text-3xl py-4">
              <span className="text-blue-500">{team.name}</span>, affectionately
              known as <span className="shadow-md bg-white  rounded-md p-1" style={{ color: team.color, boxShadow:`${team.color} 1px 1px 3px`}}>{team.nickname}</span>
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
                className="text-lg bg-blue-600 hover:bg-blue-700 shadow-md shadow-black text-white font-bold py-2 px-4 rounded-full"
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
