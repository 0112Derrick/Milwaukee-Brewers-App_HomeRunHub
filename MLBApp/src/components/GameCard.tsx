import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "src/@/components/ui/card";
import { Badge } from "src/@/components/ui/badge";
import {
  PlayCircle,
  Clock,
  PauseCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { cn } from "src/@/lib/utils";
import { ScrollArea } from "src/@/components/ui/scroll-area";
import { GameStatusBucket } from "src/interfaces";
import { mlbGameStatus } from "src/utils";

function statusVisuals(bucket: GameStatusBucket) {
  switch (bucket) {
    case "live":
      return {
        icon: <PlayCircle className="h-4 w-4" />,
        badge: "Live",
        cardShadow: "shadow-emerald-500 hover:shadow-md",
        cardBorder: "border-l-4 border-emerald-500",
        chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
        pulse:
          "after:ml-2 after:inline-block after:h-2 after:w-2 after:rounded-full after:bg-emerald-500 after:animate-pulse",
      };
    case "scheduled":
      return {
        icon: <Clock className="h-4 w-4" />,
        badge: "Scheduled",
        cardShadow: "hover:shadow-slate-400 hover:shadow-md",
        cardBorder: "border-l-4 border-slate-400",
        chip: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
      };
    case "pregame":
      return {
        icon: <Clock className="h-4 w-4" />,
        badge: "Warmup",
        cardShadow: "hover:shadow-blue-500 hover:shadow-md",
        cardBorder: "border-l-4 border-blue-500",
        chip: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      };
    case "delayed":
      return {
        icon: <PauseCircle className="h-4 w-4" />,
        badge: "Delayed",
        cardShadow: "hover:shadow-amber-500",
        cardBorder: "border-l-4 border-amber-500",
        chip: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
      };
    case "suspended":
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        badge: "Suspended",
        cardShadow: "hover:shadow-orange-500 hover:shadow-md",
        cardBorder: "border-l-4 border-orange-500",
        chip: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      };
    case "postponed":
      return {
        icon: <XCircle className="h-4 w-4" />,
        badge: "Postponed",
        cardShadow: "hover:shadow-rose-500 hover:shadow-md",
        cardBorder: "border-l-4 border-rose-500",
        chip: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
      };
    case "final":
      return {
        icon: <CheckCircle2 className="h-4 w-4" />,
        badge: "Final",
        cardShadow: "hover:shadow-zinc-500 hover:shadow-md",
        cardBorder: "border-l-4 border-zinc-500",
        chip: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
      };
    default:
      return {
        icon: <Clock className="h-4 w-4" />,
        badge: "Status",
        cardShadow: "hover:shadow-white hover:shadow-md",
        cardBorder: "border-l-4 border-muted",
        chip: "bg-muted text-muted-foreground",
      };
  }
}

type GameCardProps = {
  game: any; // your schedule game type
  children?: React.ReactNode; // slot for your Boxscore component, etc.
};

export function GameCard({ game, children }: GameCardProps) {
  const state = game?.status?.detailedState ?? "";
  const bucket = mlbGameStatus(state);
  const ui = statusVisuals(bucket);

  const awayName = game.teams.away.team.name;
  const homeName = game.teams.home.team.name;
  const startLocal = new Date(game.gameDate).toLocaleString();

  return (
    <div className="group">
      <div className={`group-hover:card-wrapper w-[500px] h-64`}>
        <Card
          className={cn(
            "transition-all flex flex-col group-hover:card-content overflow-hidden"
          )}
        >
          <CardHeader className="py-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base md:text-lg">
                {awayName} @ {homeName}
              </CardTitle>

              <Badge
                variant="secondary"
                className={cn("gap-1", ui.chip, ui.pulse)}
              >
                {ui.icon}
                {ui.badge}
              </Badge>
            </div>
            <CardDescription className="text-xs md:text-sm">
              <span className="mr-2">Status: {state}</span>
              <span>Start: {startLocal}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 p-0 overflow-auto">
            <ScrollArea className="h-full w-fit px-4 pb-4 overflow-x-clip">
              {children}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
