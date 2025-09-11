import { motion } from "framer-motion";
import TeamMemeberLinks from "../components/TeamMemberLinks";

function About() {
  const teamImg = `${process.env.PUBLIC_URL}/images/teamImg.jpg`;
  const heroImg = `${process.env.PUBLIC_URL}/images/baseballDataManagementTracker2.webp`;
  const heroImg2 = `${process.env.PUBLIC_URL}/images/futuristicBaseballDesign.png`;
  return (
    <div className="flex flex-col flex-grow px-8 items-center md:px-16 overflow-x-hidden">
      <div className="container flex flex-col items-center justify-center">
        <h1 className="text-2xl md:text-4xl text-center font-semibold p-8">
          Home Run Hub is bringing magic<br className="hidden md:block"></br>{" "}
          back to MLB apps.
        </h1>

        {/* Faint grid + glowing border; removed underglow layers */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          className="relative mb-4 w-[90%] aspect-video sm:my-20 sm:w-3/4 flex flex-col items-center justify-center"
        >
          {/* Faint grid background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ transform: "perspective(1100px) rotateX(5deg)" }}
            className="
      pointer-events-none absolute inset-0
      bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)]
      [background-size:44px_44px]
      bg-center
  "
          />

          {/* Card with border glow */}
          <motion.div
            className="
            opacity-80
    relative w-[70%] md:w-1/2 aspect-square overflow-hidden
    ring-1 ring-sky-300/30
    shadow-[0_0_0_1px_rgba(125,211,252,0.25)]
    bg-center bg-no-repeat bg-cover
    [transform-style:preserve-3d]
    
    /* glow halo using ::after */
    after:pointer-events-none after:absolute after:inset-[-10px] after:rounded-full
    after:bg-[radial-gradient(40%_60%_at_50%_50%,rgba(56,189,248,0.35),rgba(56,189,248,0.12)_45%,transparent_70%)]
    after:blur-xl after:content-['']
    rounded-full
  "
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(15,23,42,0.08) 0%, rgba(15,23,42,0.18) 35%, rgba(15,23,42,0.75) 100%), url('${heroImg2}')`,
              transform:
                "perspective(1200px) rotateX(18deg) rotateZ(-8deg) scale(1.06)",
              filter: "saturate(1.05) contrast(1.02)",
            }}
            initial={{
              boxShadow: "0 0 40px rgba(56,189,248,0.18)",
              y: 0,
            }}
            animate={{
              boxShadow: "0 0 70px rgba(56,189,248,0.22)",
              y: [0, -12, 0, -12, 0, -12, 0], // moves up then back down
            }}
            transition={{
              duration: 8, // slower floaty feel
              ease: "easeInOut",
            }}
          >
            {/* subtle top sheen */}
            <div
              className="
      pointer-events-none absolute inset-0
      bg-[linear-gradient(to_bottom,rgba(255,255,255,0.12),transparent_35%,transparent)]
      mix-blend-overlay
    "
            />
          </motion.div>
        </motion.div>
      </div>

      <div className="grid w-[90%] mt-16 py-8 gap-8 z-[2] justify-items-center items-center grid-cols-1 sm:grid-cols-2 sm:w-[85%]">
        <h2 className="px-4 text-2xl md:text-3xl font-bold sm:text-center sm:max-w-[80%]">
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
            I originally started Home Run Hub as part of the Milwaukee Brewers
            interview process, and after being accepted in 2024 as their
            Software Development Intern, I decided to keep building on it. What
            began as a trial project quickly grew into something I wanted to
            shape into a sleek, modern take on baseball apps. My goal has always
            been to make the experience just as enjoyable for seasoned fans as
            it is for newcomers, bringing the magic of the game into a design
            that feels fresh and approachable. Even as a solo developer, I’ve
            poured myself into the details, driven by my passion for the Brewers
            and for creating apps that leave a lasting impact on people. Home
            Run Hub is more than just a side project — it’s a reflection of my
            love for sports, my craft as a developer, and my determination to
            deliver something meaningful to the baseball community.
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
      <div className="py-4 container grid grid-cols-1 md:grid-cols-4 gap-4 w-full h-fit cursor-help">
        <TeamMemeberLinks
          name="Derrick Williams"
          img={teamImg}
          title="Software Developer"
          github="https://github.com/0112Derrick"
          linkedin="https://www.linkedin.com/in/derrick-v-williams-jr-/"
        ></TeamMemeberLinks>
      </div>
    </div>
  );
}

export default About;
