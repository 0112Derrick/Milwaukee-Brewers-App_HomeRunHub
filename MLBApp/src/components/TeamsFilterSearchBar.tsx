import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@radix-ui/react-tooltip";
import { Button } from "src/@/components/ui/button";
import { Card, CardDescription } from "src/@/components/ui/card";
import { Input } from "src/@/components/ui/input";

function TeamsFilterSearchBar({
  handleSearchSubmit,
  searchTerm,
  handleSearchChange,
}: {
  handleSearchSubmit: any;
  searchTerm: string;
  handleSearchChange: any;
}) {
  return (
    <form onSubmit={handleSearchSubmit} className="mb-4">
      <div className="flex flex-wrap sm:flex-nowrap mb-2 gap-2">
        <Input
          type="text"
          placeholder="Search teams..."
          value={searchTerm}
          onChange={handleSearchChange}
        />

        <Button
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover:shadow-lg"
          type="submit"
        >
          Search
        </Button>

        <div className="flex items-center mx-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger disabled={true}>
                <div className="rounded-full h-4 w-4 bg-zinc-400 font-bold p-4 m-1 flex items-center justify-center hover:bg-slate-100 text-slate-950 italic">
                  i
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <Card className="p-2 m-2">
                  <CardDescription>
                    Search for a team in real time based on their name |
                    location | or id
                    <br></br> E.g.: name:Brewers location:Milwaukee
                  </CardDescription>
                </Card>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </form>
  );
}

export default TeamsFilterSearchBar;
