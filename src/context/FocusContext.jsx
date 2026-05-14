import React, { createContext, useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import { logActivity } from "../services/analyzerData";

export const FocusContext = createContext();

var MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model";

export function FocusProvider({ children }) {
  var hiddenVideoRef = useRef(null);
  var timerRef = useRef(null);
  var detectionRef = useRef(null);
  var warnTimerRef = useRef(null);
  var pauseTimerRef = useRef(null);
  var faceDetectedRef = useRef(false);
  var studyRef = useRef(0);
  var awayRef = useRef(0);
  var modelsLoadedRef = useRef(false);
  var streamRef = useRef(null);

  var [workDuration, setWorkDuration] = useState(25);
  var [breakDuration, setBreakDuration] = useState(5);
  var [mode, setMode] = useState("work");

  var [timeLeft, setTimeLeft] = useState(workDuration * 60);
  var [isRunning, setIsRunning] = useState(false);
  var [sessionActive, setSessionActive] = useState(false);

  var [studyMins, setStudyMins] = useState(0);
  var [awaySecs, setAwaySecs] = useState(0);
  var [focusScore, setFocusScore] = useState(100);
  var [pauseCount, setPauseCount] = useState(0);
  var [isManuallyPaused, setIsManuallyPaused] = useState(false);

  var [cameraActive, setCameraActive] = useState(false);
  var [bannerType, setBannerType] = useState("loading");
  var [showWarning, setShowWarning] = useState(false);

  // Expose stream so components can attach it to their own video elements
  var [globalStream, setGlobalStream] = useState(null);

  useEffect(() => {
    if (!sessionActive) {
      setTimeLeft(workDuration * 60);
      setMode("work");
    }
  }, [workDuration, sessionActive]);

  useEffect(function () {
    async function loadModels() {
      try {
        setBannerType("loading");
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        modelsLoadedRef.current = true;
        setBannerType("ready");
      } catch (err) {
        console.error("Model error:", err);
        setBannerType("error");
      }
    }
    loadModels();
  }, []);

  async function startCamera() {
    try {
      var stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      streamRef.current = stream;
      setGlobalStream(stream);

      if (hiddenVideoRef.current) {
        hiddenVideoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      return true;
    } catch (err) {
      console.error("Camera error:", err);
      alert("Cannot access camera. Please allow camera permission.");
      return false;
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      var tracks = streamRef.current.getTracks();
      for (var i = 0; i < tracks.length; i++) {
        tracks[i].stop();
      }
      streamRef.current = null;
      setGlobalStream(null);
    }
    if (hiddenVideoRef.current) {
      hiddenVideoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }

  async function detectFace() {
    if (!modelsLoadedRef.current) return 0;
    if (!hiddenVideoRef.current) return 0;
    if (!hiddenVideoRef.current.srcObject) return 0;
    if (!hiddenVideoRef.current.videoWidth) return 0;

    try {
      var detections = await faceapi.detectAllFaces(
        hiddenVideoRef.current,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 320,
          scoreThreshold: 0.5,
        })
      );
      return detections.length;
    } catch (err) {
      return 0;
    }
  }

  function clearWarningTimers() {
    if (warnTimerRef.current) {
      clearTimeout(warnTimerRef.current);
      warnTimerRef.current = null;
    }
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
  }

  function startDetectionLoop() {
    detectionRef.current = setInterval(async function () {
      if (mode === "break") return;

      var numPeople = await detectFace();

      if (numPeople === 1) {
        // Normal state
        clearWarningTimers();
        setShowWarning(false);
        setBannerType("present");

        if (!faceDetectedRef.current) {
          faceDetectedRef.current = true;
          setIsRunning(true);
        }
      } else if (numPeople > 1) {
        // MULTIPLE PEOPLE - STOP IMMEDIATELY
        clearWarningTimers();
        faceDetectedRef.current = false;
        setIsRunning(false);
        setShowWarning("multiple");
        setBannerType("absent");
        setPauseCount(p => p + 1);
      } else {
        // NO ONE PRESENT
        if (faceDetectedRef.current) {
          if (!warnTimerRef.current) {
            warnTimerRef.current = setTimeout(function () {
              setShowWarning("away");
              setBannerType("warning");
            }, 3000);
          }

          if (!pauseTimerRef.current) {
            pauseTimerRef.current = setTimeout(function () {
              faceDetectedRef.current = false;
              setIsRunning(false);
              setBannerType("absent");
              setPauseCount(p => p + 1);
            }, 8000);
          }
        }
      }
    }, 2000);
  }


  function stopDetectionLoop() {
    if (detectionRef.current) {
      clearInterval(detectionRef.current);
      detectionRef.current = null;
    }
    clearWarningTimers();
    setShowWarning(false);
  }

  useEffect(function () {
    if (!isRunning || !sessionActive) return;

    timerRef.current = setInterval(function () {
      setTimeLeft(function (prev) {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          
          if (mode === "work") {
            // Focus session completed! Update stats:
            const currentUserId = localStorage.getItem("levelup_current_user_id");
            if (currentUserId) {
              const users = JSON.parse(localStorage.getItem("lu_users") || "[]");
              const userIndex = users.findIndex(u => u.id === currentUserId);
              if (userIndex !== -1) {
                users[userIndex].sessions = (users[userIndex].sessions || 0) + 1;
                users[userIndex].hours = (users[userIndex].hours || 0) + (workDuration / 60);
                localStorage.setItem("lu_users", JSON.stringify(users));
                window.dispatchEvent(new Event("user-stats-updated"));
              }
            }

            setMode("break");
            stopDetectionLoop();
            setBannerType("ready");
            logActivity("Focus Engine", `Completed focus session: ${workDuration} minutes`, workDuration);
            return breakDuration * 60;
          } else {
            setMode("work");
            faceDetectedRef.current = false;
            setIsRunning(false);
            setBannerType("ready");
            return workDuration * 60;
          }
        }
        return prev - 1;
      });
      
      if (mode === "work") {
        studyRef.current = studyRef.current + 1;
      }
    }, 1000);

    return function () {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, sessionActive, mode, breakDuration, workDuration]);

  useEffect(function () {
    var awayInterval = null;
    if (sessionActive && !isRunning && !faceDetectedRef.current && mode === "work" && !isManuallyPaused) {
      awayInterval = setInterval(function () {
        awayRef.current = awayRef.current + 1;
        setAwaySecs(awayRef.current);
      }, 1000);
    }
    return function () {
      if (awayInterval) clearInterval(awayInterval);
    };
  }, [isRunning, sessionActive, mode]);

  useEffect(function () {
    setStudyMins(Math.floor(studyRef.current / 60));
    var total = studyRef.current + awayRef.current;
    if (total === 0) {
      setFocusScore(100);
    } else {
      setFocusScore(Math.round((studyRef.current / total) * 100));
    }
  }, [timeLeft, isRunning]);

  async function handleStart() {
    if (!modelsLoadedRef.current) {
      alert("Please wait for AI models to load!");
      return;
    }
    setBannerType("loading");
    var camOk = await startCamera();
    if (!camOk) {
      setBannerType("error");
      return;
    }
    setTimeLeft(workDuration * 60);
    setMode("work");
    studyRef.current = 0;
    awayRef.current = 0;
    faceDetectedRef.current = false;
    setStudyMins(0);
    setAwaySecs(0);
    setFocusScore(100);
    setPauseCount(0);
    setIsManuallyPaused(false);
    setSessionActive(true);
    setIsRunning(true);
    setBannerType("present");
    startDetectionLoop();
    logActivity("Focus Engine", `Initiated focus session: ${workDuration} minutes`, 1);
  }

  function handlePauseToggle() {
    if (!sessionActive || mode === "break") return;

    if (isManuallyPaused) {
      // Resume
      setIsManuallyPaused(false);
      setBannerType("present"); 
      startDetectionLoop();
    } else {
      // Pause
      setIsManuallyPaused(true);
      setIsRunning(false);
      stopDetectionLoop();
      setBannerType("paused");
    }
  }

  function handleStopSession() {
    stopDetectionLoop();
    stopCamera();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
    setSessionActive(false);
    setBannerType("ready");
    logActivity("Focus Engine", `Stopped focus session. Total focused: ${studyMins} minutes`, studyMins);
  }

  function handleReset() {
    if (!sessionActive) return;
    if (confirm("Reset the timer? All progress will be lost.")) {
      handleStopSession();
      setMode("work");
      setTimeLeft(workDuration * 60);
      studyRef.current = 0;
      awayRef.current = 0;
      setStudyMins(0);
      setAwaySecs(0);
      setFocusScore(100);
      setPauseCount(0);
      setIsManuallyPaused(false);
    }
  }

  const value = {
    workDuration, setWorkDuration,
    breakDuration, setBreakDuration,
    mode, timeLeft, isRunning, sessionActive,
    studyMins, awaySecs, focusScore, pauseCount,
    cameraActive, bannerType, showWarning, setShowWarning,
    globalStream, handleStart, handleStopSession, handleReset,
    isManuallyPaused, handlePauseToggle,
    modelsLoaded: modelsLoadedRef.current
  };

  return (
    <FocusContext.Provider value={value}>
      <video
        ref={hiddenVideoRef}
        autoPlay
        muted
        playsInline
        style={{ display: "none" }} // HIDDEN BACKGROUND VIDEO
      />
      {children}
    </FocusContext.Provider>
  );
}
