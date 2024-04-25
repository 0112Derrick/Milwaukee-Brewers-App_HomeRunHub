import React from "react";

function TeamFilterRadioButtons({
  division,
  league,
  handleFilterChange,
}: {
  division: string;
  league: string;
  handleFilterChange: any;
}) {
  return (
    <>
      {/* League Filters */}
      <div className="flex flex-wrap sm:flex-nowrap mb-4 gap-2">
        <div className="flex gap-1">
          <input
            type="radio"
            id="any-league"
            name="league"
            value="any"
            checked={league === "any"}
            onChange={handleFilterChange}
          />
          <label htmlFor="any-league">Any League</label>
        </div>

        <div className="flex gap-1">
          <input
            type="radio"
            id="american-league"
            name="league"
            value="american"
            checked={league === "american"}
            onChange={handleFilterChange}
          />
          <label htmlFor="american-league">American</label>
        </div>

        <div className="flex gap-1">
          <input
            type="radio"
            id="national-league"
            name="league"
            value="national"
            checked={league === "national"}
            onChange={handleFilterChange}
          />
          <label htmlFor="national-league">National</label>
        </div>
      </div>
      {/* Division Filters */}
      <div className="flex flex-wrap sm:flex-nowrap mb-4 gap-2">
        <div className="flex gap-1">
          <input
            type="radio"
            id="any-division"
            name="division"
            value="any"
            checked={division === "any"}
            onChange={handleFilterChange}
          />
          <label htmlFor="any-division">Any Division</label>
        </div>

        <div className="flex gap-1">
          <input
            type="radio"
            id="east-division"
            name="division"
            value="east"
            checked={division === "east"}
            onChange={handleFilterChange}
          />
          <label htmlFor="east-division">East</label>
        </div>

        <div className="flex gap-1">
          <input
            type="radio"
            id="central-division"
            name="division"
            value="central"
            checked={division === "central"}
            onChange={handleFilterChange}
          />
          <label htmlFor="central-division">Central</label>
        </div>

        <div className="flex gap-1">
          <input
            type="radio"
            id="west-division"
            name="division"
            value="west"
            checked={division === "west"}
            onChange={handleFilterChange}
          />
          <label htmlFor="west-division">West</label>
        </div>
      </div>
    </>
  );
}

export default TeamFilterRadioButtons;
