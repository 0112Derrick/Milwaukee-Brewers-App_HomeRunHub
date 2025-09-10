import { useEffect, useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "src/@/components/ui/popover";
import { Button } from "src/@/components/ui/button";
import { useDebounce } from "src/hooks/debouncing";

export function SeasonPicker({
  season,
  setSeason,
  onDone,
}: {
  season: number;
  setSeason: (int: number) => void;
  onDone?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [inputSeason, setInputSeason] = useState<number>(season);
  const debouncedSeason = useDebounce<number>(inputSeason, 750);

  useEffect(() => {
    if (debouncedSeason !== season) {
      setSeason(debouncedSeason);
    }
  }, [debouncedSeason]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="sm" className="rounded-full">
          Season {season}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-56"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div
          className="flex items-center gap-2"
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Button
            type="button"
            size="icon"
            onClick={() => {
              setInputSeason((y) => y - 1);
            }}
          >
            –
          </Button>

          <input
            type="number"
            className="w-full h-9 px-2 border rounded"
            value={inputSeason}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (!Number.isNaN(n)) setInputSeason(n);
            }}
            // keep focus; don’t submit enclosing forms
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onDone?.();
                setOpen(false);
              }
            }}
          />

          <Button
            type="button"
            size="icon"
            onClick={() => setInputSeason((y) => y + 1)}
          >
            +
          </Button>
        </div>

        <div
          className={`mt-3 flex justify-end gap-2 ${
            onDone ? "block" : "hidden"
          }`}
        >
          <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onDone?.();
              setOpen(false);
            }}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
