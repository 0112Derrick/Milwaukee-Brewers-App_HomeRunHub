import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@radix-ui/react-accordion";
import {
  ChevronRight,
  ChevronDown,
  SquareGanttChart,
  AlertTriangle,
  Ban,
  CircleDot,
  Drill,
  Flag,
  PlayIcon,
  Trophy,
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

export function ResultIcon({ result }: { result: PlayEvent["result"] }) {
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
      return <PlayIcon className="h-4 w-4" />;
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
        "hover:bg-muted/50 transition-colors",
        scoring && "bg-amber-50 dark:bg-amber-900/20"
      )}
      onClick={() => onClick?.(play)}
    >
      <TableCell className="w-[44px] text-muted-foreground tabular-nums text-xs">
        {play.count ?? ""}
      </TableCell>
      <TableCell className="w-[44px] text-muted-foreground tabular-nums text-xs">
        {play.outsAfter ?? ""}
      </TableCell>
      <TableCell className="w-[140px]">
        <div className="flex items-center gap-2">
          <ResultIcon result={play.result} />
          <Badge variant={resultBadgeVariant(play.result)}>{play.result}</Badge>
        </div>
      </TableCell>
      <TableCell>
        <div className="leading-tight">
          <div className="font-medium">{play.description}</div>
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
  onPlayClick,
}: {
  title: string;
  plays: PlayEvent[];
  onPlayClick?: (p: PlayEvent) => void;
}) {
  return (
    <AccordionItem value={title} className="border-none">
      <AccordionTrigger className="px-0 text-left hover:no-underline">
        <div className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 data-[state=open]:hidden" />
          <ChevronDown className="h-4 w-4 hidden data-[state=open]:block" />
          <span className="font-semibold">{title}</span>
          <Badge variant="outline" className="ml-2">
            {plays.length} plays
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[44px]">Ct</TableHead>
                <TableHead className="w-[44px]">Out</TableHead>
                <TableHead className="w-[140px]">Result</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
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
