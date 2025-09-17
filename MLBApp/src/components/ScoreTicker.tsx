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
import {
  Transaction,
  TypeCode,
} from "src/interfaces/generated.transactions.types";
import { getTransactionsResp } from "src/repository/teams";

export const ScoreTicker = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [date, setDate] = useState<Date>(() => new Date());
  const [sortedGames, setSortedGames] = useState<MlbGame[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sort, setSort] = useState<GameStatusBucket>("final");
  const [visible, setVisible] = useState(false);
  const [tickerItems, setTickerItems] = useState<any[]>([]);

  // ensure we only auto-open once immediately after the first successful fetch
  const openedOnceRef = useRef(false);

  const fetchSchedule = async (abortController: AbortController) => {
    setLoading(true);
    try {
      const currentDate = formatYMDLocal(date);
      const [scheduleResp, transactionsResp] = await Promise.all([
        getScheduleResp(abortController, currentDate),
        getTransactionsResp(abortController, {
          startDt: currentDate,
          endDt: currentDate,
          order: "desc",
        }),
      ]);

      if (
        !scheduleResp ||
        scheduleResp.status !== 200 ||
        !transactionsResp ||
        transactionsResp.status !== 200
      )
        return;

      setError(null);
      const scheduleData: ScheduleResponse = scheduleResp.data;
      const transactionsData: Transaction[] =
        transactionsResp.data.transactions;

      const currentDayGames =
        scheduleData?.dates.find((d) => {
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

      setSortedGames(currentDayGames.games);
      setTransactions(transactionsData);

      // show immediately the first time we have games
      if (!openedOnceRef.current && currentDayGames.games.length > 0) {
        // console.log("Setting visible to true for the first time"); // Debug log
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
    if (loading) return;
    if (error) return;
    if (sortedGames.length === 0) return;
    if (visible) return;

    const t = window.setTimeout(() => setVisible(true), FIVE_MINUTES);
    return () => window.clearTimeout(t);
  }, [loading, error, sortedGames.length, visible]);

  useEffect(() => {
    setAllTickerItems();
  }, [sortedGames, transactions]);

  function mapGameScoresToJSXElements(arr: MlbGame[]) {
    let array = sortGamesArr(arr, "final");
    const mappedElements = array.map((game, indx) => {
      try {
        const state = game?.status?.detailedState ?? "";
        const status = mlbGameStatus(state);
        if (
          status === "other" ||
          status === "delayed" ||
          status === "suspended"
        )
          return null;

        const awayLogo = teamLogoUrl(game.teams.away.team.id);
        const homeLogo = teamLogoUrl(game.teams.home.team.id);

        const awayName = game.teams.away.team.name.split(" ");
        const homeName = game.teams.home.team.name.split(" ");
        const awayAbbr = awayName[1] ?? awayName[0];
        const homeAbbr = homeName[1] ?? homeName[0];

        const homeScore =
          status === "live" || status === "final"
            ? game.teams.home.score ?? 0
            : "";

        const awayScore =
          status === "live" || status === "final"
            ? game.teams.away.score ?? 0
            : "";

        const gameTime = parseYMDLocal(game.gameDate, true, {
          timeStyle: "short",
        }) as string;

        return (
          <div
            key={"score" + indx}
            className="flex flex-row items-center gap-1 px-4 border-x border-black min-w-fit h-full"
          >
            <img src={awayLogo} alt={`${awayAbbr} logo`} className="w-4 h-4" />
            <span>
              {awayAbbr} {awayScore} vs.
            </span>
            <span>{homeScore}</span>
            <img src={homeLogo} alt={`${homeAbbr} logo`} className="w-4 h-4" />
            <span>{homeAbbr}</span>
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
    });

    return mappedElements;
  }

  function mapTransactionsToJSXELements(arr: Transaction[], filter?: TypeCode) {
    let transactions = [...arr];
    if (filter) {
      transactions = transactions.filter((item) => {
        return item.typeCode === filter;
      });
    }

    const elements = transactions.map((item, indx) => {
      if (filter == "TR") {
        return (
          <div
            key={"transaction" + indx}
            className="flex gap-2 items-center justify-center"
          >
            {item.person.fullName ?? ""} {item.fromTeam?.name ?? ""} Traded to
            {item.toTeam.name ?? ""}
          </div>
        );
      }

      return (
        <div
          key={"transaction" + indx}
          className="flex gap-2 items-center justify-center"
        >
          {item.person.fullName ?? ""} {item.description}
        </div>
      );
    });
    return elements;
  }

  function setAllTickerItems() {
    const tickerItemsLocal = [];
    if (sortedGames.length > 0) {
      //Current day scores:
      tickerItemsLocal.push(
        <div
          key={"scoresLabel"}
          className="flex items-center justify-center px-4 h-full bg-blue-400 text-white font-semibold"
        >
          Scores:{" "}
        </div>
      );
      tickerItemsLocal.push(...mapGameScoresToJSXElements(sortedGames));
    }
    //Transactions:
    if (transactions.length > 0) {
      <div
        key={"transactionLabel"}
        className="flex items-center justify-center px-4 h-full bg-green-400 text-white font-semibold"
      >
        Trades:{" "}
      </div>;
      tickerItemsLocal.push(
        ...mapTransactionsToJSXELements(transactions, "TR")
      );
    }

    setTickerItems(tickerItemsLocal);
  }

  if (!visible) return <div className="sticky top-0 min-h-0"></div>;

  return (
    <AnimatePresence>
      <motion.div
        className="sticky top-0 z-20 bg-white text-black w-full h-10 max-h-10 min-h-10 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
      >
        <motion.div
          className="flex h-full max-h-10 whitespace-nowrap items-center"
          initial={{ x: "100%" }}
          animate={{ x: "-300%" }}
          transition={{
            duration: 40, // slow scroll
            ease: "linear",
            repeat: 2,
            onComplete: () => setVisible(false), // then collapse
          }}
        >
          {tickerItems}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
