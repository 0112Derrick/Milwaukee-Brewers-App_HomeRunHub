import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@radix-ui/react-accordion";
import {
  SquareGanttChart,
  AlertTriangle,
  Ban,
  CircleDot,
  Drill,
  Flag,
  PlayIcon,
  Trophy,
  CircleCheck,
  ChevronRight,
} from "lucide-react";
import { Badge } from "src/@/components/ui/badge";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "src/@/components/ui/table";
import { cn } from "src/@/lib/utils";
import { PlayEvent } from "src/interfaces/baseballField.types";

export function resultBadgeVariant(result: PlayEvent["result"]) {
  switch (result) {
    case "Home Run":
      return "destructive" as const;
    case "Triple":
    case "Double":
    case "Single":
      return "default" as const;
    case "Walk":
    case "Hit By Pitch":
      return "secondary" as const;
    case "Strikeout":
    case "Out":
      return "outline" as const;
    default:
      return "outline" as const;
  }
}

export function ResultIcon({
  result,
  className,
}: {
  result: PlayEvent["result"];
  className?: string;
}) {
  switch (result) {
    case "Home Run":
      return <Trophy className="h-4 w-4" />;
    case "Triple":
      return <SquareGanttChart className="h-4 w-4" />;
    case "Double":
      return <Drill className="h-4 w-4" />;
    case "Single":
      return <CircleDot className="h-4 w-4" />;
    case "Walk":
      return <Flag className="h-4 w-4" />;
    case "Hit By Pitch":
      return <AlertTriangle className="h-4 w-4" />;
    case "Strikeout":
      return <Ban className="h-4 w-4" />;
    case "Out":
    default:
      return <PlayIcon className={"h-4 w-4" + className} />;
  }
}

export function PlayRow({
  play,
  onClick,
}: {
  play: PlayEvent;
  onClick?: (p: PlayEvent) => void;
}) {
  const scoring = play.isScoringPlay;
  const batterName = play.matchup?.batter?.fullName ?? "";
  const rbi = play.resultObj?.rbi ?? 0;

  return (
    <TableRow
      className={cn(
        "min-h-full hover:bg-muted/50 focus:bg-muted/50 transition-colors outline-none ring-0 group cursor-pointer",
        scoring && "bg-amber-50 dark:bg-amber-900/20"
      )}
      onClick={() => onClick?.(play)}
      tabIndex={0}
      aria-label="Play this event"
      onKeyDown={(e) => {
        const k = e.key;
        if (k === "Enter" || k === "NumpadEnter" || k === " ") {
          e.preventDefault(); // avoid page scroll on Space
          onClick?.(play);
        }
      }}
      title="Play this event"
    >
      <TableCell className="w-[44px] text-muted-foreground tabular-nums text-xs">
        {play.count ?? ""}
      </TableCell>
      <TableCell className="w-[44px] text-muted-foreground tabular-nums text-xs">
        {play.outsAfter ?? ""}
      </TableCell>
      <TableCell className="w-[140px]">
        <div className="flex items-center gap-2">
          <ResultIcon
            result={play.result}
            className="hover:stroke-green-400 hover:fill-green-400 group-hover:fill-green-400 group-hover:stroke-green-400 group-focus:fill-green-400 group-focus:stroke-green-400"
          />
          <Badge variant={resultBadgeVariant(play.result)}>{play.result}</Badge>
        </div>
      </TableCell>
      <TableCell>
        <div className="leading-tight">
          <div className="font-medium text-wrap max-w-[400px]">
            {play.description}
          </div>
          <div className="text-xs text-muted-foreground">
            {batterName}
            {rbi > 0 ? ` • ${rbi} RBI` : ""}
          </div>
        </div>
      </TableCell>
      <TableCell className="w-[80px] text-right tabular-nums">
        {play.awayScore != null && play.homeScore != null ? (
          <span>
            {play.awayScore}-{play.homeScore}
          </span>
        ) : null}
      </TableCell>
    </TableRow>
  );
}

export function InningPanel({
  title,
  plays,
  isOpen,
  onPlayClick,
}: {
  title: string;
  plays: PlayEvent[];
  isOpen: boolean;
  onPlayClick?: (p: PlayEvent) => void;
}) {
  return (
    <AccordionItem
      value={title}
      className={`border-none min-h-full ${
        isOpen
          ? "cursor-default text-black-400"
          : "cursor-pointer hover:text-sky-400 text-stone-600"
      }`}
    >
      <AccordionTrigger
        className={`px-0 w-full text-left hover:no-underline ${
          isOpen ? "cursor-default" : "cursor-pointer"
        }`}
        title="Open play by play list"
      >
        <div
          className={`flex items-center justify-between w-full gap-2 p-2 rounded rounded-b-none ${
            isOpen ? "!bg-sky-300/30" : ""
          }`}
        >
          <div className="flex items-center gap-4">
            <CircleCheck className={`h-4 w-4 fill-blue-400 stroke-white`} />
            <span className="font-semibold">{title}</span>
          </div>

          {isOpen ? (
            <Badge
              className={`${
                isOpen ? "block" : "hidden"
              } flex items-center bg-blue-400`}
            >
              <span className="font-semibold">{plays.length} plays</span>
            </Badge>
          ) : (
            <div className={`${isOpen ? "hidden" : "block"} flex items-center`}>
              <span className="font-semibold">{plays.length} plays</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="min-h-full text-black">
        <div className="min-h-full">
          <Table className="min-h-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[44px]">Ct</TableHead>
                <TableHead className="w-[44px]">Out</TableHead>
                <TableHead className="w-[140px]">Result</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="min-h-full">
              {plays.map((p) => (
                <PlayRow key={p.id} play={p} onClick={onPlayClick} />
              ))}
            </TableBody>
          </Table>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
