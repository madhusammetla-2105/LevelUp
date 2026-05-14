import { NavLink } from "react-router-dom";
import "./SideNavBar.css";

var mainLinks = [
  { icon: "grid_view", label: "Study Tracker", path: "/dashboard" },
  { icon: "auto_awesome", label: "AI Summarizer", path: "/dashboard/ai-summarizer" },
  { icon: "route", label: "Generate Path", path: "/dashboard/generate-path" },
  { icon: "smart_toy", label: "AI Study Coach", path: "/dashboard/ai-study-coach" },
  { icon: "menu_book", label: "Resources", path: "/dashboard/resources" },
  { icon: "calendar_today", label: "Schedule", path: "/dashboard/schedule" },
  { icon: "analytics", label: "Dashboard Analyzer", path: "/dashboard/analyzer" },
];

var bottomLinks = [
  { icon: "shield_lock", label: "Parent Corner", path: "/dashboard/parent-corner" },
  { icon: "help", label: "Support", path: "/dashboard/support" },
  { icon: "settings", label: "Settings", path: "/dashboard/settings" },
];

function SideNavBar() {
  return (
    <aside className="sidebar">

      <nav className="sidebar-nav">
        {mainLinks.map(function (item) {
          return (
            <NavLink key={item.path} to={item.path} end={item.path === "/dashboard"} className="sidebar-link">
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="sidebar-bottom">
        {bottomLinks.map(function (item) {
          return (
            <NavLink key={item.path} to={item.path} className="sidebar-link">
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}

export default SideNavBar;