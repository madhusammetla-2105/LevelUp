import StudyTracker from "../../components/dashboard/StudyTracker/StudyTracker";
import FocusEngine from "../FocusEngine/FocusEngine";
import "./StudyTrackerPage.css";

function StudyTrackerPage() {
  return (
    <div className="dashboard-page unified-study-page">
      <div className="dashboard-grid">
        <FocusEngine />
        <StudyTracker />
      </div>
    </div>
  );
}

export default StudyTrackerPage;