import { Link } from "react-router-dom";
import useScreenSize from "src/hooks/useScreenSize";

export function TeamLogoName({
  id,
  logo,
  teamName,
}: {
  id: number;
  logo: string;
  teamName: string;
}) {
  const screenSize = useScreenSize();

  return (
    <Link
      to={`/teams/${id}`}
      className="focus:text-blue-400 hover:text-blue-400"
    >
      {screenSize.width > 600 ? (
        <div className="grid grid-cols-[40%_40%]">
          <img
            src={logo}
            alt={`${teamName} logo`}
            className="h-8 w-8 justify-self-center"
          />
          {teamName}
        </div>
      ) : (
        <img
          src={logo}
          alt={`${teamName} logo`}
          className="h-8 w-8 justify-self-center"
        />
      )}
    </Link>
  );
}
