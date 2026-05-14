import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PinModal from './PinModal';
import { 
  getAllLogs, getLogsForDate, getWeeklyStats, calculateHealthScore, 
  getDailyGoal, setDailyGoal, checkLastActivityHours, getFocusAverage 
} from '../../services/analyzerData';
import './ParentCorner.css';

const ParentCorner = () => {
  const [unlocked, setUnlocked] = useState(false);
  const [logs, setLogs] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [goal, setGoal] = useState(getDailyGoal());
  const [pinFlow, setPinFlow] = useState({ active: false, step: 1, current: '', new: '', confirm: '' });
  const [toast, setToast] = useState(null);
  
  const dashboardRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = () => {
      const todayLogs = getLogsForDate(dayjs().format('YYYY-MM-DD'));
      setLogs(todayLogs);
      setWeeklyData(getWeeklyStats());
    };
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Aggregated Stats
  const totalMins = logs.reduce((acc, l) => acc + l.durationInMinutes, 0);
  const healthScore = calculateHealthScore(logs);
  const focusAvg = getFocusAverage(logs);
  const activeSections = [...new Set(logs.map(l => l.sectionName))];
  
  const COLORS = ['#2d5a27', '#4a6a4a', '#6b8f71', '#9db5a0', '#c8e6c8'];
  
  const usageData = activeSections.map(name => ({
    name,
    value: logs.filter(l => l.sectionName === name).reduce((acc, l) => acc + l.durationInMinutes, 0) || 5
  }));

  // Alerts Logic
  const getAlerts = () => {
    const alerts = [];
    const lastActiveHrs = checkLastActivityHours();
    
    if (lastActiveHrs > 48) alerts.push({ type: 'critical', icon: 'error', message: 'No study session logged in over 48 hours.' });
    if (totalMins < 60 && dayjs().hour() >= 18) alerts.push({ type: 'warning', icon: 'warning', message: 'Study time is below 1 hour and it is past 6 PM.' });
    if (focusAvg < 50) alerts.push({ type: 'warning', icon: 'psychology', message: 'Average focus score has dropped below 50%.' });
    if (totalMins >= goal * 60) alerts.push({ type: 'success', icon: 'check_circle', message: 'Daily study goal exceeded! Great job.' });
    
    const resourceLogs = logs.filter(l => l.sectionName === 'Resources');
    if (resourceLogs.length === 0 && lastActiveHrs > 72) alerts.push({ type: 'warning', icon: 'menu_book', message: 'Resources section has not been opened in 3 days.' });
    
    return alerts;
  };

  const activeAlerts = getAlerts();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleGoalChange = (val) => {
    const newGoal = Number(val);
    setGoal(newGoal);
    setDailyGoal(newGoal);
    showToast(`Daily goal updated to ${newGoal} hours`);
  };

  const handlePinChange = () => {
    const savedPin = localStorage.getItem('parent_pin') || '1234';
    if (pinFlow.step === 1) {
      if (pinFlow.current === savedPin) {
        setPinFlow({ ...pinFlow, step: 2 });
      } else {
        showToast("Incorrect current PIN");
      }
    } else if (pinFlow.step === 2) {
      if (pinFlow.new.length === 4) {
        setPinFlow({ ...pinFlow, step: 3 });
      }
    } else if (pinFlow.step === 3) {
      if (pinFlow.new === pinFlow.confirm) {
        localStorage.setItem('parent_pin', pinFlow.new);
        setPinFlow({ active: false, step: 1, current: '', new: '', confirm: '' });
        showToast("PIN changed successfully!");
      } else {
        showToast("PINs do not match");
      }
    }
  };

  const exportPDF = async () => {
    const element = dashboardRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`LevelUp-ParentReport-${dayjs().format('MMM-DD-YYYY')}.pdf`);
  };

  if (!unlocked) {
    return <PinModal onUnlock={() => setUnlocked(true)} onForgotPin={() => alert('Contact support@levelup.com')} />;
  }

  return (
    <div className="parent-corner-container" ref={dashboardRef}>
      {toast && <div className="toast-notification">{toast}</div>}
      
      <header className="parent-header">
        <div className="header-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--peacock-green)', display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>arrow_back</span>
            </button>
            <h1>Parent Corner</h1>
          </div>
          <div className="goal-status">
            <div className="timer-display">
              <span className="material-symbols-outlined">schedule</span>
              <strong>{Math.floor(totalMins / 60)}h {totalMins % 60}m</strong>
              <span> / {goal}h Goal</span>
            </div>
            <div className="progress-mini">
              <div className="progress-fill" style={{ width: `${Math.min((totalMins/(goal*60))*100, 100)}%` }}></div>
            </div>
          </div>
        </div>
        <p>Dynamic monitoring of student productivity and learning health.</p>
      </header>

      {/* Health & Quick Stats */}
      <section className="stats-grid">
        <div className="stat-card health-score-card">
          <div className="health-header">
            <h3>Learning Health</h3>
            <span className={`grade-tag grade-${healthScore >= 80 ? 'a' : 'b'}`}>
              {healthScore >= 90 ? 'A' : healthScore >= 75 ? 'B' : healthScore >= 60 ? 'C' : 'F'}
            </span>
          </div>
          <div className="gauge-container">
             <svg viewBox="0 0 36 36" className="circular-chart green">
                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="circle" strokeDasharray={`${healthScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <text x="18" y="20.35" className="percentage">{healthScore}</text>
              </svg>
          </div>
        </div>
        <div className="stat-card">
          <span className="material-symbols-outlined stat-icon">psychology</span>
          <div className="stat-content">
            <h3>Focus Average</h3>
            <div className="stat-value">{focusAvg}%</div>
            <p>Consistency score</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="material-symbols-outlined stat-icon">trending_up</span>
          <div className="stat-content">
            <h3>Section Diversity</h3>
            <div className="stat-value">{activeSections.length}</div>
            <p>Sections used today</p>
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="charts-section">
        <div className="chart-card large">
          <h3>Weekly Study Hours</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours" fill="#2d5a27" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Feature Usage Today</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={usageData} innerRadius={60} outerRadius={80} dataKey="value">
                {usageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="usage-legend">
            {usageData.map((d, i) => (
              <div key={i} className="legend-item">
                <span className="dot" style={{background: COLORS[i % COLORS.length]}}></span>
                <span>{d.name} ({d.value}m)</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alerts */}
      <section className="alerts-section card">
        <h3><span className="material-symbols-outlined">notifications_active</span> Parent Alerts</h3>
        <div className="alerts-list">
          {activeAlerts.length === 0 ? (
            <div className="alert-item success">
              <span className="material-symbols-outlined">check_circle</span>
              <p>All good! Your child is on track today.</p>
            </div>
          ) : (
            activeAlerts.map((alert, i) => (
              <div key={i} className={`alert-item ${alert.type}`}>
                <span className="material-symbols-outlined">{alert.icon}</span>
                <p>{alert.message}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Settings & Export */}
      <section className="bottom-grid">
        <div className="settings-panel card">
          <h3><span className="material-symbols-outlined">settings</span> Dashboard Settings</h3>
          <div className="setting-group">
            <label>Daily Study Goal (Hours)</label>
            <div className="goal-setter">
              <button onClick={() => handleGoalChange(Math.max(1, goal - 1))}>-</button>
              <input type="number" value={goal} readOnly />
              <button onClick={() => handleGoalChange(Math.min(24, goal + 1))}>+</button>
            </div>
          </div>
          
          <div className="setting-group pin-change-group">
            <button className="secondary-btn" onClick={() => setPinFlow({ ...pinFlow, active: true })}>
              Change Parent PIN
            </button>
            
            {pinFlow.active && (
              <div className="global-overlay">
                <div className="global-modal">
                  <h2 className="modal-title-critical" style={{ color: 'var(--primary-green)' }}>
                    Step {pinFlow.step}: {pinFlow.step === 1 ? 'Verify Current PIN' : pinFlow.step === 2 ? 'New Parent PIN' : 'Confirm New PIN'}
                  </h2>
                  <p className="modal-text">
                    {pinFlow.step === 1 ? 'Enter your existing 4-digit PIN to authorize changes.' : 'Please enter a new 4-digit secure PIN for the Parent Corner.'}
                  </p>
                  <div className="pin-input-row">
                    <input 
                      type="password" 
                      maxLength="4" 
                      placeholder="...." 
                      style={{ 
                        fontSize: '48px', 
                        textAlign: 'center', 
                        letterSpacing: '20px', 
                        border: '2px solid var(--light-green)', 
                        borderRadius: '16px',
                        width: '100%',
                        padding: '20px',
                        marginBottom: '30px'
                      }}
                      value={pinFlow.step === 1 ? pinFlow.current : pinFlow.step === 2 ? pinFlow.new : pinFlow.confirm}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (pinFlow.step === 1) setPinFlow({ ...pinFlow, current: v });
                        else if (pinFlow.step === 2) setPinFlow({ ...pinFlow, new: v });
                        else setPinFlow({ ...pinFlow, confirm: v });
                      }}
                    />
                  </div>
                  <div className="profile-modal-actions">
                    <button className="profile-btn-cancel" onClick={() => setPinFlow({ ...pinFlow, active: false })}>Cancel</button>
                    <button className="profile-btn-save" onClick={handlePinChange}>
                      {pinFlow.step === 3 ? 'Finish & Save' : 'Next Step'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        <div className="export-panel card">
          <h3><span className="material-symbols-outlined">description</span> Performance Report</h3>
          <p>Generate a branded PDF report of all dynamic student activity data.</p>
          <button className="primary-btn export-btn-full" onClick={exportPDF}>
            <span className="material-symbols-outlined">file_download</span>
            Download Parent Report
          </button>
        </div>
      </section>
    </div>
  );
};

export default ParentCorner;
