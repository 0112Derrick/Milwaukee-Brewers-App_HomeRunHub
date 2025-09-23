import { useEffect, useState } from "react";
import TeamCard from "./TeamCard";
import { useDebounce } from "src/hooks/debouncing";
import { MlbTeamDataModifiedI } from "src/interfaces/teams.types";
import axios from "axios";
import DOMPurify from "dompurify";
import TeamsFilterSearchBar from "./TeamsFilterSearchBar";
import LeagueAndDivisionFilterInputs from "./TeamFilterRadioButtons";
import { Button } from "src/@/components/ui/button";
import ErrorPage from "src/pages/ErrorPage";
import SkeletonCard from "./SkeletonCard";
import { getTeamsResp } from "src/repository/teams";
import { Division, League } from "src/interfaces/interfaces";
import { Label } from "src/@/components/ui/label";

export function TeamsContainer({
  teamSectionRef,
}: {
  teamSectionRef: React.RefObject<HTMLDivElement>;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [inputSearch, setInputSearch] = useState("");
  const [inputItemsPerPage, setInputItemsPerPage] = useState<
    number | undefined
  >(9);
  const debouncedSearch = useDebounce<string>(inputSearch, 500);
  const debouncedItemsPerPage = useDebounce<number>(
    inputItemsPerPage ?? 9,
    500
  );
  const [league, setLeague] = useState<League>(League.ANY);
  const [division, setDivision] = useState<Division>(Division.ANY);

  const [teams, setTeams] = useState<MlbTeamDataModifiedI[]>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [start, setStart] = useState<number>(0);
  const [maxNumberOfTeams, setMaxNumberOfTeams] = useState<number>(30);
  const [itemsPerPage, setItemsPerPage] = useState<number>(9);

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

      setTeams(resp.teams);
      setMaxNumberOfTeams(resp.totalTeams);

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
    if (league !== League.ANY || division !== Division.ANY) setStart(0);
    fetchTeams();
  }, [division, league]);

  useEffect(() => {
    if (debouncedItemsPerPage && debouncedItemsPerPage > 0) {
      const currentPage = Math.floor(start / itemsPerPage);
      const newItemsPerPage = debouncedItemsPerPage;

      setItemsPerPage(newItemsPerPage);

      const newStart = currentPage * newItemsPerPage;
      setStart(Math.min(newStart, maxNumberOfTeams - newItemsPerPage));
    }
  }, [debouncedItemsPerPage, maxNumberOfTeams]);

  useEffect(() => {
    fetchTeams();
  }, [searchTerm, start, itemsPerPage]);

  useEffect(() => {
    if (debouncedSearch !== searchTerm) {
      setSearchTerm(debouncedSearch);
    }
  }, [debouncedSearch, searchTerm]);

  const handleSearchChange = (e: any) => {
    let sanitizedSearchInput = DOMPurify.sanitize(e.target.value);
    setInputSearch(sanitizedSearchInput);
  };

  // Loads the previous page of teams, ensuring the start index does not go below zero
  const handlePreviousPage = () => {
    setStart((prev) => Math.max(0, prev - itemsPerPage));
  };

  // Advances to the next page of teams by increasing the start index by the items per page
  const handleNextPage = () => {
    setStart((prev) =>
      Math.min(prev + itemsPerPage, maxNumberOfTeams - itemsPerPage)
    );
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
            <h2 className="text-4xl text-primary">Find Your Favorite Teams</h2>
          </div>

          <TeamsFilterSearchBar
            handleSearchChange={handleSearchChange}
            searchTerm={inputSearch}
          ></TeamsFilterSearchBar>

          <div className="flex flex-row flex-wrap items-center justify-end gap-4">
            <div className="flex flex-col gap-3 items-start justify-center">
              <Label>Items per page</Label>
              <input
                type="number"
                min={1}
                max={30}
                defaultValue={itemsPerPage}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setInputItemsPerPage(val);
                }}
                className="p-2 ring-1 border-none bg-inherit outline-none w-20 h-6 rounded-md cursor-pointer"
              ></input>
            </div>
            <LeagueAndDivisionFilterInputs
              league={league}
              division={division}
              setDivision={setDivision}
              setLeague={setLeague}
            ></LeagueAndDivisionFilterInputs>
          </div>

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
          <h2 className="text-4xl text-primary">Find Your Favorite Teams</h2>
        </div>
        <TeamsFilterSearchBar
          handleSearchChange={handleSearchChange}
          searchTerm={searchTerm}
        ></TeamsFilterSearchBar>
        <div className="flex flex-row items-center justify-end gap-4">
          <div className="flex flex-col gap-3 items-start justify-center">
            <Label>Items per page</Label>
            <input
              type="number"
              min={1}
              max={30}
              defaultValue={itemsPerPage}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setInputItemsPerPage(val);
              }}
              className="p-2 ring-1 border-none bg-inherit outline-none w-20 h-6 rounded-md cursor-pointer"
            ></input>
          </div>
          <LeagueAndDivisionFilterInputs
            league={league}
            division={division}
            setDivision={setDivision}
            setLeague={setLeague}
          ></LeagueAndDivisionFilterInputs>
        </div>

        <ErrorPage pageError={error}></ErrorPage>

        <div className="flex justify-between mt-4">
          <Button
            className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 hover:shadow-lg"
            onClick={handlePreviousPage}
            disabled={start === 0}
          >
            Previous
          </Button>
          <Button
            className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 hover:shadow-lg"
            onClick={handleNextPage}
            disabled={teams.length < itemsPerPage || start >= 30}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }

  let startPageNumb = Math.min(
    Math.max(1, Math.floor(start / itemsPerPage) + 1),
    Math.max(1, Math.ceil(maxNumberOfTeams / itemsPerPage))
  );

  if (isNaN(startPageNumb)) {
    startPageNumb = 1;
  }

  return (
    <div>
      <div className="flex-1 min-h-0 flex flex-col py-2 overflow-auto">
        <div
          ref={teamSectionRef}
          className="flex items-center justify-center pb-8 mt-20"
        >
          <h2 className="text-4xl text-primary">Find Your Favorite Teams</h2>
        </div>

        <TeamsFilterSearchBar
          handleSearchChange={handleSearchChange}
          searchTerm={inputSearch}
        ></TeamsFilterSearchBar>

        <div className="flex flex-row flex-wrap items-center justify-end gap-4">
          <div className="flex flex-col gap-3 items-start justify-center">
            <Label>Items per page</Label>
            <input
              type="number"
              min={1}
              max={30}
              value={inputItemsPerPage ?? ""}
              onChange={(e) => {
                const raw = e.target.value;

                if (raw === "") {
                  // Allow user to clear the field
                  setInputItemsPerPage(undefined);
                  return;
                }

                const val = parseInt(raw, 10);
                if (!isNaN(val)) {
                  setInputItemsPerPage(val);
                }
              }}
              className="p-2 ring-1 border-none bg-inherit outline-none w-20 h-6 rounded-md cursor-pointer"
            />
          </div>
          <LeagueAndDivisionFilterInputs
            league={league}
            division={division}
            setDivision={setDivision}
            setLeague={setLeague}
          ></LeagueAndDivisionFilterInputs>
        </div>

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
          Page: {startPageNumb} of{" "}
          {Math.max(1, Math.ceil(maxNumberOfTeams / itemsPerPage))}
        </div>

        <Button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover:shadow-lg"
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
