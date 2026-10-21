import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import facultyService from "../../services/facultyService";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import { useAuth } from "../../context/AuthContext";
import { formatTime, formatLongDate } from "../../utils/formatDates";

const statusOf = (x) => (x.status || "").toUpperCase();

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      setError("");
      const [reqs, appts, avails] = await Promise.all([
        facultyService.getMyRequests(),
        facultyService.getMyAppointments(),
        facultyService.getMyAvailability(),
      ]);
      setRequests(reqs);
      setAppointments(appts);
      setAvailabilities(avails);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load the dashboard. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  const pending = requests.filter((r) => statusOf(r) === "PENDING");
  const upcoming = appointments
    .filter((a) => statusOf(a) === "UPCOMING")
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  const completed = appointments.filter((a) => statusOf(a) === "COMPLETED");

  const details = [user?.department, user?.subject, user?.defaultVenue || "Staff Room"]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <div className="sl-page-head">
        <h1>Welcome, {user?.name || "Professor"}</h1>
        <p>{details}</p>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchDashboardData} />}

      {loading ? (
        <LoadingSpinner message="Loading dashboard..." />
      ) : (
        <>
          <div className="sl-stats">
            <Link to="/teacher/requests" className="sl-stat">
              <span>Pending requests</span>
              <strong>{pending.length}</strong>
              <small>Waiting for your reply</small>
            </Link>
            <Link to="/teacher/todo" className="sl-stat">
              <span>To-Do List</span>
              <strong>{upcoming.length}</strong>
              <small>Confirmed sessions</small>
            </Link>
            <Link to="/teacher/availability" className="sl-stat">
              <span>Availability windows</span>
              <strong>{availabilities.length}</strong>
              <small>Published for students</small>
            </Link>
            <Link to="/teacher/sessions" className="sl-stat">
              <span>Completed sessions</span>
              <strong>{completed.length}</strong>
              <small>Marked as completed</small>
            </Link>
          </div>

          <div className="sl-split">
            <section className="sl-panel">
              <div className="sl-panel-head">
                <h2>Pending requests</h2>
                <Link to="/teacher/requests">View all</Link>
              </div>
              {pending.length === 0 ? (
                <p className="sl-panel-empty">No requests are waiting for a reply.</p>
              ) : (
                <ul className="sl-rowlist">
                  {pending.slice(0, 5).map((r) => (
                    <li key={r.id}>
                      <div>
                        <strong>{r.student?.name || "Student"}</strong>
                        <span className="sub">
                          {r.availability?.subject || "Doubt"}, {formatLongDate(r.availability?.date)} at{" "}
                          {formatTime(r.requestedStartTime)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="sl-panel">
              <div className="sl-panel-head">
                <h2>Upcoming sessions</h2>
                <Link to="/teacher/todo">Open To-Do List</Link>
              </div>
              {upcoming.length === 0 ? (
                <p className="sl-panel-empty">No confirmed sessions yet.</p>
              ) : (
                <ul className="sl-rowlist">
                  {upcoming.slice(0, 5).map((a) => (
                    <li key={a.id}>
                      <div>
                        <strong>{a.student?.name || "Student"}</strong>
                        <span className="sub">
                          {formatLongDate(a.date)}, {formatTime(a.startTime)} to {formatTime(a.endTime)}
                        </span>
                      </div>
                      <span className="sub">{a.venue || "Staff Room"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </>
  );
}
