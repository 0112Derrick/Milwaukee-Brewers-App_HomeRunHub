import React, { useEffect, useRef, useState } from "react";
import axios, { CancelTokenSource } from "axios";
import TeamCard from "./TeamCard";
import SkeletonCard from "./SkeletonCard";
import { MlbTeamDataI, MlbTeamDataModifiedI } from "src/interfaces";
import { Button } from "src/@/components/ui/button";
import { Card, CardDescription, CardTitle } from "src/@/components/ui/card";
import TitleSection from "./TitleSection";
import { PlayIcon } from "@radix-ui/react-icons";
import TeamsFilterSearchBar from "./TeamsFilterSearchBar";
import TeamFilterRadioButtons from "./TeamFilterRadioButtons";
import { mlbTeamsDetails } from "src/data/teamData";

const useTeams = (initialStart = 0) => {
  const [teams, setTeams] = useState<MlbTeamDataModifiedI[]>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [start, setStart] = useState<number>(initialStart);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const itemsPerPage = 9;

  const api = axios.create();

  let cancelRequest: CancelTokenSource | null = null;

  const fetchTeams = async (
    newStart: number = 0,
    searchTerm: string = "",
    filterDivision: string = "any",
    filterLeague: string = "any"
  ) => {
    setLoading(true);

    // Cancel the previous request before making a new request
    if (cancelRequest) {
      cancelRequest.cancel("Operation canceled due to new request.");
    }

    // Create a new CancelToken
    cancelRequest = axios.CancelToken.source();

    try {
      console.log(
        `Search term: ${searchTerm} | Division: ${filterDivision} | League: ${filterLeague}`
      );

      const serverIpAddress = "";
      const localhost = "http://localhost:8080";
      const defaultAddress = serverIpAddress || localhost;

      let params = `start=${newStart}&limit=${itemsPerPage}`;

      if (Number.isInteger(parseInt(searchTerm))) {
        params += `&id=${searchTerm}`;
      } else if (searchTerm) {
        params += `&name=${searchTerm}`;
      }

      if (filterLeague && filterLeague !== "any") {
        params += `&league=${filterLeague}`;
      }

      if (filterDivision && filterDivision !== "any") {
        params += `&division=${filterDivision}`;
      }

      const endpoint = `${defaultAddress}/teams?${params}`;

      console.log("Endpoint: " + endpoint);
      const response = await api.get(endpoint, {
        cancelToken: cancelRequest.token, // Pass the cancel token to the request
      });

      if (!response.data.error) {
        console.log(response.data);
        for (
          let i = 0;
          i < (response.data.teams as MlbTeamDataI[]).length;
          i++
        ) {
          let team = response.data.teams[i] as MlbTeamDataModifiedI;

          let color = mlbTeamsDetails.find(
            (mlbTeam) => team.name.toLowerCase() === mlbTeam.team.toLowerCase()
          )?.color;

          if (color) team.color = color;
        }

        setTeams(response.data.teams);
      } else {
        throw new Error(
          response.data.error +
            " Valid options:" +
            (response.data.options as string[]).toString()
        );
      }

      // Only update the start if there's no search term, to avoid changing the pagination when searching.
      if (!searchTerm) {
        setStart(newStart);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request canceled:", error.message);
      } else {
        console.log("Error: ", error);
        setError(error);
      }
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  useEffect(() => {
    fetchTeams(0);

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes in the media query's evaluation result
    const handler = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addListener(handler);

    // Cleanup function to remove the event listener
    return () => mediaQuery.removeListener(handler);
    //eslint-disable-next-line
  }, []);

  return {
    teams,
    loading,
    error,
    fetchTeams,
    start,
    setStart,
    itemsPerPage,
    prefersReducedMotion,
  };
};

const MainContent = () => {
  const {
    teams,
    loading,
    error,
    fetchTeams,
    start,
    itemsPerPage,
    prefersReducedMotion,
  } = useTeams();
  const [searchTerm, setSearchTerm] = useState("");
  const [league, setLeague] = useState("any");
  const [division, setDivision] = useState("any");
  const teamSection = useRef(null);
  const video = useRef<HTMLVideoElement>(null);
  let timerId: string | number | NodeJS.Timeout | null | undefined = null;
  let videoUnmuted = false;

  // Handler for search input change
  const handleSearchChange = (event: any) => {
    setSearchTerm(event.target.value);
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => fetchTeams(0, event.target.value), 500);
  };

  // Handler for search submit
  const handleSearchSubmit = (event: any) => {
    event.preventDefault();
    fetchTeams(0, searchTerm); // Start from the first page with the search term
  };

  const handleFilterChange = (event: any) => {
    const { name, value } = event.target;
    if (name === "league") {
      setLeague(value);
    } else if (name === "division") {
      setDivision(value);
    }
    fetchTeams(
      0,
      searchTerm,
      name === "division" ? value : division,
      name === "league" ? value : league
    );
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    fetchTeams(Math.max(0, start - itemsPerPage), searchTerm, division, league); // Decrease start by 10, not going below 0
  };

  const handleNextPage = () => {
    fetchTeams(start + itemsPerPage, searchTerm, division, league); // Increase start by 10
  };

  const videoSrc =
    process.env.PUBLIC_URL + "/videos/DreamWithNoLimits-2024OpeningDaySpot.mp4";
  const reducedMotionWorldCupImgSrc =
    process.env.PUBLIC_URL + "/images/baseballAbstractArt3.webp";

  if (loading) {
    return (
      <div className="p-4 px-8 flex flex-col flex-grow overflow-hidden">
        <TitleSection></TitleSection>
        <div className="p-4 px-8 flex flex-col flex-grow items-center justify-center">
          <div className="aspect-video w-2/3 bg-black rounded-md mb-4 flex items-center justify-center">
            <PlayIcon className="scale-150"></PlayIcon>
          </div>
        </div>
        <div className="flex items-center justify-center pb-8">
          <h2 className="text-4xl text-neutral-200">
            Find Your Favorite Teams
          </h2>
        </div>
        <TeamsFilterSearchBar
          handleSearchSubmit={handleSearchSubmit}
          handleSearchChange={handleSearchChange}
          searchTerm={searchTerm}
        ></TeamsFilterSearchBar>

        <TeamFilterRadioButtons
          league={league}
          division={division}
          handleFilterChange={handleFilterChange}
        ></TeamFilterRadioButtons>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center gap-4">
          <SkeletonCard></SkeletonCard>
          <SkeletonCard></SkeletonCard>
          <SkeletonCard></SkeletonCard>
          <SkeletonCard></SkeletonCard>
          <SkeletonCard></SkeletonCard>
          <SkeletonCard></SkeletonCard>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 px-8 flex flex-col flex-grow">
        <TitleSection></TitleSection>

        <div className="flex items-center justify-center pb-8">
          <h2 className="text-4xl text-neutral-200">
            Find Your Favorite Teams
          </h2>
        </div>

        <TeamsFilterSearchBar
          handleSearchSubmit={handleSearchSubmit}
          handleSearchChange={handleSearchChange}
          searchTerm={searchTerm}
        ></TeamsFilterSearchBar>

        <TeamFilterRadioButtons
          league={league}
          division={division}
          handleFilterChange={handleFilterChange}
        ></TeamFilterRadioButtons>

        <div className="flex flex-col flex-grow items-center justify-center text-red-600 text-xl font-bold">
          <Card className="p-6 text-xl sm:text-2xl border-2 border-red-600">
            <CardTitle>
              Sorry an error occurred while fetching the teams
            </CardTitle>{" "}
            <CardDescription className="text-slate-950 pt-2 text-lg sm:text-xl">
              Error that occurred: <br></br>
              <span className="text-red-600 pb-1"> {error.message}</span>
              <br></br>
              <span className="font-bold text-slate-950 pb-2">
                Steps to resolve the error:
              </span>
              <br></br>Try refreshing the page.<br></br>If the error persist
              contact us at homerunhub@fakeemail.com
            </CardDescription>
          </Card>
        </div>

        <div className="flex justify-between mt-4">
          <Button
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover:shadow-lg"
            onClick={handlePreviousPage}
            disabled={start === 0}
          >
            Previous
          </Button>
          <Button
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover:shadow-lg"
            onClick={handleNextPage}
            disabled={teams.length < itemsPerPage || start >= 30}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 px-8 flex flex-col flex-grow">
      <TitleSection forwardRef={teamSection}></TitleSection>

      <div className="p-4 px-8 flex flex-col flex-grow items-center justify-center">
        {!prefersReducedMotion ? (
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
            className="rounded-md min-w-[150px] max-w-[80%] scale-150 px-4 sm:scale-100 sm:mt-12 sm:max-w-[80%]"
          >
            <source src={videoSrc} type="video/mp4"></source>
            Your Browser does not support video tag.
          </video>
        ) : (
          <img
            src={reducedMotionWorldCupImgSrc}
            alt="Baseball World Cup"
            className="aspect-square max-w-[50%] rounded-full"
          ></img>
        )}
      </div>

      <div
        className="flex items-center justify-center pb-8 mt-20"
        ref={teamSection}
      >
        <h2 className="text-4xl text-neutral-200">Find Your Favorite Teams</h2>
      </div>

      <TeamsFilterSearchBar
        handleSearchSubmit={handleSearchSubmit}
        handleSearchChange={handleSearchChange}
        searchTerm={searchTerm}
      ></TeamsFilterSearchBar>

      <TeamFilterRadioButtons
        league={league}
        division={division}
        handleFilterChange={handleFilterChange}
      ></TeamFilterRadioButtons>

      {teams.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              teamName={team.name}
              description={team.league}
              imageUrl={team.logo}
              id={team.id}
              teamColor={team.color}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-grow h-full">No teams found.</div>
      )}
      <div className="flex justify-between mt-4">
        <Button
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover:shadow-lg"
          onClick={handlePreviousPage}
          disabled={start === 0}
        >
          Previous
        </Button>
        <Button
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover:shadow-lg"
          onClick={handleNextPage}
          disabled={teams.length < itemsPerPage || start >= 30}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default MainContent;
