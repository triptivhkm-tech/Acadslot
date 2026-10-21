import { useState, useEffect } from "react";
import adminService from "../../services/adminService";
import StatusPill from "../../components/student/StatusPill";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import { formatTime, formatLongDate } from "../../utils/formatDates";

export default function SystemActivity() {
  const [bookings, setBookings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [view, setView] = useState("SESSIONS");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    try {
      setLoading(true);
      setError("");
      const [b, r] = await Promise.all([adminService.getBookings(), adminService.getRequests()]);
      setBookings(b);
      setRequests(r);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load booking records.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="sl-page-head">
        <h1>Booking Records</h1>
        <p>All student requests and sessions across the college.</p>
      </div>

      <div className="sl-tabs">
        <button
          className={`sl-tab ${view === "SESSIONS" ? "active" : ""}`}
          onClick={() => setView("SESSIONS")}
        >
          Sessions<small>{bookings.length}</small>
        </button>
        <button
          className={`sl-tab ${view === "REQUESTS" ? "active" : ""}`}
          onClick={() => setView("REQUESTS")}
        >
          Requests<small>{requests.length}</small>
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadRecords} />}

      {loading ? (
        <LoadingSpinner message="Loading records..." />
      ) : view === "SESSIONS" ? (
        <section className="sl-panel">
          {bookings.length === 0 ? (
            <p className="sl-panel-empty">No confirmed sessions yet.</p>
          ) : (
            <div className="sl-table-wrap">
              <table className="sl-table">
                <thead>
                  <tr>
                    <th>Date and time</th>
                    <th>Faculty</th>
                    <th>Student</th>
                    <th>Subject</th>
                    <th>Venue</th>
                    <th>Doubt</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <strong>{formatLongDate(s.date)}</strong>
                        <span className="sub">
                          {formatTime(s.startTime)} to {formatTime(s.endTime)} ({s.duration} min)
                        </span>
                      </td>
                      <td>
                        <strong>{s.teacher?.name || "Faculty"}</strong>
                        <span className="sub">{s.teacher?.email}</span>
                      </td>
                      <td>
                        <strong>{s.student?.name || "Student"}</strong>
                        <span className="sub">{s.student?.email}</span>
                      </td>
                      <td>{s.title || s.request?.availability?.subject || "Not specified"}</td>
                      <td>{s.venue || "Staff Room"}</td>
                      <td className="wrap">{s.request?.reason || "None"}</td>
                      <td><StatusPill status={s.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : (
        <section className="sl-panel">
          {requests.length === 0 ? (
            <p className="sl-panel-empty">No requests yet.</p>
          ) : (
            <div className="sl-table-wrap">
              <table className="sl-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Student</th>
                    <th>Faculty</th>
                    <th>Subject</th>
                    <th>Requested slot</th>
                    <th>Doubt</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td>{formatLongDate(r.availability?.date)}</td>
                      <td>
                        <strong>{r.student?.name || "Student"}</strong>
                        <span className="sub">{r.student?.email}</span>
                      </td>
                      <td>
                        <strong>{r.teacher?.name || "Faculty"}</strong>
                        <span className="sub">{r.teacher?.email}</span>
                      </td>
                      <td>{r.availability?.subject || "Not specified"}</td>
                      <td>
                        {formatTime(r.requestedStartTime)} ({r.requestedDuration} min)
                      </td>
                      <td className="wrap">{r.reason}</td>
                      <td><StatusPill status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </>
  );
}
