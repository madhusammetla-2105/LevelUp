import { useState, useEffect } from "react";
import "./TopNavBar.css";

function TopNavBar() {
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.setItem("levelup_logged_in", "false");
      localStorage.removeItem("levelup_current_user_id");
      localStorage.removeItem("levelup_user_name");
      window.location.href = "/"; // Force refresh and redirect
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-logo">LEVEL UP</h1>
      </div>

      <div className="topbar-right">
        <button className="topbar-icon-btn">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        <button className="topbar-logout-btn" onClick={handleLogout}>
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </header>
  );
}

export default TopNavBar;