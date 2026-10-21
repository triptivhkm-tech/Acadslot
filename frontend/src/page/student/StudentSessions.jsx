import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import studentService from "../../services/studentService";
import StatusPill from "../../components/student/StatusPill";
import { formatLongDate } from "../../utils/formatDates";
import { timeRangeLabel } from "../../utils/slotUtils";

const TABS = [
  { key: "UPCOMING", label: "Upcoming" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

export default function StudentSessions() {
  const [sessions, setSessions] = useState([]);
  const [tab, setTab] = useState("UPCOMING");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      setSessions(await studentService.getMySessions());
    } catch (err) {
      setError(err.response?.data?.message || "Could not load your sessions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const statusOf = (s) => (s.status || "").toUpperCase();
  const shown = sessions
    .filter((s) => statusOf(s) === tab)
    // upcoming: soonest first, the rest: latest first
    .sort((a, b) => {
      const diff = (a.date + a.startTime).localeCompare(b.date + b.startTime);
      return tab === "UPCOMING" ? diff : -diff;
    });

  return (
    <>
      <div className="sl-page-head">
        <h1>My Sessions</h1>
        <p>Sessions the faculty has confirmed with you.</p>
      </div>

      <div className="sl-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`sl-tab ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            <small>{sessions.filter((s) => statusOf(s) === t.key).length}</small>
          </button>
        ))}
      </div>

      {error && (
        <div className="sl-error" role="alert">
          <span>{error}</span>
          <button onClick={load}>Try again</button>
        </div>
      )}

      {loading ? (
        <p className="sl-loading">Loading sessions...</p>
      ) : shown.length === 0 && !error ? (
        <div className="sl-empty">
          <h3>No {tab.toLowerCase()} sessions</h3>
          <p>
            {tab === "UPCOMING"
              ? "Once a faculty member accepts a request, the session appears here."
              : "Nothing here yet."}
          </p>
        </div>
      ) : (
        <div className="sl-grid">
          {shown.map((s) => (
            <article className="sl-card" key={s.id}>
              <div className="sl-item-head">
                <div>
                  <h3>{s.title || "Doubt session"}</h3>
                  <div className="sl-dept">{s.teacher?.name || "Faculty"}</div>
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
                  {timeRangeLabel(s.startTime, s.duration)}
                </div>
                <div>
                  <MapPin size={15} />
                  {s.venue || "Staff Room"}
                </div>
              </div>

              {s.request?.reason && <p className="sl-reason">“{s.request.reason}”</p>}

              {statusOf(s) === "CANCELLED" && s.cancelReason && (
                <div className="sl-item-note">
                  <p>Reason: {s.cancelReason}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
