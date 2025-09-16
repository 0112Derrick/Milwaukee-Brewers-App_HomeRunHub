import "./App.css";
import NavBar from "./components/NavBar";
import MainPage from "./pages/MainPage";
import Footer from "./components/Footer";
import {
  HashRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import TeamPage from "./pages/TeamPage";
import ContactUs from "./components/Contact";
import About from "./pages/About";
import StandingsPage from "./pages/StandingsPage";
import { PlayByPlay } from "./pages/PlayByPlayPage";
import { LiveGames } from "./pages/LiveGamesPage";
import { PlayerPage } from "./pages/PlayerPage";
import { ScoreTicker } from "./components/ScoreTicker";
import { useState } from "react";
import { Theme } from "./interfaces/interfaces";

function App() {
  const [colorScheme, setColorScheme] = useState<Theme>("light");
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div
              className={`flex flex-col h-screen bg-background text-primary ${colorScheme}`}
            >
              <NavBar
                colorScheme={colorScheme}
                setColorScheme={setColorScheme}
              />
              <ScoreTicker />
              <MainPage />
              <Footer />
            </div>
          }
        ></Route>
        <Route
          path="/teams/:id/:user_season?/:user_page?"
          element={
            <div
              className={`flex flex-col h-screen bg-background text-primary ${colorScheme}`}
            >
              <NavBar
                colorScheme={colorScheme}
                setColorScheme={setColorScheme}
              />
              <ScoreTicker />
              <TeamPage></TeamPage>
              <Footer />
            </div>
          }
        ></Route>
        <Route
          path="/contact"
          element={
            <div
              className={`flex flex-col h-screen bg-background text-primary ${colorScheme}`}
            >
              <NavBar
                colorScheme={colorScheme}
                setColorScheme={setColorScheme}
              />
              <ContactUs></ContactUs>
              <Footer />
            </div>
          }
        ></Route>
        <Route
          path="/standings"
          element={
            <div
              className={`flex flex-col h-screen bg-background text-primary ${colorScheme}`}
            >
              <NavBar
                colorScheme={colorScheme}
                setColorScheme={setColorScheme}
              />
              <ScoreTicker />
              <StandingsPage></StandingsPage>
              <Footer />
            </div>
          }
        ></Route>
        <Route
          path="/about"
          element={
            <div
              className={`flex flex-col h-screen bg-background text-primary ${colorScheme}`}
            >
              <NavBar
                colorScheme={colorScheme}
                setColorScheme={setColorScheme}
              />
              <About></About>
              <Footer />
            </div>
          }
        ></Route>
        <Route
          path="/scores/:gameDate/:id"
          element={
            <div
              className={`flex flex-col h-screen bg-background text-primary ${colorScheme}`}
            >
              <NavBar
                colorScheme={colorScheme}
                setColorScheme={setColorScheme}
              />
              <PlayByPlay></PlayByPlay>
              <Footer />
            </div>
          }
        ></Route>
        <Route
          path="/scores/:gameDate?"
          element={
            <div
              className={`flex flex-col h-screen bg-background text-primary ${colorScheme}`}
            >
              <NavBar
                colorScheme={colorScheme}
                setColorScheme={setColorScheme}
              />
              <LiveGames></LiveGames>
              <Footer />
            </div>
          }
        ></Route>
        <Route
          path="/players/:id"
          element={
            <div
              className={`flex flex-col h-screen bg-background text-primary ${colorScheme}`}
            >
              <NavBar
                colorScheme={colorScheme}
                setColorScheme={setColorScheme}
              />
              <PlayerPage></PlayerPage>
              <Footer />
            </div>
          }
        ></Route>
        <Route path="*" element={<Navigate to="/" replace />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
