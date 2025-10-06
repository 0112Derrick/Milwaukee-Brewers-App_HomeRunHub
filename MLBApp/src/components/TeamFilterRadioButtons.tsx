import { Label } from "src/@/components/ui/label";
import { Division, League } from "src/interfaces/interfaces";

function LeagueAndDivisionFilterInputs({
  division,
  league,
  setLeague,
  setDivision,
  className,
}: {
  division: Division;
  league: League;
  setLeague: (val: number) => void;
  setDivision: (val: number) => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-2 py-4 px-2 justify-end ${className}`}>
      <div className="flex flex-col gap-3">
        <Label>League</Label>
        <select
          className="ring-1 border-none bg-inherit outline-none w-32 h-6 rounded-md cursor-pointer"
          defaultValue={league}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            setLeague(val);
          }}
        >
          <option value={League.ANY}>Any</option>
          <option value={League.AMERICAN}>American</option>
          <option value={League.NATIONAL}>National</option>
        </select>
      </div>
      <div className="flex flex-col gap-3">
        <Label>Division</Label>
        <select
          className="ring-1 border-none bg-inherit outline-none w-32 h-6 rounded-md cursor-pointer"
          defaultValue={division}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            setDivision(val);
          }}
        >
          <option value={Division.ANY}>Any</option>
          <option value={Division.WEST}>West</option>
          <option value={Division.EAST}>East</option>
          <option value={Division.CENTRAL}>Central</option>
        </select>
      </div>
    </div>
  );
}

export default LeagueAndDivisionFilterInputs;
