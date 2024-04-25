import React from "react";
import "./App.css";
import NavBar from "./components/NavBar";
import MainContent from "./components/MainContent";
import Footer from "./components/Footer";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import TeamPage from "./components/TeamPage";
import ContactUs from "./components/Contact";
import About from "./components/About";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="flex flex-col min-h-screen bg-gray-900 text-white">
              <NavBar />
              <MainContent />
              <Footer />
            </div>
          }
        ></Route>
        <Route
          path="/teams/:id"
          element={
            <div className="flex flex-col min-h-screen bg-gray-900 text-white">
              <NavBar />
              <TeamPage></TeamPage>
              <Footer />
            </div>
          }
        ></Route>
        <Route
          path="/contact"
          element={
            <div className="flex flex-col min-h-screen bg-gray-900 text-white">
              <NavBar />
              <ContactUs></ContactUs>
              <Footer />
            </div>
          }
        ></Route>
        <Route
          path="/about"
          element={
            <div className="flex flex-col min-h-screen bg-gray-900 text-white">
              <NavBar />
              <About></About>
              <Footer />
            </div>
          }
        ></Route>
      </Routes>
    </Router>
  );
}

export default App;
