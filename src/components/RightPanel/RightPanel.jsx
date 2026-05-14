import { useState, useEffect } from "react";
import "./RightPanel.css";

function RightPanel() {
  var [profile, setProfile] = useState(function () {
    const currentUserId = localStorage.getItem("levelup_current_user_id");
    const users = JSON.parse(localStorage.getItem("lu_users") || "[]");
    const currentUser = users.find(u => u.id === currentUserId);

    if (currentUser) {
      return {
        name: currentUser.name,
        email: currentUser.email,
        xp: currentUser.xp || 100,
        avatar: currentUser.avatar || "👨‍🎓",
        id: currentUser.id,
        stats: {
          streak: currentUser.streak || 0,
          hours: currentUser.hours || 0,
          tasks: currentUser.tasks || 0,
          sessions: currentUser.sessions || 0
        }
      };
    }

    return { name: "Student Name", email: "student@levelup.com", xp: 100, avatar: "", id: "LU-0000", stats: { streak: 0, hours: 0, tasks: 0, sessions: 0 } };
  });

  useEffect(() => {
    const handleStatsUpdate = () => {
      const currentUserId = localStorage.getItem("levelup_current_user_id");
      const users = JSON.parse(localStorage.getItem("lu_users") || "[]");
      const currentUser = users.find(u => u.id === currentUserId);
      if (currentUser) {
        setProfile(prev => ({
          ...prev,
          stats: {
            streak: currentUser.streak || 0,
            hours: currentUser.hours || 0,
            tasks: currentUser.tasks || 0,
            sessions: currentUser.sessions || 0
          }
        }));
      }
    };

    window.addEventListener("user-stats-updated", handleStatsUpdate);
    return () => window.removeEventListener("user-stats-updated", handleStatsUpdate);
  }, []);

  var level = Math.max(1, Math.floor(profile.xp / 250));
  var xpPercent = (profile.xp % 1000) / 10;

  return (
    <aside className="rp-panel">
      <div className="rp-section rp-profile-section">
        <span className="rp-label">PROFILE</span>
        <div className="rp-profile-top">
          <div className="rp-avatar-wrap">
            <div className="rp-avatar">
              <span className="material-symbols-outlined" style={{fontSize: '40px'}}>person</span>
            </div>
            <span className="rp-level-badge">LVL {level}</span>
          </div>
          <div className="rp-profile-info">
            <span className="rp-username">STUDENT NAME</span>
            <span className="rp-rank">ID: {profile.id}</span>
            <span className="rp-email">{profile.email}</span>
          </div>
        </div>
        <div className="rp-xp-row">
          <span className="rp-xp-label">Experience Points</span>
          <span className="rp-xp-value">{profile.xp} / 1,000 XP</span>
        </div>
        <div className="rp-xp-bar">
          <div className="rp-xp-fill" style={{ width: xpPercent + "%" }}></div>
        </div>
      </div>

      <div className="rp-section">
        <span className="rp-label">STATS</span>
        <div className="rp-stats-grid">
          <div className="rp-stat-card">
            <span className="rp-stat-value">{profile.stats.streak} <span className="rp-stat-emoji">🔥</span></span>
            <span className="rp-stat-label">DAY STREAK</span>
          </div>
          <div className="rp-stat-card">
            <span className="rp-stat-value">{profile.stats.hours.toFixed(1)}h</span>
            <span className="rp-stat-label">HOURS FOCUS</span>
          </div>
          <div className="rp-stat-card">
            <span className="rp-stat-value">{profile.stats.tasks}</span>
            <span className="rp-stat-label">TASKS DONE</span>
          </div>
          <div className="rp-stat-card">
            <span className="rp-stat-value">{profile.stats.sessions}</span>
            <span className="rp-stat-label">SESSIONS</span>
          </div>
        </div>
      </div>


    </aside>
  );
}

export default RightPanel;