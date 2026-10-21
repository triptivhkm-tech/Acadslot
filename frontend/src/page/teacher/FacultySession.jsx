import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import facultyService from "../../services/facultyService";
import StatusPill from "../../components/student/StatusPill";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import { formatTime, formatLongDate } from "../../utils/formatDates";

const TABS = [
  { key: "ALL", label: "All" },
  { key: "UPCOMING", label: "Upcoming" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

const initialOf = (name = "") => name.charAt(0).toUpperCase() || "S";

export default function FacultySession() {
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    try {
      setLoading(true);
      setError("");
      setAppointments(await facultyService.getMyAppointments());
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load session records. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  const statusOf = (a) => (a.status || "").toUpperCase();
  const countFor = (key) =>
    key === "ALL" ? appointments.length : appointments.filter((a) => statusOf(a) === key).length;
  const shown = appointments.filter((a) => tab === "ALL" || statusOf(a) === tab);

  return (
    <>
      <div className="sl-page-head">
        <h1>All Sessions</h1>
        <p>Every session you have scheduled, completed or cancelled.</p>
      </div>

      <div className="sl-tabs wide">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`sl-tab ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            <small>{countFor(t.key)}</small>
          </button>
        ))}
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchSessions} />}

      {loading ? (
        <LoadingSpinner message="Loading sessions..." />
      ) : shown.length === 0 && !error ? (
        <div className="sl-empty">
          <h3>No {tab === "ALL" ? "" : tab.toLowerCase() + " "}sessions</h3>
          <p>Sessions appear here once you accept a student's request.</p>
        </div>
      ) : (
        <div className="sl-grid">
          {shown.map((s) => (
            <article className="sl-card" key={s.id}>
              <div className="sl-item-head">
                <div className="sl-person">
                  <div className="sl-avatar">{initialOf(s.student?.name)}</div>
                  <div style={{ minWidth: 0 }}>
                    <h3>{s.student?.name || "Student"}</h3>
                    <div className="sl-dept">{s.student?.email}</div>
                  </div>
                </div>
                <StatusPill status={s.status} />
              </div>

              <div className="sl-item-meta">
                <div>
                  <Calendar size={15} />
                  {formatLongDate(s.date)}
                </div>
                <div>
                  <Clock size={15} />
                  {formatTime(s.startTime)} to {formatTime(s.endTime)} ({s.duration} min)
                </div>
                <div>
                  <MapPin size={15} />
                  {s.venue || "Staff Room"}
                </div>
              </div>

              <div className="sl-kv">
                <p>
                  <span className="k">Subject: </span>
                  {s.title || s.request?.availability?.subject || "Not specified"}
                </p>
                {s.request?.reason && (
                  <p>
                    <span className="k">Doubt: </span>
                    {s.request.reason}
                  </p>
                )}
                {statusOf(s) === "CANCELLED" && s.cancelReason && (
                  <p>
                    <span className="k">Cancellation reason: </span>
                    {s.cancelReason}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
