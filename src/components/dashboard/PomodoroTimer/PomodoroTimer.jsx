import { useEffect, useRef, useState } from "react";
import "./PomodoroTimer.css";

const TOTAL_TIME = 25 * 60;

function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [running, setRunning] = useState(false);
  const [selectedTask, setSelectedTask] = useState("Advanced Thermodynamics Revision");
  const [showTasks, setShowTasks] = useState(false);

  const intervalRef = useRef(null);

  const tasks = [
    "Advanced Thermodynamics Revision",
    "Data Structures Practice",
    "Calculus II Assignment",
    "DBMS Preparation",
    "Physics Problem Solving",
  ];

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            
            // Update stats
            const currentUserId = localStorage.getItem("levelup_current_user_id");
            if (currentUserId) {
              const users = JSON.parse(localStorage.getItem("lu_users") || "[]");
              const userIndex = users.findIndex(u => u.id === currentUserId);
              if (userIndex !== -1) {
                users[userIndex].sessions = (users[userIndex].sessions || 0) + 1;
                users[userIndex].hours = (users[userIndex].hours || 0) + (TOTAL_TIME / 3600);
                localStorage.setItem("lu_users", JSON.stringify(users));
                window.dispatchEvent(new Event("user-stats-updated"));
              }
            }

            return TOTAL_TIME;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [running]);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = (TOTAL_TIME - timeLeft) / TOTAL_TIME;
  const offset = circumference - progress * circumference;

  const handleReset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setTimeLeft(TOTAL_TIME);
  };

  return (
    <section className="pomodoro-card">
      <div className="pomodoro-top-icon">
        <span className="material-symbols-outlined">fullscreen</span>
      </div>

      <div className="pomodoro-circle-wrap">
        <svg className="pomodoro-svg" viewBox="0 0 300 300">
          <circle
            className="pomodoro-bg-ring"
            cx="150"
            cy="150"
            r={radius}
          />
          <circle
            className="pomodoro-progress-ring"
            cx="150"
            cy="150"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>

        <div className="pomodoro-time">
          <h2>{minutes}:{seconds}</h2>
          <p>{running ? "FOCUSING..." : "READY"}</p>
        </div>
      </div>

      <div className="pomodoro-actions">
        <button className="pomodoro-btn primary" onClick={() => setRunning(!running)}>
          <span className="material-symbols-outlined">
            {running ? "pause" : "play_arrow"}
          </span>
          {running ? "PAUSE" : "START"}
        </button>

        <button className="pomodoro-btn secondary" onClick={handleReset}>
          <span className="material-symbols-outlined">stop</span>
          RESET
        </button>
      </div>

      <div className="objective-box" onClick={() => setShowTasks(!showTasks)}>
        <div className="objective-left">
          <span className="material-symbols-outlined objective-check">task_alt</span>
          <div>
            <small>CURRENT OBJECTIVE</small>
            <strong>{selectedTask}</strong>
          </div>
        </div>

        <span className="material-symbols-outlined">
          {showTasks ? "expand_less" : "expand_more"}
        </span>
      </div>

      {showTasks && (
        <div className="objective-dropdown">
          {tasks.map((task) => (
            <div
              key={task}
              className="objective-item"
              onClick={() => {
                setSelectedTask(task);
                setShowTasks(false);
              }}
            >
              {task}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default PomodoroTimer;