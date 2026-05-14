import { useEffect, useState } from "react";
import "./SessionRecap.css";

function formatDuration(seconds) {
  const totalSeconds = Number(seconds || 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return hours + "h " + minutes + "m";
  }

  return minutes + "m " + secs + "s";
}

function formatCompletedTime(dateString) {
  if (!dateString) return "--";

  const date = new Date(dateString);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SessionRecap() {
  const [lastSession, setLastSession] = useState(function () {
    const saved = localStorage.getItem("dashboard_last_session");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(function () {
    function syncLastSession() {
      const saved = localStorage.getItem("dashboard_last_session");
      setLastSession(saved ? JSON.parse(saved) : null);
    }

    syncLastSession();

    window.addEventListener("study-session-updated", syncLastSession);

    return function () {
      window.removeEventListener("study-session-updated", syncLastSession);
    };
  }, []);

  return (
    <section className="session-recap-card">
      <h4>LAST SESSION RECAP</h4>

      {lastSession ? (
        <>
          <div className="session-recap-row">
            <h2>{formatDuration(lastSession.durationSeconds)}</h2>
            <span>{lastSession.completedPercent}% of goal</span>
          </div>

          <div className="session-recap-progress">
            <div
              className="session-recap-progress-fill"
              style={{ width: lastSession.completedPercent + "%" }}
            ></div>
          </div>

          <div className="session-recap-details">
            <p>
              Completed at{" "}
              <span>{formatCompletedTime(lastSession.completedAt)}</span>
            </p>

            <p>
              Goal was <span>{lastSession.goalMinutes} min</span>
            </p>
          </div>
        </>
      ) : (
        <div className="session-empty-state">
          <h2>--</h2>
          <p>No session saved yet. Reset Study Time after a session.</p>
        </div>
      )}
    </section>
  );
}

export default SessionRecap;