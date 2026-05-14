import { useRef, useEffect, useContext } from "react";
import "./FocusEngine.css";
import { FocusContext } from "../../context/FocusContext";

function formatTime(totalSeconds) {
  var m = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  var s = String(totalSeconds % 60).padStart(2, "0");
  return m + ":" + s;
}

function FocusEngine() {
  const {
    workDuration, setWorkDuration,
    breakDuration, setBreakDuration,
    mode, timeLeft, isRunning, sessionActive,
    studyMins, awaySecs, focusScore, pauseCount,
    cameraActive, bannerType, showWarning, setShowWarning,
    globalStream, handleStart, handleStopSession, handleReset,
    modelsLoaded, isManuallyPaused, handlePauseToggle
  } = useContext(FocusContext);

  var videoRef = useRef(null);

  // Attach global stream to local video element
  useEffect(() => {
    if (videoRef.current && globalStream) {
      videoRef.current.srcObject = globalStream;
    }
  }, [globalStream]);

  // Sync video styles based on state
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (!sessionActive) {
      videoRef.current.style.borderColor = "rgba(255,255,255,0.08)";
      videoRef.current.style.boxShadow = "none";
    } else if (mode === "break") {
      videoRef.current.style.borderColor = "var(--border)";
      videoRef.current.style.boxShadow = "none";
    } else if (bannerType === "present") {
      videoRef.current.style.borderColor = "#00c864";
      videoRef.current.style.boxShadow = "0 0 20px rgba(0,200,100,0.3)";
    } else if (bannerType === "absent" || bannerType === "warning") {
      videoRef.current.style.borderColor = "#ff4444";
      videoRef.current.style.boxShadow = "0 0 20px rgba(255,68,68,0.3)";
    }
  }, [bannerType, sessionActive, mode]);

  // (CSV and ICS Exports removed by request)

  // ==================== BANNER CLASS ====================
  var bannerClass = "focus-banner banner-" + bannerType;

  var bannerText = "Loading AI models...";
  if (bannerType === "ready") bannerText = "Ready! Click INITIATE FOCUS to begin";
  if (bannerType === "present") bannerText = "Student Present - Timer Running";
  if (bannerType === "absent") {
    if (showWarning === "multiple") bannerText = "Multiple People! Timer Paused";
    else bannerText = "Student Away - Timer Paused!";
  }
  if (bannerType === "warning") bannerText = "Are you there? Please return!";
  if (bannerType === "error") bannerText = "Error loading models. Please refresh.";
  if (bannerType === "paused") bannerText = "Manual Pause - Timer Stopped";

  
  if (mode === "break" && isRunning) {
    bannerClass = "focus-banner banner-present";
    bannerText = "Break Time - Relax and stretch!";
  }

  return (
    <div className="focus-engine-page">
      <div className="focus-engine-container">

        <div className="focus-engine-header">
          <h1>
            <span className="focus-icon-rocket">🎯</span>{" "}
            <span className="focus-title-text">Focus Engine</span>
          </h1>
        </div>

        <div className="focus-engine-content">

          {/* LEFT: STATS & CONTROLS */}
          <div className="focus-left-panel">
            <div className="focus-stats-panel">
              <h3>📊 SYSTEM STATS</h3>
              <div className="focus-stats-grid">
                <div className="focus-stat-box">
                  <span className="focus-stat-num sage">{studyMins}</span>
                  <span className="focus-stat-label">STUDY MINS</span>
                </div>
                <div className="focus-stat-box">
                  <span className="focus-stat-num red">{awaySecs}</span>
                  <span className="focus-stat-label">AWAY SECS</span>
                </div>
                <div className="focus-stat-box">
                  <span className="focus-stat-num cyan">{focusScore}%</span>
                  <span className="focus-stat-label">FOCUS SCORE</span>
                </div>
                <div className="focus-stat-box">
                  <span className="focus-stat-num white">{pauseCount}</span>
                  <span className="focus-stat-label">PAUSES</span>
                </div>
              </div>
            </div>

            <div className="focus-settings-panel">
              <h3>⚙️ TIMER SETTINGS</h3>
              <div className="focus-settings-row">
                <label>Study Duration (min):</label>
                <input 
                  type="number" 
                  value={workDuration} 
                  onChange={(e) => setWorkDuration(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={sessionActive}
                  className="focus-setting-input"
                />
              </div>
              <div className="focus-settings-row">
                <label>Break Duration (min):</label>
                <select 
                  value={breakDuration} 
                  onChange={(e) => setBreakDuration(parseInt(e.target.value))}
                  disabled={sessionActive}
                  className="focus-setting-select"
                >
                  <option value="5">5 Minutes</option>
                  <option value="10">10 Minutes</option>
                  <option value="15">15 Minutes</option>
                  <option value="20">20 Minutes</option>
                </select>
              </div>
            </div>
          </div>

          {/* RIGHT: CAMERA + TIMER */}
          <div className="focus-main-panel">

            <div className={bannerClass}>
              {bannerType === "loading" && !modelsLoaded && (
                <span className="focus-spinner"></span>
              )}
              {bannerText}
            </div>

            <div className="focus-video-wrap">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="focus-video"
              />
              <div className="focus-cam-badge">
                <span className={"focus-cam-dot " + (cameraActive ? "active" : "")}></span>
                {cameraActive ? "Camera Active" : "Camera Offline"}
              </div>
            </div>

            <div className={`focus-timer ${mode === "break" ? "break-mode" : ""}`}>
              <h2>{formatTime(timeLeft)}</h2>
              <p>{mode === "work" ? "STUDY SESSION" : "BREAK TIME"}</p>
            </div>

            <div className="focus-controls">
              <button
                className="focus-btn-start"
                onClick={handleStart}
                disabled={sessionActive}
              >
                INITIATE FOCUS
              </button>
              <button
                className="focus-btn-pause"
                onClick={handlePauseToggle}
                disabled={!sessionActive || mode === "break"}
              >
                {isManuallyPaused ? "RESUME" : "PAUSE"}
              </button>
              <button
                className="focus-btn-reset"
                onClick={handleReset}
                disabled={!sessionActive}
              >
                RESET
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}


export default FocusEngine;