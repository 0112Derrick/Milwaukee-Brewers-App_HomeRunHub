import { useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../@/components/ui/card";
import { useNavigate } from "react-router-dom";

const TeamCard = ({
  teamName,
  description,
  imageUrl,
  id,
  teamColor,
}: {
  teamName: string;
  description: string;
  imageUrl: string;
  id: number;
  teamColor: string | undefined;
}) => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  return (
    <>
      {teamColor ? (
        <Card
          style={
            {
              "--teamColor": teamColor,
            } as React.CSSProperties
          }
          className={`w-[250px] overflow-hidden cursor-pointer text-white border-inherit hover:shadow-[var(--teamColor)] hover:border-[var(--teamColor)] hover:border-solid hover:border-x-2 hover:bg-secondary hover:shadow-md`}
          onClick={() => {
            navigate(`/teams/${id}`);
          }}
          ref={cardRef}
        >
          <img
            src={imageUrl}
            alt={teamName}
            className="w-full h-36 object-contain py-4"
          />
          <CardHeader className="bg-slate-800">
            <CardTitle>{teamName}</CardTitle>
            <CardDescription className={`text-slate-300`}>
              {description}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}
    </>
  );
};

export default TeamCard;
