import "./UpcomingSchedule.css";

function UpcomingSchedule() {
  const schedule = [
    {
      time: "14:00",
      title: "Data Structures Lab",
      place: "Virtual Room B-12",
      active: true,
    },
    {
      time: "16:30",
      title: "Solo Grind: Calculus II",
      place: "Home Office",
      active: false,
    },
  ];

  return (
    <section className="schedule-card">
      <h4>UPCOMING DEPLOYMENT</h4>

      <div className="schedule-list">
        {schedule.map((item, index) => (
          <div className="schedule-item" key={index}>
            <div className="schedule-time">{item.time}</div>
            <div className="schedule-details">
              <h5 className={item.active ? "active" : ""}>{item.title}</h5>
              <p>{item.place}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default UpcomingSchedule;
