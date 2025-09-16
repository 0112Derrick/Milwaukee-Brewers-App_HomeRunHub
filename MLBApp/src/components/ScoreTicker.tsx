import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FIVE_MINUTES,
  GameStatusBucket,
  MlbGame,
  THREE_MINUTES,
} from "src/interfaces/interfaces";
import { ScheduleResponse } from "src/interfaces/teams.types";
import { getScheduleResp } from "src/repository/schedules";
import {
  capitalizeFirstLetter,
  formatYMDLocal,
  mlbGameStatus,
  parseYMDLocal,
  sortGamesArr,
  teamLogoUrl,
} from "src/utils/utils";

export const ScoreTicker = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [date, setDate] = useState<Date>(() => new Date());
  const [sortedGames, setSortedGames] = useState<MlbGame[]>([]);
  const [sort, setSort] = useState<GameStatusBucket>("live");
  const [visible, setVisible] = useState(false);
  const tickerItems: Array<any> = [];

  // ensure we only auto-open once immediately after the first successful fetch
  const openedOnceRef = useRef(false);

  const fetchSchedule = async (abortController: AbortController) => {
    setLoading(true);
    try {
      const currentDate = formatYMDLocal(date);
      const resp = await getScheduleResp(abortController, currentDate);
      if (!resp || resp.status !== 200) return;

      setError(null);
      const data: ScheduleResponse = resp.data;

      const currentDayGames =
        data?.dates.find((d) => {
          const dLocal = parseYMDLocal(d.date) as Date;
          return (
            dLocal.getFullYear() === date.getFullYear() &&
            dLocal.getMonth() === date.getMonth() &&
            dLocal.getDate() === date.getDate()
          );
        }) ?? null;

      if (!currentDayGames || currentDayGames.games.length === 0) {
        setDate(
          (prev) =>
            new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 1)
        );
        return;
      }

      const games = sortGamesArr(currentDayGames.games);
      setSortedGames(games);

      // show immediately the first time we have games
      if (!openedOnceRef.current && games.length > 0) {
        console.log("Setting visible to true for the first time"); // Debug log
        openedOnceRef.current = true;
        setVisible(true);
      }
    } catch (e) {
      if (!axios.isCancel(e)) setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sortedGames.length) setSortedGames((g) => sortGamesArr(g, sort));
  }, [sort]);

  useEffect(() => {
    const ac = new AbortController();

    fetchSchedule(ac);
    const tickId = window.setInterval(() => fetchSchedule(ac), THREE_MINUTES);

    return () => {
      ac.abort();
      window.clearInterval(tickId);
    };
  }, [date]);

  useEffect(() => {
    const openInterval = setInterval(() => {
      if (!loading && !error && sortedGames.length > 0) {
        setVisible(true);
      }
    }, FIVE_MINUTES);
    return () => clearInterval(openInterval);
  }, [loading, error, sortedGames]);

  tickerItems.push(<div className="px-4">Scores: </div>);
  tickerItems.push(
    ...sortedGames.map((game, indx) => {
      try {
        const state = game?.status?.detailedState ?? "";
        const status = mlbGameStatus(state);
        if (status === "other") return null;

        const awayLogo = teamLogoUrl(game.teams.away.team.id);
        const homeLogo = teamLogoUrl(game.teams.home.team.id);

        const awayName = game.teams.away.team.name.split(" ");
        const homeName = game.teams.home.team.name.split(" ");
        const awayAbbr = awayName[1] ?? awayName[0];
        const homeAbbr = homeName[1] ?? homeName[0];

        const homeScore =
          game.teams.home.score && (status === "live" || status === "final")
            ? game.teams.home.score
            : status === "live" || status === "final"
            ? 0
            : "-";
        const awayScore =
          game.teams.away.score && (status === "live" || status === "final")
            ? game.teams.away.score
            : status === "live" || status === "final"
            ? 0
            : "-";

        const gameTime = parseYMDLocal(game.gameDate, true, {
          timeStyle: "short",
        }) as string;

        return (
          <div
            key={"tickItem" + indx}
            className="flex flex-row items-center gap-2 px-4 border-x border-black min-w-fit h-full"
          >
            <img src={awayLogo} alt={`${awayAbbr} logo`} className="w-4 h-4" />
            <span>
              {awayAbbr} {awayScore} vs.
            </span>
            <img src={homeLogo} alt={`${homeAbbr} logo`} className="w-4 h-4" />
            <span>
              {homeAbbr} {homeScore}
            </span>
            {status !== "live" && status !== "final" && (
              <span className="ml-2 text-xs">
                {capitalizeFirstLetter(status)} | {gameTime}
              </span>
            )}
          </div>
        );
      } catch {
        return null;
      }
    })
  );
  tickerItems.push(<div className="px-4">Trades: </div>);

  if (!visible) return <div className="sticky top-0 min-h-0"></div>;

  return (
    <AnimatePresence>
      <motion.div
        className="sticky top-0 z-50 bg-white text-black w-full h-20 max-h-20 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
      >
        <motion.div
          key={sortedGames.length}
          className="flex h-full max-h-20 whitespace-nowrap items-center"
          initial={{ x: 0 }}
          animate={{ x: "-100%" }}
          transition={{
            duration: 60, // slow scroll
            ease: "linear",
            repeat: 2, // go through twice
            onComplete: () => setVisible(false), // then collapse
          }}
        >
          {tickerItems}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
