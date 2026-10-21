
import StatusBadge from "./StatusBadge";

export default function SessionCard({ session }) {
  const student = session.studentName || session.student || "Student";
  const topic = session.topic || session.doubt || "Doubt-solving session";

  return (
    <div className="schedule-item">
      <strong>{session.time}</strong>
      <h3>{session.subject}</h3>
      <p>{topic}</p>
      <p>Student: {student}</p>
      {session.duration && <p>Duration: {session.duration} minutes</p>}
      <StatusBadge status={session.status || "Scheduled"} />
    </div>
  );
}
