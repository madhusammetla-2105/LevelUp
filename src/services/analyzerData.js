import dayjs from 'dayjs';

const STORAGE_KEY = 'levelup_activity_logs';
const ARCHIVE_KEY = 'levelup_daily_archives';

/**
 * Log a student activity
 * @param {string} sectionName - The app section (e.g., 'Study Tracker')
 * @param {string} actionDescription - What happened (e.g., 'Started focus session')
 * @param {number} durationInMinutes - How long it lasted (optional)
 */
export const logActivity = (sectionName, actionDescription, durationInMinutes = 0) => {
  const logs = getAllLogs();
  const newEntry = {
    timestamp: dayjs().toISOString(),
    sectionName,
    actionDescription,
    durationInMinutes: Number(durationInMinutes) || 0
  };
  
  logs.push(newEntry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
};

export const getAllLogs = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getLogsForDate = (dateString) => {
  const targetDate = dayjs(dateString).format('YYYY-MM-DD');
  const logs = getAllLogs();
  
  // Also check archives for past dates
  const archives = JSON.parse(localStorage.getItem(ARCHIVE_KEY) || '{}');
  if (archives[targetDate]) return archives[targetDate];

  return logs.filter(log => dayjs(log.timestamp).format('YYYY-MM-DD') === targetDate);
};

export const calculateHealthScore = (logs) => {
  if (!logs || logs.length === 0) return 0;
  
  // Simple heuristic: diversity of sections + total time + focus actions
  const uniqueSections = new Set(logs.map(l => l.sectionName)).size;
  const totalMinutes = logs.reduce((acc, l) => acc + l.durationInMinutes, 0);
  const focusActions = logs.filter(l => l.actionDescription.toLowerCase().includes('focus')).length;
  
  let score = (uniqueSections * 10) + (totalMinutes / 10) + (focusActions * 5);
  return Math.min(100, Math.round(score));
};

export const generateSmartInsights = (logs) => {
  if (!logs || logs.length === 0) {
    return ["No activity detected yet. Start exploring sections to get insights!"];
  }

  const insights = [];
  const totalMinutes = logs.reduce((acc, l) => acc + l.durationInMinutes, 0);
  const sections = logs.map(l => l.sectionName);
  
  if (totalMinutes > 0 && totalMinutes < 60) {
    insights.push("You've started strong! Aim for at least 2 hours of active learning today.");
  }

  const coachTime = logs.filter(l => l.sectionName === 'AI Study Coach').length;
  const focusTime = logs.filter(l => l.sectionName === 'Focus Engine').length;
  
  if (coachTime > focusTime * 2) {
    insights.push("You're interacting a lot with the AI Coach. Try balancing this with some uninterrupted Focus Engine sessions.");
  }

  if (focusTime >= 3) {
    insights.push("Excellent work! You've completed multiple focus blocks. Your concentration is high today.");
  }

  const hours = logs.map(l => dayjs(l.timestamp).hour());
  const peakHour = hours.reduce((acc, h) => {
    acc[h] = (acc[h] || 0) + 1;
    return acc;
  }, {});
  
  const topHour = Object.keys(peakHour).reduce((a, b) => peakHour[a] > peakHour[b] ? a : b, 0);
  insights.push(`Your peak productivity window seems to be around ${dayjs().hour(topHour).format('h A')}.`);

  return insights.slice(0, 4);
};

// Archive logs at midnight (call this on app load)
export const archivePreviousDays = () => {
  const today = dayjs().format('YYYY-MM-DD');
  const logs = getAllLogs();
  const archives = JSON.parse(localStorage.getItem(ARCHIVE_KEY) || '{}');
  
  const previousLogs = logs.filter(log => dayjs(log.timestamp).format('YYYY-MM-DD') !== today);
  const todayLogs = logs.filter(log => dayjs(log.timestamp).format('YYYY-MM-DD') === today);
  
  if (previousLogs.length > 0) {
    previousLogs.forEach(log => {
      const date = dayjs(log.timestamp).format('YYYY-MM-DD');
      if (!archives[date]) archives[date] = [];
      archives[date].push(log);
    });
    
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archives));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todayLogs));
  }
};

// Parent Corner Aggregations
export const getWeeklyStats = () => {
  const logs = getAllLogs();
  const archives = JSON.parse(localStorage.getItem(ARCHIVE_KEY) || '{}');
  const weekData = [];
  
  const startOfWeek = dayjs().startOf('week').add(1, 'day'); // Monday
  
  for (let i = 0; i < 7; i++) {
    const date = startOfWeek.add(i, 'day').format('YYYY-MM-DD');
    const dayName = startOfWeek.add(i, 'day').format('ddd');
    
    const dayLogs = date === dayjs().format('YYYY-MM-DD') 
      ? logs 
      : (archives[date] || []);
      
    const totalMins = dayLogs.reduce((acc, l) => acc + l.durationInMinutes, 0);
    weekData.push({ day: dayName, hours: Number((totalMins / 60).toFixed(1)) });
  }
  
  return weekData;
};

export const getDailyGoal = () => {
  return Number(localStorage.getItem('levelup_daily_study_goal') || 4);
};

export const setDailyGoal = (hours) => {
  localStorage.setItem('levelup_daily_study_goal', hours);
};

export const checkLastActivityHours = () => {
  const logs = getAllLogs();
  if (logs.length > 0) return 0;
  
  const archives = JSON.parse(localStorage.getItem(ARCHIVE_KEY) || '{}');
  const dates = Object.keys(archives).sort().reverse();
  if (dates.length === 0) return 100; // Never active
  
  const lastActive = dayjs(dates[0]);
  return dayjs().diff(lastActive, 'hour');
};

export const getFocusAverage = (logs) => {
  const focusLogs = logs.filter(l => l.sectionName === 'Focus Engine');
  if (focusLogs.length === 0) return 100;
  // Simulating focus scores for logged sessions if not explicitly stored
  return 85; 
};

