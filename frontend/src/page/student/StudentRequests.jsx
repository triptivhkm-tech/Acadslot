import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin } from "lucide-react";
import studentService from "../../services/studentService";
import StatusPill from "../../components/student/StatusPill";
import { formatLongDate } from "../../utils/formatDates";
import { timeRangeLabel } from "../../utils/slotUtils";

const TABS = [
  { key: "PENDING", label: "Pending", statuses: ["PENDING"] },
  { key: "ACCEPTED", label: "Accepted", statuses: ["ACCEPTED", "COMPLETED"] },
  { key: "REJECTED", label: "Rejected", statuses: ["REJECTED", "CANCELLED"] },
];

const EMPTY_TEXT = {
  PENDING: "Nothing waiting for a reply. Pick a faculty member from Faculty & Slots to book a session.",
  ACCEPTED: "No accepted requests yet. Once a faculty member accepts, it shows up here and in My Sessions.",
  REJECTED: "No rejected requests.",
};

function statusNote(req) {
  const status = (req.status || "").toUpperCase();
  switch (status) {
    case "PENDING":
      return <p>Waiting for the faculty to respond.</p>;
    case "ACCEPTED":
      return (
        <p>
          Request accepted.
          {req.availability?.venue ? ` Meet at ${req.availability.venue}.` : ""}
        </p>
      );
    case "COMPLETED":
      return <p>Session completed.</p>;
    case "CANCELLED":
      return (
        <>
          <p>This session was cancelled by the faculty.</p>
          <p>
            You can <Link to="/student/dashboard">look for another slot</Link>.
          </p>
        </>
      );
    default:
      return (
        <>
          <p>Request rejected.{req.rejectReason ? ` Reason: ${req.rejectReason}` : ""}</p>
          <p>
            You can <Link to="/student/dashboard">look for another available slot</Link>.
          </p>
        </>
      );
  }
}

export default function StudentRequests() {
  const [requests, setRequests] = useState([]);
  const [tab, setTab] = useState("PENDING");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      setRequests(await studentService.getMyRequests());
    } catch (err) {
      setError(err.response?.data?.message || "Could not load your requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const current = TABS.find((t) => t.key === tab);
  const shown = requests.filter((r) => current.statuses.includes((r.status || "").toUpperCase()));
  const countFor = (t) =>
    requests.filter((r) => t.statuses.includes((r.status || "").toUpperCase())).length;

  return (
    <>
      <div className="sl-page-head">
        <h1>My Requests</h1>
        <p>Status of the sessions you have asked for.</p>
      </div>

      <div className="sl-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`sl-tab ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            <small>{countFor(t)}</small>
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
        <p className="sl-loading">Loading requests...</p>
      ) : shown.length === 0 && !error ? (
        <div className="sl-empty">
          <h3>No {current.label.toLowerCase()} requests</h3>
          <p>{EMPTY_TEXT[tab]}</p>
        </div>
      ) : (
        <div className="sl-grid">
          {shown.map((r) => (
            <article className="sl-card" key={r.id}>
              <div className="sl-item-head">
                <div>
                  <h3>{r.availability?.subject || "Doubt"} Doubt</h3>
                  <div className="sl-dept">{r.teacher?.name || "Faculty"}</div>
                </div>
                <StatusPill status={r.status} />
              </div>

              <div className="sl-item-meta">
                <div>
                  <Calendar size={15} />
                  {formatLongDate(r.availability?.date)}
                </div>
                <div>
                  <Clock size={15} />
                  {timeRangeLabel(r.requestedStartTime, r.requestedDuration)}
                </div>
                {r.availability?.venue && (
                  <div>
                    <MapPin size={15} />
                    {r.availability.venue}
                  </div>
                )}
              </div>

              {r.reason && <p className="sl-reason">“{r.reason}”</p>}

              <div className="sl-item-note">{statusNote(r)}</div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
