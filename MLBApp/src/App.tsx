import "./App.css";
import NavBar from "./components/NavBar";
import MainContent from "./pages/MainPage";
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

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="flex flex-col h-screen bg-gray-900 text-white">
              <NavBar />
              <MainContent />
              <Footer />
            </div>
          }
        ></Route>
        <Route
          path="/teams/:id"
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
            <div className="flex flex-col min-h-screen bg-gray-900 text-white">
              <NavBar />
              <PlayByPlay></PlayByPlay>
              <Footer />
            </div>
          }
        ></Route>
        <Route
          path="/games"
          element={
            <div className="flex flex-col h-screen bg-gray-900 text-white">
              <NavBar />
              <LiveGames></LiveGames>
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
