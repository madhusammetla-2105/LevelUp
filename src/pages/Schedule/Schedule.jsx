import { useState, useEffect, useCallback } from "react";
import "./Schedule.css";

// ==================== HELPER FUNCTIONS ====================

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(year, month, day) {
  var m = String(month + 1).padStart(2, "0");
  var d = String(day).padStart(2, "0");
  return year + "-" + m + "-" + d;
}

function formatDisplayDate(dateStr) {
  var parts = dateStr.split("-");
  var months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return months[parseInt(parts[1], 10) - 1] + " " + parseInt(parts[2], 10) + ", " + parts[0];
}

function formatTime12(time24) {
  if (!time24) return "";
  var parts = time24.split(":");
  var h = parseInt(parts[0], 10);
  var m = parts[1];
  var ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return h + ":" + m + " " + ampm;
}

function getDaysUntil(dateStr) {
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var target = new Date(dateStr + "T00:00:00");
  var diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return diff;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ==================== MAIN COMPONENT ====================

function Schedule() {
  var today = new Date();
  var currentYear = today.getFullYear();
  var currentMonth = today.getMonth();
  var currentDateKey = formatDateKey(currentYear, currentMonth, today.getDate());

  var [viewYear, setViewYear] = useState(currentYear);
  var [viewMonth, setViewMonth] = useState(currentMonth);
  var [selectedDate, setSelectedDate] = useState(currentDateKey);

  var [events, setEvents] = useState(function () {
    var saved = localStorage.getItem("schedule_events");
    return saved ? JSON.parse(saved) : {};
  });

  var [showModal, setShowModal] = useState(false);
  var [modalDate, setModalDate] = useState("");

  // Form state
  var [eventTitle, setEventTitle] = useState("");
  var [eventTime, setEventTime] = useState("09:00");
  var [eventCategory, setEventCategory] = useState("Study Session");
  var [eventNotes, setEventNotes] = useState("");

  // ==================== SAVE TO LOCALSTORAGE ====================
  useEffect(function () {
    localStorage.setItem("schedule_events", JSON.stringify(events));
    window.dispatchEvent(new Event("schedule-updated"));
  }, [events]);

  // ==================== CALENDAR NAVIGATION ====================
  function goToPrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function goToNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  // ==================== BUILD CALENDAR GRID ====================
  var monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  var totalDays = getDaysInMonth(viewYear, viewMonth);
  var firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  var calendarDays = [];

  for (var i = 0; i < firstDay; i++) {
    calendarDays.push({ day: null, key: null });
  }

  for (var d = 1; d <= totalDays; d++) {
    calendarDays.push({
      day: d,
      key: formatDateKey(viewYear, viewMonth, d),
    });
  }

  // ==================== OPEN MODAL ====================
  function openModal(dateKey) {
    setModalDate(dateKey);
    setEventTitle("");
    setEventTime("09:00");
    setEventCategory("Study Session");
    setEventNotes("");
    setShowModal(true);
  }

  // ==================== SAVE EVENT ====================
  function saveEvent() {
    if (!eventTitle.trim()) return;

    var newEvent = {
      id: generateId(),
      title: eventTitle.trim(),
      time: eventTime,
      category: eventCategory,
      notes: eventNotes.trim(),
    };

    var updatedEvents = Object.assign({}, events);

    if (!updatedEvents[modalDate]) {
      updatedEvents[modalDate] = [];
    }

    updatedEvents[modalDate] = updatedEvents[modalDate].concat([newEvent]);
    setEvents(updatedEvents);
    setShowModal(false);
  }

  // ==================== DELETE EVENT ====================
  function deleteEvent(dateKey, eventId) {
    var updatedEvents = Object.assign({}, events);
    if (updatedEvents[dateKey]) {
      updatedEvents[dateKey] = updatedEvents[dateKey].filter(function (e) {
        return e.id !== eventId;
      });
      if (updatedEvents[dateKey].length === 0) {
        delete updatedEvents[dateKey];
      }
    }
    setEvents(updatedEvents);
  }

  // ==================== GET DOTS FOR A DAY ====================
  function getDotsForDay(dateKey) {
    var dayEvents = events[dateKey];
    if (!dayEvents || dayEvents.length === 0) return [];

    var dots = [];
    var hasStudy = false;
    var hasExam = false;
    var hasGoal = false;

    for (var i = 0; i < dayEvents.length; i++) {
      var cat = dayEvents[i].category;
      if (cat === "Study Session" || cat === "Reminder") hasStudy = true;
      if (cat === "Exam") hasExam = true;
      if (cat === "Goal") hasGoal = true;
    }

    if (hasStudy) dots.push("sage");
    if (hasExam) dots.push("amber");
    if (hasGoal) dots.push("green");

    return dots;
  }

  // ==================== GET EVENTS FOR SELECTED DAY ====================
  function getEventsForDay(dateKey) {
    var dayEvents = events[dateKey] || [];
    // Sort events chronologically by time (HH:mm)
    return dayEvents.slice().sort(function (a, b) {
      return a.time.localeCompare(b.time);
    });
  }

  // ==================== GET UPCOMING EVENTS ====================
  function getUpcomingEvents() {
    var upcoming = [];

    Object.keys(events).forEach(function (dateKey) {
      var dayEvents = events[dateKey];
      if (!dayEvents) return;

      dayEvents.forEach(function (evt) {
        var daysUntil = getDaysUntil(dateKey);
        if (daysUntil >= 0) {
          upcoming.push({
            id: evt.id,
            title: evt.title,
            category: evt.category,
            date: dateKey,
            daysUntil: daysUntil,
            time: evt.time,
          });
        }
      });
    });

    // Sort by date, then by time for same-day events
    upcoming.sort(function (a, b) {
      var dateDiff = new Date(a.date) - new Date(b.date);
      if (dateDiff !== 0) return dateDiff;
      return a.time.localeCompare(b.time);
    });

    return upcoming;
  }

  // ==================== CATEGORY BADGE COLOR ====================
  function getCategoryColor(category) {
    if (category === "Study Session") return "cat-study";
    if (category === "Exam") return "cat-exam";
    if (category === "Goal") return "cat-goal";
    if (category === "Reminder") return "cat-reminder";
    return "cat-study";
  }

  // ==================== RENDER ====================
  var upcomingEvents = getUpcomingEvents();
  var selectedDayEvents = getEventsForDay(selectedDate);

  return (
    <div className="schedule-page">

      {/* LEFT: CALENDAR + AGENDA */}
      <div className="schedule-left">

        {/* CALENDAR CARD */}
        <div className="schedule-calendar-card">

          {/* Calendar Header */}
          <div className="schedule-cal-header">
            <button className="schedule-nav-btn" onClick={goToPrevMonth}>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <h2>{monthNames[viewMonth]} {viewYear}</h2>
            <button className="schedule-nav-btn" onClick={goToNextMonth}>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          {/* Day Names Row */}
          <div className="schedule-day-names">
            {dayNames.map(function (name) {
              return (
                <div className="schedule-day-name" key={name}>{name}</div>
              );
            })}
          </div>

          {/* Calendar Grid */}
          <div className="schedule-cal-grid">
            {calendarDays.map(function (cell, index) {
              if (cell.day === null) {
                return <div className="schedule-cal-cell empty" key={"empty-" + index}></div>;
              }

              var isToday = cell.key === currentDateKey;
              var isSelected = cell.key === selectedDate;
              var dots = getDotsForDay(cell.key);
              var hasEvents = events[cell.key] && events[cell.key].length > 0;

              var cellClass = "schedule-cal-cell";
              if (isToday) cellClass += " today";
              if (isSelected) cellClass += " selected";

              return (
                <div
                  className={cellClass}
                  key={cell.key}
                  onClick={function () {
                    setSelectedDate(cell.key);
                  }}
                  onDoubleClick={function () {
                    openModal(cell.key);
                  }}
                >
                  <span className="schedule-cell-day">{cell.day}</span>
                  {dots.length > 0 && (
                    <div className="schedule-cell-dots">
                      {dots.map(function (color, i) {
                        return (
                          <span className={"schedule-dot " + color} key={i}></span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* DAILY AGENDA STRIP */}
        <div className="schedule-agenda-card">
          <div className="schedule-agenda-header">
            <h3>
              <span className="material-symbols-outlined">event</span>
              AGENDA FOR {formatDisplayDate(selectedDate).toUpperCase()}
            </h3>
            <button className="schedule-add-btn" onClick={function () { openModal(selectedDate); }}>
              <span className="material-symbols-outlined">add</span>
              ADD EVENT
            </button>
          </div>

          {selectedDayEvents.length > 0 ? (
            <div className="schedule-agenda-list">
              {selectedDayEvents.map(function (evt) {
                return (
                  <div className="schedule-agenda-item" key={evt.id}>
                    <div className="schedule-agenda-time">
                      <span className="material-symbols-outlined">schedule</span>
                      {formatTime12(evt.time)}
                    </div>
                    <div className="schedule-agenda-info">
                      <span className="schedule-agenda-title">{evt.title}</span>
                      <span className={"schedule-agenda-badge " + getCategoryColor(evt.category)}>
                        {evt.category}
                      </span>
                      {evt.notes && (
                        <span className="schedule-agenda-notes">{evt.notes}</span>
                      )}
                    </div>
                    <button
                      className="schedule-agenda-delete"
                      onClick={function () { deleteEvent(selectedDate, evt.id); }}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="schedule-agenda-empty">
              <span className="material-symbols-outlined">event_busy</span>
              <p>No events for this day. Click ADD EVENT or double-click a day to add one.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: UPCOMING EVENTS */}
      <div className="schedule-right">
        <div className="schedule-exams-card">
          <h3 className="schedule-exams-title">
            <span className="material-symbols-outlined">event_upcoming</span>
            UPCOMING EVENTS
          </h3>

          {upcomingEvents.length > 0 ? (
            <div className="schedule-exams-list">
              {upcomingEvents.map(function (event) {
                // Determine badge text and apply the category color
                var badgeClass = "exam-badge " + getCategoryColor(event.category);
                var badgeText = event.daysUntil === 0 ? "TODAY" : event.daysUntil + " DAYS";

                return (
                  <div className="schedule-exam-item" key={event.id}>
                    <div className="schedule-exam-info">
                      <span className="schedule-exam-name">{event.title}</span>
                      <span className="schedule-exam-date">{formatDisplayDate(event.date)} at {formatTime12(event.time)}</span>
                    </div>
                    <span className={badgeClass}>{badgeText}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="schedule-exams-empty">
              <p>No upcoming events. Add one by creating an event in the calendar.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="schedule-modal-backdrop" onClick={function () { setShowModal(false); }}>
          <div className="schedule-modal" onClick={function (e) { e.stopPropagation(); }}>
            <div className="schedule-modal-header">
              <h3>
                <span className="material-symbols-outlined">add_circle</span>
                Add Event
              </h3>
              <span className="schedule-modal-date">{formatDisplayDate(modalDate)}</span>
            </div>

            <div className="schedule-modal-form">
              <div className="schedule-form-group">
                <label>Event Title</label>
                <input
                  type="text"
                  placeholder="e.g. Thermodynamics Exam"
                  value={eventTitle}
                  onChange={function (e) { setEventTitle(e.target.value); }}
                />
              </div>

              <div className="schedule-form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={function (e) { setEventTime(e.target.value); }}
                />
              </div>

              <div className="schedule-form-group">
                <label>Category</label>
                <div className="schedule-category-options">
                  {["Study Session", "Exam", "Goal", "Reminder"].map(function (cat) {
                    var catClass = "schedule-cat-btn";
                    if (eventCategory === cat) catClass += " active " + getCategoryColor(cat);
                    return (
                      <button
                        className={catClass}
                        key={cat}
                        onClick={function () { setEventCategory(cat); }}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="schedule-form-group">
                <label>Notes (optional)</label>
                <textarea
                  placeholder="Any extra details..."
                  value={eventNotes}
                  onChange={function (e) { setEventNotes(e.target.value); }}
                  rows={3}
                ></textarea>
              </div>
            </div>

            <div className="schedule-modal-actions">
              <button className="schedule-modal-cancel" onClick={function () { setShowModal(false); }}>
                Cancel
              </button>
              <button
                className="schedule-modal-save"
                onClick={saveEvent}
                disabled={!eventTitle.trim()}
              >
                Save Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Schedule;