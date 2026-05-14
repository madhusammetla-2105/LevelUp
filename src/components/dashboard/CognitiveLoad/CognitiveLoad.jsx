import { useEffect, useState } from "react";
import "./CognitiveLoad.css";

function getLoadData(sessionSeconds) {
  const minutes = Math.floor(sessionSeconds / 60);

  if (minutes < 10) {
    return {
      level: 1,
      title: "Warm-up mode.",
      message: "Your brain is settling in. Good time for easy revision.",
      next: 10 - minutes,
    };
  }

  if (minutes < 25) {
    return {
      level: 2,
      title: "Focus building.",
      message: "Concentration is improving.",
      next: 25 - minutes,
    };
  }

  if (minutes < 50) {
    return {
      level: 3,
      title: "Optimized for heavy logic.",
      message: "This is your strongest study zone.",
      next: 50 - minutes,
    };
  }

  if (minutes < 80) {
    return {
      level: 4,
      title: "High load detected.",
      message: "Plan a break soon.",
      next: 80 - minutes,
    };
  }

  return {
    level: 5,
    title: "Break recommended.",
    message: "Mental fatigue is rising.",
    next: 0,
  };
}

function CognitiveLoad() {
  const [sessionSeconds, setSessionSeconds] = useState(function () {
    const saved = localStorage.getItem("dashboard_current_session_seconds");
    return saved ? Number(saved) : 0;
  });

  useEffect(function () {
    function syncSession() {
      const saved = localStorage.getItem("dashboard_current_session_seconds");
      setSessionSeconds(saved ? Number(saved) : 0);
    }

    syncSession();

    const interval = setInterval(syncSession, 1000);
    window.addEventListener("study-session-updated", syncSession);

    return function () {
      clearInterval(interval);
      window.removeEventListener("study-session-updated", syncSession);
    };
  }, []);

  const loadData = getLoadData(sessionSeconds);
  const currentMinutes = Math.floor(sessionSeconds / 60);

  return (
    <section className="cognitive-load-card">
      <div className="cognitive-load-header">
        <h4>COGNITIVE LOAD</h4>
        <span className="material-symbols-outlined">neurology</span>
      </div>

      <div className="cognitive-load-bars">
        {[1, 2, 3, 4, 5].map(function (bar) {
          return (
            <div
              key={bar}
              className={
                bar <= loadData.level
                  ? "cognitive-load-bar active"
                  : "cognitive-load-bar"
              }
            ></div>
          );
        })}
      </div>

      <div className="cognitive-load-info">
        <p>
          Current session: <span>{currentMinutes} min</span>
        </p>

        <p>
          <span>{loadData.title}</span> {loadData.message}
        </p>

        {loadData.next > 0 ? (
          <p>
            Next level in <span>{loadData.next} min</span>
          </p>
        ) : (
          <p className="warning">Break time recommended now</p>
        )}
      </div>
    </section>
  );
}

export default CognitiveLoad;