import "./Settings.css";

function Settings() {
  return (
    <div className="settings-page">
      <div className="settings-container">
        <h1>Settings</h1>
        <p className="settings-subtitle">Customize your experience</p>

        <div className="settings-grid">
          <div className="settings-card">
            <div className="settings-card-icon">🎨</div>
            <h3>Theme</h3>
            <p>Dark mode is always on for focus</p>
            <div className="settings-status">Active: Dark Theme</div>
          </div>

          <div className="settings-card">
            <div className="settings-card-icon">🔔</div>
            <h3>Notifications</h3>
            <p>Configure alert preferences</p>
            <div className="settings-status">All notifications on</div>
          </div>

          <div className="settings-card">
            <div className="settings-card-icon">💾</div>
            <h3>Data & Storage</h3>
            <p>Clear cache or export data</p>
            <button
              className="settings-card-btn danger"
              onClick={function () {
                if (confirm("Clear all saved data?")) {
                  localStorage.clear();
                  alert("Data cleared!");
                  window.location.reload();
                }
              }}
            >
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;