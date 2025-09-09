import { useEffect, useState } from "react";
import TeamCard from "./TeamCard";
import { useDebounce } from "src/hooks/debouncing";
import { MlbTeamDataModifiedI } from "src/interfaces/teams.types";
import axios from "axios";
import DOMPurify from "dompurify";
import TeamsFilterSearchBar from "./TeamsFilterSearchBar";
import TeamFilterRadioButtons from "./TeamFilterRadioButtons";
import { Button } from "src/@/components/ui/button";
import ErrorPage from "src/pages/ErrorPage";
import SkeletonCard from "./SkeletonCard";
import { getTeamsResp } from "src/repository/teams";

export function TeamsContainer({
  teamSectionRef,
}: {
  teamSectionRef: React.RefObject<HTMLDivElement>;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [inputSearch, setInputSearch] = useState("");
  const debouncedSearch = useDebounce<string>(inputSearch, 500);
  const [league, setLeague] = useState("any");
  const [division, setDivision] = useState("any");

  const [teams, setTeams] = useState<MlbTeamDataModifiedI[]>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [start, setStart] = useState<number>(0);

  const itemsPerPage = 9;
  let maxNumberOfTeams = 30;

  const ac = new AbortController();
  // Fetch teams from the server.
  const fetchTeams = async () => {
    setLoading(true);
    const teamSectionDiv = teamSectionRef.current;
    const prevScroll = teamSectionDiv ? teamSectionDiv.scrollTop : 0;

    try {
      const resp = await getTeamsResp(
        ac,
        start,
        itemsPerPage,
        searchTerm,
        league,
        division
      );

      setTeams(resp);

      if (searchTerm) {
        setStart(0);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
      } else {
        console.log("Error: ", error);
        setError(error);
      }
    } finally {
      // Delay clearing the loading state to provide a better user experience.
      setTimeout(() => {
        setLoading(false);
        requestAnimationFrame(() => {
          if (teamSectionRef.current) {
            teamSectionRef.current.scrollTop = prevScroll;
          }
        });
      }, 500);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [searchTerm, start, league, division]);

  // Delays the fetch operation by 500ms after the user stops typing to avoid excessive API calls (Live search)
  useEffect(() => {
    if (debouncedSearch !== searchTerm) {
      setSearchTerm(debouncedSearch);
    }
  }, [debouncedSearch, searchTerm]);

  const handleSearchChange = (e: any) => {
    let sanitizedSearchInput = DOMPurify.sanitize(e.target.value);
    setInputSearch(sanitizedSearchInput);
  };

  // Handles league or division filter changes and triggers a fetch with the new filters
  const handleFilterChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "league") {
      setLeague(value);
    } else if (name === "division") {
      setDivision(value);
    }
  };

  // Loads the previous page of teams, ensuring the start index does not go below zero
  const handlePreviousPage = () => {
    setStart(Math.max(0, start - itemsPerPage));
  };

  // Advances to the next page of teams by increasing the start index by the items per page
  const handleNextPage = () => {
    setStart(start + itemsPerPage);
  };

  const teamsList = teams.map((team) => (
    <TeamCard
      key={team.id}
      teamName={team.name}
      description={team.league}
      imageUrl={team.logo}
      id={team.id}
      teamColor={team.color}
    />
  ));

  if (loading) {
    /* loading state UI */
    return (
      <div>
        <div className="flex-1 min-h-0 flex flex-col py-2 overflow-auto">
          <div className="flex items-center justify-center pb-8 mt-20">
            <h2 className="text-4xl text-neutral-200">
              Find Your Favorite Teams
            </h2>
          </div>

          <TeamsFilterSearchBar
            handleSearchChange={handleSearchChange}
            searchTerm={inputSearch}
          ></TeamsFilterSearchBar>

          <TeamFilterRadioButtons
            league={league}
            division={division}
            handleFilterChange={handleFilterChange}
          ></TeamFilterRadioButtons>

          <div ref={teamSectionRef}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center gap-4">
              <SkeletonCard></SkeletonCard>
              <SkeletonCard></SkeletonCard>
              <SkeletonCard></SkeletonCard>
              <SkeletonCard></SkeletonCard>
              <SkeletonCard></SkeletonCard>
              <SkeletonCard></SkeletonCard>
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <Button
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover:shadow-lg"
            onClick={handlePreviousPage}
            disabled={!start}
          >
            Previous
          </Button>
          <div className="text-muted-foreground">
            Page:{" "}
            {Math.min(
              Math.max(1, Math.floor(start / itemsPerPage) + 1),
              Math.max(1, Math.ceil(maxNumberOfTeams / itemsPerPage))
            )}{" "}
            of {Math.max(1, Math.ceil(maxNumberOfTeams / itemsPerPage))}
          </div>
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
  }

  if (error) {
    /* error state UI */
    return (
      <div className="p-4 px-8 flex flex-col flex-grow">
        <div className="flex items-center justify-center pb-8">
          <h2 className="text-4xl text-neutral-200">
            Find Your Favorite Teams
          </h2>
        </div>
        <TeamsFilterSearchBar
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
    <div>
      <div className="flex-1 min-h-0 flex flex-col py-2 overflow-auto">
        <div
          ref={teamSectionRef}
          className="flex items-center justify-center pb-8 mt-20"
        >
          <h2 className="text-4xl text-neutral-200">
            Find Your Favorite Teams
          </h2>
        </div>

        <TeamsFilterSearchBar
          handleSearchChange={handleSearchChange}
          searchTerm={inputSearch}
        ></TeamsFilterSearchBar>

        <TeamFilterRadioButtons
          league={league}
          division={division}
          handleFilterChange={handleFilterChange}
        ></TeamFilterRadioButtons>

        <div>
          {teams.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 justify-items-center gap-4">
              {teamsList}
            </div>
          ) : (
            <div className="flex flex-grow h-full">No teams found.</div>
          )}
        </div>
      </div>
      <div className="flex justify-between mt-4">
        <Button
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover:shadow-lg"
          onClick={handlePreviousPage}
          disabled={!start}
        >
          Previous
        </Button>

        <div className="text-muted-foreground">
          Page:{" "}
          {Math.min(
            Math.max(1, Math.floor(start / itemsPerPage) + 1),
            Math.max(1, Math.ceil(maxNumberOfTeams / itemsPerPage))
          )}{" "}
          of {Math.max(1, Math.ceil(maxNumberOfTeams / itemsPerPage))}
        </div>

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
}
