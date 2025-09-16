import { Calendar } from "src/@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "src/@/components/ui/popover";
import { Button } from "src/@/components/ui/button";
import { useState } from "react";
import { Label } from "src/@/components/ui/label";
import { ChevronDownIcon } from "lucide-react";

export default function DatePicker({
  date,
  setDate,
  label,
}: {
  date: Date | undefined;
  label?: string;
  setDate: (arg: string | undefined | Date) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="date" className="px-1 font-semibold">
        {label ?? "Select a date"}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-fit h-6 bg-white font-normal text-black ring-1 px-1 hover:bg-white hover:text-black"
          >
            <span className="pr-2">
              {date ? date.toLocaleDateString() : "Select date"}
            </span>
            <ChevronDownIcon className="scale-75 p-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(date) => {
              setDate(date);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
