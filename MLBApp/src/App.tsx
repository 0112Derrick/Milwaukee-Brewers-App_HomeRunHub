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
import About from "./components/About";
import StandingsPage from "./pages/standings_page";
import { PlayByPlay } from "./pages/PlayByPlayPage";
import { LiveGames } from "./pages/LiveGamesPage";
import { PlayerPage } from "./pages/PlayerPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="flex flex-col h-screen bg-gray-900 text-white">
              <NavBar />
              <MainPage />
              <Footer />
            </div>
          }
        ></Route>
        <Route
          path="/teams/:id/:user_season?/:user_page?"
          element={
            <div className="flex flex-col h-screen bg-gray-900 text-white">
              <NavBar />
              <TeamPage></TeamPage>
              <Footer />
            </div>
          }
        ></Route>
        <Route
          path="/contact"
          element={
            <div className="flex flex-col h-screen bg-gray-900 text-white">
              <NavBar />
              <ContactUs></ContactUs>
              <Footer />
            </div>
          }
        ></Route>
        <Route
          path="/standings"
          element={
            <div className="flex flex-col h-screen bg-gray-900 text-white">
              <NavBar />
              <StandingsPage></StandingsPage>
              <Footer />
            </div>
          }
        ></Route>
        <Route
          path="/about"
          element={
            <div className="flex flex-col h-screen bg-gray-900 text-white">
              <NavBar />
              <About></About>
              <Footer />
            </div>
          }
        ></Route>
        <Route
          path="/games/:gameDate/:id"
          element={
            <div className="flex flex-col h-screen bg-gray-900 text-white">
              <NavBar />
              <PlayByPlay></PlayByPlay>
              <Footer />
            </div>
          }
        ></Route>
        <Route
          path="/games/:gameDate?"
          element={
            <div className="flex flex-col h-screen bg-gray-900 text-white">
              <NavBar />
              <LiveGames></LiveGames>
              <Footer />
            </div>
          }
        ></Route>
        <Route
          path="/players/:id"
          element={
            <div className="flex flex-col h-screen bg-gray-900 text-white">
              <NavBar />
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
