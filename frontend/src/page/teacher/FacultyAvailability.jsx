import { useState, useEffect } from "react";
import { Clock, MapPin, Trash2 } from "lucide-react";
import facultyService from "../../services/facultyService";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import { formatTime, dateParts } from "../../utils/formatDates";
import { todayString } from "../../utils/slotUtils";
import { useAuth } from "../../context/AuthContext";

export default function FacultyAvailability() {
  const { user } = useAuth();
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const today = todayString();
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState("11:00");
  const [endTime, setEndTime] = useState("12:30");
  const [venue, setVenue] = useState(user?.defaultVenue || "Staff Room 402");
  const [subject, setSubject] = useState(user?.subject || "");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchAvailabilities();
  }, []);

  async function fetchAvailabilities() {
    try {
      setLoading(true);
      setError("");
      setAvailabilities(await facultyService.getMyAvailability());
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load availability. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!date) {
      setError("Select a date.");
      return;
    }
    if (startTime >= endTime) {
      setError("The start time must be earlier than the end time.");
      return;
    }

    try {
      setSubmitting(true);
      await facultyService.createAvailability({
        date,
        startTime: startTime + ":00",
        endTime: endTime + ":00",
        venue: venue.trim(),
        subject: subject.trim(),
        description: description.trim(),
      });
      setSuccessMsg("Availability published. Students can now book slots in this window.");
      await fetchAvailabilities();
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not publish availability. Check the form values."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this availability window?")) return;
    try {
      await facultyService.deleteAvailability(id);
      setSuccessMsg("Availability window deleted.");
      await fetchAvailabilities();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete the availability window.");
    }
  }

  return (
    <>
      <div className="sl-page-head">
        <h1>Availability</h1>
        <p>
          Publish the time windows when students can meet you. Students pick 5, 10 or 15 minute
          slots inside each window.
        </p>
      </div>

      {successMsg && <div className="sl-notice" role="status">{successMsg}</div>}
      {error && <ErrorMessage message={error} onRetry={fetchAvailabilities} />}

      <div className="sl-aside-layout">
        <section className="sl-panel">
          <div className="sl-panel-head">
            <h2>New availability window</h2>
          </div>
          <form className="sl-panel-body" onSubmit={handleSubmit}>
            <div className="sl-field">
              <label className="sl-label" htmlFor="avail-date">Date</label>
              <input
                id="avail-date"
                className="sl-input"
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="sl-two sl-field">
              <div>
                <label className="sl-label" htmlFor="avail-start">Start time</label>
                <input
                  id="avail-start"
                  className="sl-input"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="sl-label" htmlFor="avail-end">End time</label>
                <input
                  id="avail-end"
                  className="sl-input"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="sl-field">
              <label className="sl-label" htmlFor="avail-venue">Venue</label>
              <input
                id="avail-venue"
                className="sl-input"
                placeholder="e.g. Staff Room 402, 4th Floor"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                required
              />
            </div>

            <div className="sl-field">
              <label className="sl-label" htmlFor="avail-subject">Subject</label>
              <input
                id="avail-subject"
                className="sl-input"
                placeholder="e.g. DBMS"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="sl-field">
              <label className="sl-label" htmlFor="avail-desc">Notes for students (optional)</label>
              <textarea
                id="avail-desc"
                className="sl-textarea"
                rows={2}
                placeholder="e.g. Bring your questions on Module 3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button type="submit" className="sl-btn" disabled={submitting}>
              {submitting ? "Publishing..." : "Publish availability"}
            </button>
          </form>
        </section>

        <section className="sl-panel">
          <div className="sl-panel-head">
            <h2>Published windows ({availabilities.length})</h2>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading availability..." />
          ) : availabilities.length === 0 ? (
            <p className="sl-panel-empty">
              No windows published yet. Use the form to add your first one.
            </p>
          ) : (
            availabilities.map((slot) => {
              const parts = slot.date ? dateParts(slot.date) : null;
              return (
                <article className="sl-entry" key={slot.id}>
                  <div className="sl-entry-main">
                    {parts && (
                      <div className="sl-date-box">
                        <small>{parts.day}</small>
                        <strong>{parts.num}</strong>
                        <small>{parts.month}</small>
                      </div>
                    )}
                    <div>
                      <h4>{slot.subject || "General doubt session"}</h4>
                      <div className="sl-item-meta">
                        <div>
                          <Clock size={15} />
                          {formatTime(slot.startTime)} to {formatTime(slot.endTime)}
                        </div>
                        <div>
                          <MapPin size={15} />
                          {slot.venue || "Staff Room"}
                        </div>
                      </div>
                      {slot.description && <p className="note">{slot.description}</p>}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="sl-icon-action"
                    onClick={() => handleDelete(slot.id)}
                    aria-label="Delete availability window"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </article>
              );
            })
          )}
        </section>
      </div>
    </>
  );
}
