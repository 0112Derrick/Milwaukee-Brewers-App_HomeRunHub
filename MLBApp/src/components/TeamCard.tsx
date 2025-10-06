import { useRef, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

const TeamCard = ({
  teamName,
  description,
  imageUrl,
  id,
  teamColor,
  _isFavorite,
  addFavTeam,
  removeFavTeam,
}: {
  teamName: string;
  description: string;
  imageUrl: string;
  id: number;
  teamColor: string | undefined;
  _isFavorite: boolean;
  addFavTeam: (id: number) => void;
  removeFavTeam: (id: number) => void;
}) => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [isFavorite, setIsFavorite] = useState(_isFavorite);

  return (
    <>
      {teamColor ? (
        <Card
          style={
            {
              "--teamColor": teamColor,
            } as React.CSSProperties
          }
          className={`w-[250px] overflow-hidden cursor-pointer text-white border-inherit hover:shadow-[var(--teamColor)] hover:border-[var(--teamColor)] hover:border-solid hover:border-x-2 hover:bg-black/50 dark:hover:bg-white/50 hover:shadow-md`}
          ref={cardRef}
        >
          <img
            src={imageUrl}
            alt={teamName}
            onClick={() => {
              navigate(`/teams/${id}`);
            }}
            className="w-full h-36 object-contain py-4"
          />
          <div className="grid grid-cols-[80%_20%] bg-slate-800 items-center">
            <CardHeader>
              <CardTitle>{teamName}</CardTitle>
              <CardDescription className={`text-slate-300`}>
                {description}
              </CardDescription>
            </CardHeader>
            {isFavorite ? (
              <div title="Unfavorite team">
                {" "}
                <Heart
                  className="fill-pink-400 hover:fill-inherit focus:fill-inherit hover:stroke-red-500 focus:stroke-red-500 outline-none"
                  tabIndex={1}
                  onClick={(e) => {
                    setIsFavorite(false);
                    removeFavTeam(id);
                  }}
                />
              </div>
            ) : (
              <div title="Favorite team">
                <Heart
                  className="hover:fill-pink-400  focus:fill-pink-400 focus:stroke-pink-400 outline-none"
                  tabIndex={1}
                  onClick={(e) => {
                    setIsFavorite(true);
                    addFavTeam(id);
                  }}
                />
              </div>
            )}
          </div>
        </Card>
      ) : null}
    </>
  );
};

export default TeamCard;
