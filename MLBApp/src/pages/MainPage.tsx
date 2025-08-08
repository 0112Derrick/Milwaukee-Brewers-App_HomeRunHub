import { useEffect, useRef, useState } from "react";
import axios, { CancelTokenSource } from "axios";
import TeamCard from "../components/TeamCard";
import SkeletonCard from "../components/SkeletonCard";
import { MlbTeamDataI, MlbTeamDataModifiedI } from "src/interfaces";
import { Button } from "src/@/components/ui/button";
import TitleSection from "../components/TitleSection";
import { PlayIcon } from "@radix-ui/react-icons";
import TeamsFilterSearchBar from "../components/TeamsFilterSearchBar";
import TeamFilterRadioButtons from "../components/TeamFilterRadioButtons";
import { mlbTeamsDetails } from "src/data/teamData";
import ErrorPage from "./ErrorPage";
import Dompurify from "dompurify";

// Custom React hook for managing and fetching team data.
const useTeams = (initialStart = 0) => {
  const [teams, setTeams] = useState<MlbTeamDataModifiedI[]>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [start, setStart] = useState<number>(initialStart);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false); // State to track user's preference for reduced motion.
  const itemsPerPage = 9; //NOTE -  Number of items to be fetched per page.

  const api = axios.create(); // Instance of axios with default settings.

  let cancelRequest: CancelTokenSource | null = null;

  // Fetch teams from the server.
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

      const serverIpAddress = "/"; //NOTE -  Should be replaced with actual server IP if deployed.
      const localhost = "http://localhost:8080/";
      const defaultAddress = serverIpAddress || localhost;

      // Constructing query parameters based on inputs and pagination.
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

      //NOTE -  Building the endpoint URL with parameters.
      const endpoint = `${defaultAddress}teams?${params}`;

      console.log("Endpoint: " + endpoint);
      const response = await api.get(endpoint, {
        cancelToken: cancelRequest.token, // Pass the cancel token to the request
      });

      // Handle the response: setting teams state or throwing an error if something went wrong.
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

        setTeams(response.data.teams); // Updating the teams state with the fetched data.
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
      // Delay clearing the loading state to provide a better user experience.
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
    mediaQuery.addEventListener("change", handler);

    // Cleanup function to remove the event listener
    return () => mediaQuery.removeEventListener("change", handler);
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
  const maxNumberOfTeams = 30;

  // Delays the fetch operation by 500ms after the user stops typing to avoid excessive API calls (Live search)
  const handleSearchChange = (event: any) => {
    setSearchTerm(event.target.value);
    let sanitizedSearchInput = Dompurify.sanitize(event.target.value);
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => fetchTeams(0, sanitizedSearchInput), 500);
  };

  // Fetches teams when the search form is submitted, ensuring it starts from the first page
  const handleSearchSubmit = (event: any) => {
    event.preventDefault();
    fetchTeams(0, searchTerm); // Start from the first page with the search term
  };

  // Handles league or division filter changes and triggers a fetch with the new filters
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

  // Loads the previous page of teams, ensuring the start index does not go below zero
  const handlePreviousPage = () => {
    fetchTeams(Math.max(0, start - itemsPerPage), searchTerm, division, league);
  };

  // Advances to the next page of teams by increasing the start index by the items per page
  const handleNextPage = () => {
    fetchTeams(start + itemsPerPage, searchTerm, division, league);
  };

  const videoSrc =
    process.env.PUBLIC_URL + "/videos/DreamWithNoLimits-2024OpeningDaySpot.mp4";
  const reducedMotionWorldCupImgSrc =
    process.env.PUBLIC_URL + "/images/baseballAbstractArt3.webp";

  // Conditional rendering based on loading and error states or successful data fetching
  if (loading) {
    /* loading state UI */
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
    /* error state UI */
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

        <ErrorPage pageError={error}></ErrorPage>

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
          disabled={!start}
        >
          Previous
        </Button>

        <Button
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover:shadow-lg"
          onClick={handleNextPage}
          disabled={
            teams.length < itemsPerPage ||
            start + itemsPerPage >= maxNumberOfTeams
          }
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default MainContent;
