import { useEffect, useRef, useState } from "react";
import TitleSection from "../components/TitleSection";
import { TeamsContainer } from "src/components/TeamsContainer";

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
    <div className="flex flex-col flex-grow bg-inherit min-h-0 p-4 overflow-auto">
      <TitleSection forwardRef={teamSectionRef}></TitleSection>

      <div className="p-4 px-8 flex flex-col items-center justify-center">
        {!prefersReducedMotion ? (
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
            className="rounded-md min-w-[150px] max-w-[80%] scale-150 px-4 sm:scale-100 sm:mt-12 sm:max-w-[80%]"
          >
            <source src={videoSrc} type="video/mp4"></source>
            Your Browser does not support video tag.
          </video>
        ) : (
          <img
            src={reducedMotionWorldCupImgSrc}
            alt="Baseball World Cup"
            className="aspect-square max-w-[50%] rounded-full"
          ></img>
        )}
      </div>
      <TeamsContainer teamSectionRef={teamSectionRef}></TeamsContainer>
    </div>
  );
};

export default MainPage;
