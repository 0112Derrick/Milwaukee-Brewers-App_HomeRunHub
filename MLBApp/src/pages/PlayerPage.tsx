import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PlayerProfile } from "src/components/Player";
import { Spinner } from "src/components/Spinner";

import { Person } from "src/interfaces/generated.player.types";
import { getPlayerResp } from "src/repository/teams";

export function PlayerPage() {
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [noPlayerFound, setNoPlayerFound] = useState<any>(false);
  const [player, setPlayer] = useState<Person | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    const playerId = parseInt(id ?? "0");

    if (playerId == 0) {
      setNoPlayerFound(true);
      return;
    }

    const fetchPlayer = async () => {
      setLoading(true);
      try {
        const resp = await getPlayerResp(ac, playerId);
        if (!resp) {
          setNoPlayerFound(true);
          return;
        } else {
          const person = resp.data.people.at(0);

          if (person) {
            setPlayer(person);
          } else {
            setNoPlayerFound(true);
          }
        }
      } catch (e) {
        setError("Unable to load the page.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col flex-grow h-full w-full items-center justify-center p-4">
        <Spinner />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  if (noPlayerFound) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow">
        <p className="text-red-500">No player found.</p>
      </div>
    );
  }
  if (player) {
    return <PlayerProfile player={player}></PlayerProfile>;
  } else {
    return (
      <div className="flex flex-col items-center justify-center flex-grow">
        <p className="text-red-500">No player found.</p>
      </div>
    );
  }
}
