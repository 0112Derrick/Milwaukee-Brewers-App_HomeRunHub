import { ArrowBigRight } from "lucide-react";
import React, { useState } from "react";
import { Button } from "src/@/components/ui/button";

function TitleSection({
  forwardRef,
}: {
  forwardRef?:
    | React.MutableRefObject<HTMLElement>
    | React.MutableRefObject<null>;
}) {
  const [buttonIsHovered, setButtonIsHovered] = useState(false);
  return (
    <>
      <div className="h-auto w-full my-2 flex flex-col items-center text-center gap-8 px-4 sm:px-0">
        <div className=".semi-circle-gradient"></div>
        <span className="text-primary font-bold text-4xl lg:text-2xl">
          Baseball, <span className="text-sky-400">Beautifully</span> Organized
        </span>
        <span className="text-primary/70 text-2xl pb-4 lg:text-xl lg:pb-2">
          Experience the next evolution in baseball apps.
          <br className="hidden sm:inline" /> Discover, filter, and dive deeper
          into your favorite teams with ease and style.
        </span>

        <Button
          variant={"secondary"}
          className="outline outline-white p-6 w-fit rounded-full text-sm sm:text-base hover:shadow-md hover:shadow-primary-foreground"
          onClick={() => {
            if (forwardRef && forwardRef.current)
              forwardRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
          }}
          onMouseEnter={() => {
            setButtonIsHovered(true);
          }}
          onMouseLeave={() => {
            setButtonIsHovered(false);
          }}
        >
          <span className="flex items-center justify-center w-fit p-1 gap-3 flex-nowrap">
            <p className="font-semibold">View Teams</p>
            <div>
              <ArrowBigRight
                className={`fill-white ${
                  buttonIsHovered ? "rotate-90 fill-blue-400" : ""
                }`}
              ></ArrowBigRight>
            </div>
          </span>
        </Button>
      </div>
    </>
  );
}

export default TitleSection;
