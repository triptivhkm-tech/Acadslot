import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import facultyService from "../../services/facultyService";
import StatusPill from "../../components/student/StatusPill";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import { formatTime, formatLongDate } from "../../utils/formatDates";

const initialOf = (name = "") => name.charAt(0).toUpperCase() || "S";

export default function TeacherToDo() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [cancelModalAppt, setCancelModalAppt] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    fetchToDoList();
  }, []);

  async function fetchToDoList() {
    try {
      setLoading(true);
      setError("");
      setAppointments(await facultyService.getMyAppointments());
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load your To-Do List. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkCompleted(id) {
    try {
      setActionLoading(id);
      setError("");
      await facultyService.completeAppointment(id);
      setSuccessMsg("Session marked as completed.");
      await fetchToDoList();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Could not complete the session.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancelSession() {
    if (!cancelModalAppt || !cancelReason.trim()) return;
    try {
      setActionLoading(cancelModalAppt.id);
      setError("");
      await facultyService.cancelAppointment(cancelModalAppt.id, cancelReason.trim());
      setSuccessMsg("Appointment cancelled. The student has been notified.");
      setCancelModalAppt(null);
      setCancelReason("");
      await fetchToDoList();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Could not cancel the appointment.");
    } finally {
      setActionLoading(null);
    }
  }

  // The To-Do List only holds confirmed (upcoming) appointments.
  const activeToDo = appointments.filter((a) => (a.status || "").toUpperCase() === "UPCOMING");

  return (
    <>
      <div className="sl-page-head">
        <h1>To-Do List</h1>
        <p>
          {activeToDo.length === 1
            ? "1 confirmed session to conduct."
            : `${activeToDo.length} confirmed sessions to conduct.`}{" "}
          Mark each one as completed after the meeting.
        </p>
      </div>

      {successMsg && <div className="sl-notice" role="status">{successMsg}</div>}
      {error && <ErrorMessage message={error} onRetry={fetchToDoList} />}

      {loading ? (
        <LoadingSpinner message="Loading sessions..." />
      ) : activeToDo.length === 0 ? (
        <div className="sl-empty">
          <h3>Nothing to conduct</h3>
          <p>Sessions appear here after you accept a request from Incoming Requests.</p>
        </div>
      ) : (
        <div className="sl-grid">
          {activeToDo.map((appt) => {
            const busy = actionLoading === appt.id;

            return (
              <article className="sl-card" key={appt.id}>
                <div className="sl-item-head">
                  <div className="sl-person">
                    <div className="sl-avatar">{initialOf(appt.student?.name)}</div>
                    <div style={{ minWidth: 0 }}>
                      <h3>{appt.student?.name || "Student"}</h3>
                      <div className="sl-dept">{appt.student?.email}</div>
                    </div>
                  </div>
                  <StatusPill status={appt.status} />
                </div>

                <div className="sl-item-meta">
                  <div>
                    <Calendar size={15} />
                    {formatLongDate(appt.date)}
                  </div>
                  <div>
                    <Clock size={15} />
                    {formatTime(appt.startTime)} to {formatTime(appt.endTime)} ({appt.duration} min)
                  </div>
                  <div>
                    <MapPin size={15} />
                    {appt.venue || "Staff Room"}
                  </div>
                </div>

                <div className="sl-kv">
                  <p>
                    <span className="k">Subject: </span>
                    {appt.title || appt.request?.availability?.subject || "Not specified"}
                  </p>
                  <p>
                    <span className="k">Doubt: </span>
                    {appt.request?.reason || "No description provided."}
                  </p>
                </div>

                <div className="sl-card-actions">
                  <button className="sl-btn" disabled={busy} onClick={() => handleMarkCompleted(appt.id)}>
                    {busy ? "Updating..." : "Mark as completed"}
                  </button>
                  <button
                    className="sl-btn danger"
                    disabled={busy}
                    onClick={() => {
                      setCancelModalAppt(appt);
                      setCancelReason("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {cancelModalAppt && (
        <div className="sl-modal-backdrop" onClick={() => setCancelModalAppt(null)}>
          <div className="sl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sl-modal-head">
              <div>
                <h2>Cancel appointment</h2>
                <p>
                  {cancelModalAppt.student?.name}, {formatLongDate(cancelModalAppt.date)} at{" "}
                  {formatTime(cancelModalAppt.startTime)}
                </p>
              </div>
            </div>

            <div className="sl-modal-body">
              <div className="sl-field">
                <label className="sl-label" htmlFor="cancel-reason">Reason</label>
                <textarea
                  id="cancel-reason"
                  className="sl-textarea"
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="The student will see this reason."
                />
              </div>

              <div className="sl-modal-actions">
                <button className="sl-btn ghost" onClick={() => setCancelModalAppt(null)}>
                  Keep appointment
                </button>
                <button
                  className="sl-btn danger solid"
                  onClick={handleCancelSession}
                  disabled={!cancelReason.trim() || actionLoading !== null}
                >
                  {actionLoading ? "Cancelling..." : "Cancel appointment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
