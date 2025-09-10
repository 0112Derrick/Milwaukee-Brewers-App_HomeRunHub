import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "src/@/components/ui/card";
import { Badge } from "src/@/components/ui/badge";

import { Spinner } from "src/components/Spinner";
import { ScrollArea, ScrollBar } from "src/@/components/ui/scroll-area";
import { getStandingsResp } from "src/repository/schedules";
import { StandingsResponseV2 } from "src/interfaces/teams.types";
import { DataTable } from "src/components/Table";
import { columns } from "src/data/columnDefs";
import { Label } from "src/@/components/ui/label";

const StandingsPage: React.FC = () => {
  const [standings, setStandings] = useState<StandingsResponseV2 | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [league, setLeague] = useState<number>(105);
  const [division, setDivision] = useState<number>(0);

  const ac = new AbortController();

  const fetchStandings = async () => {
    setLoading(true);

    try {
      const response = await getStandingsResp(
        ac,
        new Date().toISOString().split("T")[0],
        league,
        division
      );

      if (!response || response.status !== 200) {
        if (!response) {
          setStandings(null);
          return;
        }

        if (typeof response == "object") {
          throw new Error(`Fetch error: ${response.statusText}`);
        }
      }

      const data: StandingsResponseV2 = response.data;

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
  }, [league, division]);

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
  if (!standings)
    return (
      <div className="p-4 space-y-8 flex flex-col flex-grow overflow-auto bg-inherit">
        No results found
      </div>
    );

  return (
    <ScrollArea>
      <div className="p-4 flex flex-col flex-grow max-w-[100vw] overflow-auto bg-inherit">
        <h1 className="text-2xl font-bold">MLB Standings</h1>
        <div className="flex flex-wrap gap-2 justify-end text-black">
          <div className="flex flex-col gap-3">
            <Label className="text-white">League</Label>
            <select
              className="ring-0 border-none outline-none text-black w-32 h-6 rounded-md"
              defaultValue={league}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setLeague(val);
              }}
            >
              <option value={105}>Any</option>
              <option value={103}>American league</option>
              <option value={104}>National league</option>
            </select>
          </div>
          <div className="flex flex-col gap-3">
            <Label className="text-white">Division</Label>
            <select
              className="ring-0 border-none outline-none text-black w-32 h-6 rounded-md"
              defaultValue={division}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setDivision(val);
              }}
            >
              <option value={0}>Any</option>
              <option value={1}>West</option>
              <option value={2}>East</option>
              <option value={3}>Central</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col mt-4 rounded-none border-none bg-slate-50 md:items-start lg:items-center">
          {standings.records.map((division) => (
            <Card
              key={division.division.id}
              className="rounded-none overflow-hidden m-0 border-none md:min-w-full md:max-w-full lg:min-w-[70%] lg:max-w-[70%]"
            >
              <CardHeader className="border-none h-fit">
                <CardTitle className="flex flex-wrap items-center justify-between text-black border-none">
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
              <CardContent className="p-0 h-full min-h-0 min-w-full">
                <ScrollArea>
                  <DataTable
                    columns={columns}
                    data={division.teamRecords}
                    showDateRange={false}
                    sortOrder="desc"
                  ></DataTable>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};

export default StandingsPage;
