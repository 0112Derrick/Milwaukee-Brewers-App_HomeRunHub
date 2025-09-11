import { TriangleIcon, PlayCircle } from "lucide-react";
import { cn } from "src/@/lib/utils";
import { mlbGameStatus, teamLogoUrl, formatYMDLocal } from "src/utils/utils";
import { api } from "src/utils/axios";
import { statusVisuals } from "./GameCard";
import { Badge } from "src/@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { MlbGame } from "src/interfaces/interfaces";
import { useState } from "react";

export function MiniGameCard({ game }: { game: MlbGame }) {
  const [showPlayIcon, setShowPlayIcon] = useState<boolean>(false);
  const state = game?.status?.detailedState ?? "";
  const status = mlbGameStatus(state);
  const isFinal = status === "final";
  const ui = statusVisuals(status);

  const homeWinner = isFinal && game.teams.home.score > game.teams.away.score;
  const awayWinner = isFinal && game.teams.away.score > game.teams.home.score;

  const awayLogo = teamLogoUrl(game.teams.away.team.id);
  const homeLogo = teamLogoUrl(game.teams.home.team.id);
  const ymd = formatYMDLocal(new Date(game.gameDate));

  const awayAbbr =
    game.teams.away.team.name.split(" ")[1] ??
    game.teams.away.team.name.split(" ")[0];
  const homeAbbr =
    game.teams.home.team.name.split(" ")[1] ??
    game.teams.home.team.name.split(" ")[0];

  const homeScore =
    game.teams.home.score && (status == "live" || status == "final")
      ? game.teams.home.score
      : status == "live" || status == "final"
      ? 0
      : "-";
  const awayScore =
    game.teams.away.score && (status == "live" || status == "final")
      ? game.teams.away.score
      : status == "live" || status == "final"
      ? 0
      : "-";

  const gameHref = `/scores/${ymd}/${game.gamePk}`;
  const checkMlbStoryStatusHref = `/check-mlb-story/${game.gamePk}`;
  const storyHref = `https://www.mlb.com/stories/game/${game.gamePk}`;

  async function fetchGameStory() {
    try {
      const res = await api.get(checkMlbStoryStatusHref);
      if (res.data.exists) {
        setShowPlayIcon(true);
      } else {
        setShowPlayIcon(false);
      }
    } catch (e) {
      setShowPlayIcon(false);
    }
  }

  fetchGameStory();

  const navigate = useNavigate();

  return (
    <div
      key={game.gamePk}
      role="link"
      tabIndex={0}
      onClick={() => navigate(gameHref)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(gameHref);
        }
      }}
      className="bg-slate-100 text-black cursor-pointer w-full shadow-md hover:bg-slate-200 transition-colors"
    >
      <div className="grid grid-cols-[70%_30%]">
        {/* teams/score block */}
        <div className="flex flex-col items-center justify-items-end flex-grow gap-2 py-4 md:w-full lg:w-[300px] overflow-hidden">
          <div className="grid grid-cols-[70%_30%] w-full">
            <div className="grid grid-cols-[30%_70%] justify-self-start w-full">
              <img
                src={awayLogo}
                alt={`${awayAbbr} logo`}
                className="h-8 w-8 justify-self-center"
              />
              <p>{awayAbbr}</p>
            </div>

            <div className="flex items-center">
              {awayScore}{" "}
              <span className={`${awayWinner ? "visible" : "invisible"}`}>
                <TriangleIcon className="-rotate-90 scale-50 fill-black"></TriangleIcon>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-[70%_30%] w-full">
            <div className="grid grid-cols-[30%_70%] justify-self-start w-full">
              <img
                src={homeLogo}
                alt={`${homeAbbr} logo`}
                className="h-8 w-8 justify-self-center"
              />
              <p>{homeAbbr}</p>
            </div>
            <div className="flex items-center w-full">
              {homeScore}
              <span className={`${homeWinner ? "visible" : "invisible"}`}>
                <TriangleIcon className="-rotate-90 scale-50 fill-black"></TriangleIcon>
              </span>
            </div>
          </div>
        </div>

        <div className="min-h-[50%] self-center flex flex-col items-center gap-2 px-2 border-l border-l-black">
          <Badge variant="secondary" className={cn("gap-1", ui.chip, ui.pulse)}>
            {ui.icon}
            {ui.badge}
          </Badge>

          {showPlayIcon ? (
            <a
              href={storyHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label="Open game highlights in a new tab"
              title="Open game highlights"
              className="group"
            >
              <PlayCircle
                className="h-7 w-7 group-hover:stroke-green-600"
                aria-hidden="true"
              />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
