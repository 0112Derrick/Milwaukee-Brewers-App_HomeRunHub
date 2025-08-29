import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "src/@/components/ui/card";
import { Badge } from "src/@/components/ui/badge";

import { Spinner } from "src/components/Spinner";
import { ScrollArea } from "src/@/components/ui/scroll-area";
import { getStandingsResp } from "src/repository/schedules";
import { StandingsResponseV2 } from "src/interfaces/teams.types";
import { DataTable } from "src/components/Table";
import { columns } from "src/data/columnDefs";

const StandingsPage: React.FC = () => {
  const [standings, setStandings] = useState<StandingsResponseV2 | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [division, setDivision] = useState<number>(105);

  const ac = new AbortController();

  const fetchStandings = async () => {
    setLoading(true);

    try {
      const response = await getStandingsResp(
        ac,
        new Date().toISOString().split("T")[0],
        division
      );

      if (!response || response.status !== 200) {
        if (!response) {
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
        <div className="mt-4 flex flex-col gap-1">
          {standings.records.map((division) => (
            <Card key={division.division.id} className="rounded-none m-0">
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
              <CardContent className="p-0">
                <div>
                  <DataTable
                    columns={columns}
                    data={division.teamRecords}
                    showDateRange={false}
                  ></DataTable>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};

export default StandingsPage;
