// DateRangeFilter.tsx
import { useMemo } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Button } from "src/@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "src/@/components/ui/popover";

import { cn } from "src/@/lib/utils";
import { Calendar } from "src/@/components/ui/calendar";
import { formatYYYYMMDD, parseYYYYMMDD } from "src/utils/utils";
import { DateRange } from "src/interfaces/generated.game-content.types";

export function DateRangeFilter({
  table,
  columnId = "officialDate",
  className,
}: {
  table: any; // Table<GameRow>
  columnId?: string;
  className?: string;
}) {
  const col = table.getColumn(columnId);
  const value = (col?.getFilterValue() as DateRange) ?? {};

  const selected = useMemo(() => {
    return {
      from: parseYYYYMMDD(value.from),
      to: parseYYYYMMDD(value.to),
    };
  }, [value]);

  const label = useMemo(() => {
    if (value.from && value.to && value.from === value.to) return value.from;
    if (value.from && value.to) return `${value.from} → ${value.to}`;
    if (value.from) return `≥ ${value.from}`;
    if (value.to) return `≤ ${value.to}`;
    return "Filter by date";
  }, [value]);

  const setRange = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range?.from && !range?.to) {
      col?.setFilterValue(undefined);
      return;
    }
    const fromStr = range.from ? formatYYYYMMDD(range.from) : undefined;
    // If only one day picked, treat as single-day range
    const toStr = range.to
      ? formatYYYYMMDD(range.to)
      : range.from
      ? fromStr
      : undefined;

    col?.setFilterValue({ from: fromStr, to: toStr } as DateRange);
  };

  const clear = () => col?.setFilterValue(undefined);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span className="truncate">{label}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-0">
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={selected}
            onSelect={setRange}
            showOutsideDays
            captionLayout="dropdown"
            className="bg-slate-200/95 rounded-md border-2 border-blue-300"
          />
          <div className="flex items-center justify-between px-3 py-2">
            <div className="text-xs text-muted-foreground">
              Click start/end to set a range. Click the same day twice for a
              single day.
            </div>
            <Button variant="ghost" size="sm" onClick={clear}>
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
