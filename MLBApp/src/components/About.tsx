import React from "react";

import TeamMemeberLinks from "./TeamMemberLinks";

function About() {
  const teamImg = `${process.env.PUBLIC_URL}/images/teamImg.jpg`;
  const heroImg = `${process.env.PUBLIC_URL}/images/baseballDataManagementTracker2.webp`;
  return (
    <div className="flex flex-col flex-grow my-24 px-4 items-center sm:px-8 overflow-x-hidden">
      <div className="container flex flex-col items-center justify-center">
        <h1 className="text-4xl text-center font-bold p-8 z-10">
          Home Run Hub is bringing magic<br></br> back to MLB apps.
        </h1>

        {/* Explicit declaration of CSS perspective and transformations to simulate a 3D effect */}
        <div
          className="w-[90%] my-10 sm:w-3/4 sm:my-20 max-w-[550px] aspect-video bg-contain bg-no-repeat bg-inherit bg-center"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(16, 24, 39, 0.1) 70%, rgba(16, 24, 39, 1) 100%), url('${heroImg}')`,
            transform:
              "perspective(1000px) rotateX(20deg) rotateZ(-8deg) scaleX(2) scaleY(1.5)",
            filter: "blur(0.5px)",
            zIndex: 1,
          }}
        ></div>
      </div>

      <div className="grid w-[90%] mt-16 py-8 gap-8 z-[2] justify-items-center items-center grid-cols-1 sm:grid-cols-2 sm:w-[85%]">
        <h2 className="px-4 text-3xl font-bold sm:text-center sm:max-w-[80%]">
          We’re crafting the mlb tracking tool for teams and sports fans that
          care about quality.
        </h2>
        <p className="px-4 text-lg sm:text-xl opacity-70">
          Baseball, once hailed as America's pastime, has seen a decline in
          popularity in recent years, with some feeling disconnected from the
          game's rich history and slower pace. However, Home Run Hub is on a
          mission to reignite the passion for baseball among fans and teams
          alike. With a fresh approach and innovative features, Home Run Hub
          aims to bring back the excitement and nostalgia of baseball's glory
          days. By providing a platform that offers engaging content,
          interactive experiences, and insightful analysis, Home Run Hub seeks
          to bridge the gap between fans and the sport they love, revitalizing
          the MLB experience for a new generation of enthusiasts.
        </p>
      </div>

      <div className="z-[2] w-full">
        <p className="opacity-70">Team</p>
        <hr className="opacity-25"></hr>
      </div>

      <div className="flex flex-col-reverse items-center justify-center w-[90%] my-6 sm:my-12 sm:flex-row sm:w-[85%]">
        <div className="flex flex-col p-4 gap-8 sm:max-w-[60%]">
          <h3 className="text-3xl font-bold text-center sm:text-left">
            We care deeply about the quality of our work.
          </h3>
          <p className="px-4 text-lg sm:text-xl opacity-70">
            Home Run Hub is the passion project of a solo developer, Derrick,
            who works remotely from home. My dedication to the Milwaukee Brewers
            and creating a positive change for individuals, drives me to create
            an application that will excite the baseball world. Despite being a
            team of one, I'm committed to delivering a top-notch experience for
            fans, making it easier for them to access information about their
            favorite teams. I'm a true maker at heart, caring deeply about the
            quality and detail of my work, and I'm determined to make Home Run
            Hub a valuable resource for baseball enthusiasts everywhere.
          </p>
        </div>

        <div className="p-4 flex flex-col items-center justify-center w-full">
          <img
            className="rounded-md h-48 aspect-square grayscale"
            src={teamImg}
            alt="Home run hub founder Derrick Williams"
          ></img>
          <p className="text-sm opacity-70 text-center">
            Home Run Hub Founder: <br></br> Derrick Williams
          </p>
        </div>
      </div>
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-4 w-full h-fit cursor-help">
        <TeamMemeberLinks
          name="Derrick Williams"
          img={teamImg}
          github="https://github.com/0112Derrick"
          linkedin="https://www.linkedin.com/in/derrick-v-williams-jr-/"
          instagram="https://www.instagram.com/adroit_nature/"
        ></TeamMemeberLinks>
      </div>
    </div>
  );
}

export default About;
