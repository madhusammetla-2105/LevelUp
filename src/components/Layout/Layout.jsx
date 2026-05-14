import { useEffect, useState, useContext } from "react";
import { Outlet } from "react-router-dom";
import { FocusContext } from "../../context/FocusContext";

import TopNavBar from "../TopNavBar/TopNavBar";
import SideNavBar from "../SideNavBar/SideNavBar";
import RightPanel from "../RightPanel/RightPanel";
import "./Layout.css";

function Layout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { showWarning, setShowWarning } = useContext(FocusContext);

  useEffect(function () {
    const loginStatus = localStorage.getItem("levelup_logged_in") === "true";
    setIsLoggedIn(loginStatus);
  }, []);

  return (
    <div className="layout">
      <TopNavBar />
      <SideNavBar />

      <main className="layout-main">
        <Outlet />
      </main>

      <RightPanel />

      {showWarning && (
        <div className="global-overlay">
          <div className="global-modal">
            <span className="warning-icon-large">
              {showWarning === "multiple" ? "👥" : "⚠️"}
            </span>
            <h2 className="modal-title-critical">
              {showWarning === "multiple" ? "Multiple People Detected" : "Are You There?"}
            </h2>
            <p className="modal-text">
              {showWarning === "multiple" 
                ? "Our AI detected more than one person in the camera view. Focus Engine requires solo study to maintain integrity. The timer has been paused."
                : "We can't detect your presence. Please return to your study position or the timer will pause!"}
            </p>
            <button
              className="modal-btn-primary"
              onClick={() => setShowWarning(false)}
            >
              I'M BACK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Layout;