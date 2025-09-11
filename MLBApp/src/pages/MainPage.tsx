import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "src/@/components/ui/scroll-area";
import { TeamsContainer } from "src/components/TeamsContainer";
import TitleSection from "src/components/TitleSection";

const MainPage = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const teamSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes in the media query's evaluation result
    const handler = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handler);

    // Cleanup function to remove the event listener
    return () => {
      mediaQuery.removeEventListener("change", handler);
    };
    //eslint-disable-next-line
  }, []);

  const video = useRef<HTMLVideoElement>(null);
  let videoUnmuted = false;

  const videoSrc =
    process.env.PUBLIC_URL + "/videos/DreamWithNoLimits-2024OpeningDaySpot.mp4";
  const reducedMotionWorldCupImgSrc =
    process.env.PUBLIC_URL + "/images/baseballAbstractArt3.webp";

  return (
    <div className="flex flex-col flex-grow bg-inherit min-h-0 overflow-auto">
      <ScrollArea className="px-4">
        <div className="flex flex-col items-center justify-around h-[80vh] md:justify-start md:flex-col lg:flex-row lg:justify-start gap-2">
          <div className="p-4 px-8 flex flex-col items-center justify-center">
            {false ? (
              <video
                ref={video}
                muted={true}
                onVolumeChange={() => {
                  if (
                    video &&
                    video.current &&
                    video.current.volume === 1 &&
                    !videoUnmuted
                  ) {
                    video.current.volume = 0.1;
                    videoUnmuted = true;
                  }
                }}
                controls
                preload={"true"}
                autoPlay={true}
                loop={true}
                className="rounded-md sm:w-1/2 sm:aspect-video lg:w-full"
              >
                <source src={videoSrc} type="video/mp4"></source>
                Your Browser does not support video tag.
              </video>
            ) : (
              <img
                src={reducedMotionWorldCupImgSrc}
                alt="Baseball World Cup"
                className="aspect-square max-w-[65%] rounded-full"
              ></img>
            )}
          </div>
          <TitleSection forwardRef={teamSectionRef}></TitleSection>
        </div>

        <TeamsContainer teamSectionRef={teamSectionRef}></TeamsContainer>
        <div className="h-4"></div>
      </ScrollArea>
    </div>
  );
};

export default MainPage;
