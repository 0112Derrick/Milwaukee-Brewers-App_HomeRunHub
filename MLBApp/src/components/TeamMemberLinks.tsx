import {
  GitHubLogoIcon,
  InstagramLogoIcon,
  LinkedInLogoIcon,
  TwitterLogoIcon,
} from "@radix-ui/react-icons";
import React from "react";
import { Card } from "src/@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "src/@/components/ui/hover-card";
import { Link } from "react-router-dom";

function TeamMemeberLinks({
  img,
  name,
  linkedin,
  twitter,
  instagram,
  facebook,
  github,
}: {
  img: string;
  name: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  github?: string;
}) {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <div className="flex gap-4 items-center justify-center cursor-help">
          <img
            className="rounded-full h-8 aspect-square grayscale"
            src={img}
            alt={name}
          ></img>
          <p>{name}</p>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="bg-inherit border-none w-fit">
        <Card className="flex items-center gap-4 p-4 bg-black text-white border border-white h-fit w-fit min-w-fit sm:flex-wrap">
          <img
            className="rounded-full h-12 aspect-square grayscale"
            src={img}
            alt={name}
          ></img>
          <div>
            <p>Derrick Williams</p>
            <p className="opacity-75">Engineer</p>
          </div>
          {linkedin ? (
            <Link to={linkedin} target="_blank">
              <LinkedInLogoIcon className="scale-150"></LinkedInLogoIcon>
            </Link>
          ) : null}
          {twitter ? (
            <Link to={twitter} target="_blank">
              <TwitterLogoIcon className="scale-150"></TwitterLogoIcon>
            </Link>
          ) : null}
          {instagram ? (
            <Link to={instagram} target="_blank">
              <InstagramLogoIcon className="scale-150"></InstagramLogoIcon>
            </Link>
          ) : null}

          {facebook ? (
            <Link to={facebook} target="_blank">
              <div
                className="font-bold text-white rounded-md aspect-square h-4 w-4 scale-75 p-4 text-sm flex items-center justify-center"
                style={{
                  backgroundColor: "#4267B2",
                }}
              >
                FB
              </div>
            </Link>
          ) : null}

          {github ? (
            <Link to={github} target="_blank">
              <GitHubLogoIcon className="scale-150"></GitHubLogoIcon>
            </Link>
          ) : null}
        </Card>
      </HoverCardContent>
    </HoverCard>
  );
}

export default TeamMemeberLinks;
