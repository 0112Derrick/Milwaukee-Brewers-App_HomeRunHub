import React, { useRef } from "react";
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
          className={`overflow-hidden cursor-pointer hover:border-solid hover:border-x-2 text-white hover:bg-zinc-400 hover:shadow-lg`}
          onClick={() => {
            navigate(`/teams/${id}`);
          }}
          ref={cardRef}
          onMouseEnter={() => {
            if (cardRef && cardRef.current) {
              let card = cardRef.current as HTMLElement;

              card.style.borderColor = teamColor;
              card.style.boxShadow = `2px 2px 5px ${teamColor}`;
            }
          }}
          onMouseLeave={() => {
            if (cardRef && cardRef.current) {
              let card = cardRef.current as HTMLElement;
              card.style.borderColor = "rgb(255,255,255)";
              card.style.boxShadow = "none";
            }
          }}
        >
          <img
            src={imageUrl}
            alt={teamName}
            className="w-full h-48 object-contain py-4"
          />
          <CardHeader className="bg-slate-800">
            <CardTitle>{teamName}</CardTitle>
            <CardDescription className={`text-slate-300`}>
              {description}
            </CardDescription>
          </CardHeader>
          {/* If you had more content, you'd include <CardContent> here */}
        </Card>
      ) : null}
    </>
  );
};

export default TeamCard;
