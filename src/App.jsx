import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";

import Layout from "./components/Layout/Layout";

import StudyTrackerPage from "./pages/StudyTrackerPage/StudyTrackerPage";
import FocusEngine from "./pages/FocusEngine/FocusEngine";
import AISummarizer from "./pages/AISummarizer/AISummarizer";
import AILearningPath from "./pages/AILearningPath/AILearningPath";
import AIStudyCoach from "./components/dashboard/aiStudyCoach/aiStudyCoach";
import Resources from "./pages/Resources/Resources";
import Schedule from "./pages/Schedule/Schedule";
import Support from "./pages/Support/Support";
import Settings from "./pages/Settings/Settings";
import ParentCorner from "./pages/ParentCorner/ParentCorner";
import DashboardAnalyzer from "./pages/DashboardAnalyzer/DashboardAnalyzer";
import { FocusProvider } from "./context/FocusContext";
import { archivePreviousDays } from "./services/analyzerData";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    archivePreviousDays();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC PAGES - chatbot will NOT show here */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* DASHBOARD PAGES - chatbot will show here */}
        <Route 
          path="/dashboard" 
          element={
            <FocusProvider>
              <Layout />
            </FocusProvider>
          }
        >
          <Route index element={<StudyTrackerPage />} />
          <Route path="focus" element={<FocusEngine />} />
          <Route path="ai-summarizer" element={<AISummarizer />} />
          <Route path="generate-path" element={<AILearningPath />} />
          <Route path="ai-study-coach" element={<AIStudyCoach />} />
          <Route path="resources" element={<Resources />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="support" element={<Support />} />
          <Route path="settings" element={<Settings />} />
          <Route path="parent-corner" element={<ParentCorner />} />
          <Route path="analyzer" element={<DashboardAnalyzer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;