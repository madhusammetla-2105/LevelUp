import { useEffect, useState } from "react";
import { logActivity } from "../../../services/analyzerData";
import "./StudyTracker.css";

function StudyTracker() {
  const [tasks, setTasks] = useState(function () {
    const savedTasks = localStorage.getItem("dashboard_tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [newTask, setNewTask] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");

  const [dailyGoal, setDailyGoal] = useState(function () {
    const savedGoal = localStorage.getItem("dashboard_daily_goal");
    return savedGoal ? Number(savedGoal) : 5;
  });

  // Save tasks and trigger events
  useEffect(function () {
    localStorage.setItem("dashboard_tasks", JSON.stringify(tasks));
    window.dispatchEvent(new Event("tasks-updated"));
  }, [tasks]);

  useEffect(
    function () {
      localStorage.setItem("dashboard_daily_goal", dailyGoal);
    },
    [dailyGoal]
  );

  const completedCount = tasks.filter((task) => task.completed).length;
  const progress = Math.min((completedCount / dailyGoal) * 100, 100);

  // Segmented Progress Logic
  const highCompleted = tasks.filter(t => t.completed && t.priority === "High").length;
  const mediumCompleted = tasks.filter(t => t.completed && t.priority === "Medium").length;
  const lowCompleted = tasks.filter(t => t.completed && t.priority === "Low").length;

  const highPercent = Math.min((highCompleted / dailyGoal) * 100, 100);
  const mediumPercent = Math.min((mediumCompleted / dailyGoal) * 100, 100 - highPercent);
  const lowPercent = Math.min((lowCompleted / dailyGoal) * 100, 100 - highPercent - mediumPercent);

  function addTask() {
    if (!newTask.trim()) return;

    const task = {
      id: Date.now(),
      text: newTask.trim(),
      priority: newPriority,
      completed: false,
    };

    setTasks(tasks.concat([task]));
    logActivity("Study Tracker", `Created task: ${task.text}`, 2);
    setNewTask("");
    setNewPriority("Medium");
  }

  function toggleTask(id) {
    let diff = 0;
    setTasks(
      tasks.map(function (task) {
        if (task.id === id) {
          diff = task.completed ? -1 : 1;
          if (!task.completed) {
            logActivity("Study Tracker", `Completed task: ${task.text}`, 5);
          }
          return { ...task, completed: !task.completed };
        }
        return task;
      })
    );

    const currentUserId = localStorage.getItem("levelup_current_user_id");
    if (currentUserId && diff !== 0) {
      const users = JSON.parse(localStorage.getItem("lu_users") || "[]");
      const userIndex = users.findIndex(u => u.id === currentUserId);
      if (userIndex !== -1) {
        users[userIndex].tasks = Math.max((users[userIndex].tasks || 0) + diff, 0);
        localStorage.setItem("lu_users", JSON.stringify(users));
        window.dispatchEvent(new Event("user-stats-updated"));
      }
    }
  }

  function deleteTask(id) {
    setTasks(
      tasks.filter(function (task) {
        return task.id !== id;
      })
    );
  }

  function increaseGoal() {
    setDailyGoal(function (prev) {
      return Math.min(prev + 1, 20);
    });
  }

  function decreaseGoal() {
    setDailyGoal(function (prev) {
      return Math.max(prev - 1, 1);
    });
  }

  return (
    <section className="study-tracker-card full-page-tracker">
      <div className="study-tracker-header">
        <h2>Task Manager & Progress</h2>

        <div className="study-tracker-goal-box">
          <span className="goal-label">DAILY GOAL:</span>

          <div className="goal-value-control">
            <span className="goal-value">{dailyGoal}</span>

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

          <span className="goal-label">TASKS</span>
        </div>
      </div>

      <div className="study-tracker-progress-bar">
        {/* Segmented Progress */}
        <div className="study-tracker-progress-fill priority-high" style={{ width: highPercent + "%" }}></div>
        <div className="study-tracker-progress-fill priority-medium" style={{ width: mediumPercent + "%" }}></div>
        <div className="study-tracker-progress-fill priority-low" style={{ width: lowPercent + "%" }}></div>
        <span className="study-tracker-progress-text">
          {Math.round(progress)}%
        </span>
      </div>

      <p className="study-tracker-status">
        <span>{completedCount}</span> OF <span>{dailyGoal}</span> TASKS
        COMPLETED
      </p>

      <div className="study-tracker-input-row">
        <input
          type="text"
          className="task-text-input"
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addTask();
          }}
        />
        
        <select 
          className="task-priority-select" 
          value={newPriority} 
          onChange={(e) => setNewPriority(e.target.value)}
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <button className="task-add-btn" onClick={addTask}>ADD</button>
      </div>

      {tasks.length > 0 && (
        <div className="study-tracker-task-list">
          {tasks.map(function (task) {
            return (
              <div className={`study-tracker-task-item priority-border-${task.priority.toLowerCase()}`} key={task.id}>
                <button
                  className="task-check-btn"
                  onClick={() => toggleTask(task.id)}
                  type="button"
                >
                  <span className="material-symbols-outlined">
                    {task.completed
                      ? "check_circle"
                      : "radio_button_unchecked"}
                  </span>
                </button>

                <div className="task-content">
                  <span className={task.completed ? "task-text completed" : "task-text"}>
                    {task.text}
                  </span>
                  <div className="task-metadata">
                    <span className={`task-badge badge-${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>

                <button
                  className="task-delete-btn"
                  onClick={() => deleteTask(task.id)}
                  type="button"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default StudyTracker;