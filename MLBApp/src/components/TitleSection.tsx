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
      <div className="h-auto sm:h-60 w-full my-16 sm:my-32 flex flex-col items-center text-center gap-8 px-4 sm:px-0">
        <div className=".semi-circle-gradient"></div>
        <span className="text-neutral-200 font-bold text-2xl sm:text-4xl">
          Home Run Hub is
          <br className="hidden sm:inline" /> your premier destination for all
          things baseball!
        </span>
        <span className="text-neutral-300 text-xl sm:text-2xl pb-2 sm:pb-4">
          Experience the next evolution in baseball apps.
          <br className="hidden sm:inline" /> Discover, filter, and dive deeper
          into your favorite teams with ease and style.
        </span>

        <Button
          variant={"default"}
          className="outline outline-white p-6 w-fit rounded-full text-sm sm:text-base hover:shadow-md hover:shadow-white"
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
