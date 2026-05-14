import { useEffect, useState } from "react";
import "./StudyTime.css";

function StudyTime() {
    const [studiedSeconds, setStudiedSeconds] = useState(function () {
        const saved = localStorage.getItem("dashboard_studied_seconds");
        return saved ? Number(saved) : 0;
    });

    const [studyGoalMinutes, setStudyGoalMinutes] = useState(function () {
        const savedGoal = localStorage.getItem("dashboard_study_goal_minutes");
        return savedGoal ? Number(savedGoal) : 20;
    });

    const [currentSessionSeconds, setCurrentSessionSeconds] = useState(function () {
        const saved = localStorage.getItem("dashboard_current_session_seconds");
        return saved ? Number(saved) : 0;
    });

    const [isRunning, setIsRunning] = useState(false);

    function notifyUpdate() {
        window.dispatchEvent(new Event("study-session-updated"));
    }

    useEffect(
        function () {
            localStorage.setItem("dashboard_studied_seconds", studiedSeconds);
            notifyUpdate();
        },
        [studiedSeconds]
    );

    useEffect(
        function () {
            localStorage.setItem("dashboard_study_goal_minutes", studyGoalMinutes);
            notifyUpdate();
        },
        [studyGoalMinutes]
    );

    useEffect(
        function () {
            localStorage.setItem(
                "dashboard_current_session_seconds",
                currentSessionSeconds
            );
            notifyUpdate();
        },
        [currentSessionSeconds]
    );

    useEffect(
        function () {
            let interval = null;

            if (isRunning) {
                interval = setInterval(function () {
                    setCurrentSessionSeconds(function (prev) {
                        return prev + 1;
                    });

                    setStudiedSeconds(function (prev) {
                        return prev + 1;
                    });
                }, 1000);
            }

            return function () {
                if (interval) clearInterval(interval);
            };
        },
        [isRunning]
    );

    const progress = Math.min(
        (studiedSeconds / (studyGoalMinutes * 60)) * 100,
        100
    );

    const studiedMinutes = Math.floor(studiedSeconds / 60);
    const sessionMinutes = Math.floor(currentSessionSeconds / 60);
    const sessionSeconds = currentSessionSeconds % 60;

    function saveLastSession() {
        if (currentSessionSeconds <= 0) return;

        const lastSessionData = {
            durationSeconds: currentSessionSeconds,
            goalMinutes: studyGoalMinutes,
            completedPercent: Math.min(
                Math.round((currentSessionSeconds / (studyGoalMinutes * 60)) * 100),
                100
            ),
            completedAt: new Date().toISOString(),
        };

        localStorage.setItem(
            "dashboard_last_session",
            JSON.stringify(lastSessionData)
        );

        notifyUpdate();
    }

    function handleStartPause() {
        setIsRunning(function (prev) {
            return !prev;
        });
    }

    function handleReset() {
        saveLastSession();
        setIsRunning(false);
        setStudiedSeconds(0);
        setCurrentSessionSeconds(0);
        localStorage.setItem("dashboard_studied_seconds", 0);
        localStorage.setItem("dashboard_current_session_seconds", 0);
        notifyUpdate();
    }

    function increaseGoal() {
        setStudyGoalMinutes(function (prev) {
            return Math.min(prev + 1, 480);
        });
    }

    function decreaseGoal() {
        setStudyGoalMinutes(function (prev) {
            return Math.max(prev - 1, 1);
        });
    }

    return (
        <section className="study-time-card">
            <div className="study-time-header">
                <h2>Study Time</h2>

                <div className="study-time-goal-box">
                    <span className="goal-label">GOAL:</span>

                    <div className="goal-value-control">
                        <span className="goal-value">{studyGoalMinutes}</span>

                        <div className="goal-arrows">
                            <button onClick={increaseGoal} type="button">
                                <span className="material-symbols-outlined">
                                    keyboard_arrow_up
                                </span>
                            </button>

                            <button onClick={decreaseGoal} type="button">
                                <span className="material-symbols-outlined">
                                    keyboard_arrow_down
                                </span>
                            </button>
                        </div>
                    </div>

                    <span className="goal-label">MIN</span>
                </div>
            </div>

            <div className="study-time-progress-bar">
                <div
                    className="study-time-progress-fill"
                    style={{ width: progress + "%" }}
                ></div>
                <span className="study-time-progress-text">
                    {Math.round(progress)}%
                </span>
            </div>

            <p className="study-time-status">
                <span>{studiedMinutes}M</span> OF <span>{studyGoalMinutes}M</span>{" "}
                COMPLETED
            </p>

            <div className="study-time-session-box">
                <h1>
                    {sessionMinutes}m {sessionSeconds}s
                </h1>

                <p>CURRENT SESSION</p>

                <div className="study-time-buttons">
                    <button className="start-btn" onClick={handleStartPause} type="button">
                        {isRunning ? "PAUSE" : "START / PAUSE"}
                    </button>

                    <button className="reset-btn" onClick={handleReset} type="button">
                        RESET
                    </button>
                </div>
            </div>
        </section>
    );
}

export default StudyTime;