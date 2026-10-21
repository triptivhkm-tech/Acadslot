import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { X, CheckCircle2 } from "lucide-react";
import studentService from "../services/studentService";
import { formatTime, formatLongDate, dateParts } from "../utils/formatDates";
import { buildStartTimes, overlaps, requestRange, toMinutes } from "../utils/slotUtils";

const DURATIONS = [5, 10, 15];

export default function BookingModal({ faculty, activeRequests = [], onClose, onRefresh }) {
  const windows = faculty.availabilities || [];
  const dates = useMemo(() => [...new Set(windows.map((w) => w.date))].sort(), [windows]);

  const [date, setDate] = useState(dates[0] || "");
  const [windowId, setWindowId] = useState(
    windows.find((w) => w.date === dates[0])?.id ?? null
  );
  const [duration, setDuration] = useState(15);
  const [startTime, setStartTime] = useState("");
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const dayWindows = windows.filter((w) => w.date === date);
  const selectedWindow = windows.find((w) => w.id === windowId);
  const startTimes = selectedWindow ? buildStartTimes(selectedWindow, duration) : [];

  // times the student cannot take because they already have their own request then
  function clashesWithMyOwn(time) {
    const start = toMinutes(time);
    return activeRequests.some((r) => {
      const range = requestRange(r);
      return range.date === date && overlaps(start, start + duration, range.start, range.end);
    });
  }

  function pickDate(d) {
    setDate(d);
    setWindowId(windows.find((w) => w.date === d)?.id ?? null);
    setStartTime("");
    setError("");
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!startTime) return setError("Pick a start time.");
    if (!reason.trim()) return setError("Tell the faculty what your doubt is about.");

    try {
      setSending(true);
      await studentService.submitRequest({
        availabilityId: selectedWindow.id,
        requestedStartTime: startTime,
        requestedDuration: duration,
        reason: reason.trim(),
      });
      setSent(true);
      onRefresh?.();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not send the request. Please try again."
      );
      // the slot may have been taken by someone else, so reload what is free
      setStartTime("");
      onRefresh?.();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="sl-modal-backdrop" onClick={onClose}>
      <div className="sl-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="sl-modal-head">
          <div>
            <h2>{faculty.name}</h2>
            <p>
              {faculty.subject} · {faculty.defaultVenue || "Staff Room"}
            </p>
          </div>
          <button className="sl-icon-btn" onClick={onClose} aria-label="Close" style={{ color: "#5d7183" }}>
            <X size={20} />
          </button>
        </div>

        {sent ? (
          <div className="sl-success">
            <CheckCircle2 size={44} color="#3368a0" />
            <h3>Request sent</h3>
            <p>
              {faculty.name} will review it. You can follow the status in My Requests.
            </p>
            <div className="sl-modal-actions">
              <button className="sl-btn ghost" onClick={onClose}>
                Close
              </button>
              <Link to="/student/requests" className="sl-btn">
                My Requests
              </Link>
            </div>
          </div>
        ) : (
          <form className="sl-modal-body" onSubmit={submit}>
            {error && (
              <div className="sl-error" role="alert">
                <span>{error}</span>
              </div>
            )}

            <div className="sl-field">
              <span className="sl-label">Date</span>
              <div className="sl-chips">
                {dates.map((d) => {
                  const p = dateParts(d);
                  return (
                    <button
                      type="button"
                      key={d}
                      className={`sl-chip date ${d === date ? "selected" : ""}`}
                      onClick={() => pickDate(d)}
                    >
                      <small>{p.day}</small>
                      <strong>{p.num}</strong>
                      <small>{p.month}</small>
                    </button>
                  );
                })}
              </div>
              {date && <p className="sl-hint">{formatLongDate(date)}</p>}
            </div>

            {dayWindows.length > 1 && (
              <div className="sl-field">
                <span className="sl-label">Free window</span>
                <div className="sl-chips">
                  {dayWindows.map((w) => (
                    <button
                      type="button"
                      key={w.id}
                      className={`sl-chip ${w.id === windowId ? "selected" : ""}`}
                      onClick={() => {
                        setWindowId(w.id);
                        setStartTime("");
                      }}
                    >
                      {formatTime(w.startTime)} – {formatTime(w.endTime)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="sl-field">
              <span className="sl-label">Duration</span>
              <div className="sl-chips">
                {DURATIONS.map((m) => (
                  <button
                    type="button"
                    key={m}
                    className={`sl-chip ${m === duration ? "selected" : ""}`}
                    onClick={() => {
                      setDuration(m);
                      setStartTime("");
                    }}
                  >
                    {m} min
                  </button>
                ))}
              </div>
            </div>

            <div className="sl-field">
              <span className="sl-label">Start time</span>
              {startTimes.length === 0 ? (
                <p className="sl-hint">
                  No start times left in this window for {duration} minutes. Try a shorter
                  duration or another date.
                </p>
              ) : (
                <div className="sl-chips">
                  {startTimes.map((t) => {
                    const clash = clashesWithMyOwn(t);
                    return (
                      <button
                        type="button"
                        key={t}
                        disabled={clash}
                        title={clash ? "You already have a request at this time" : undefined}
                        className={`sl-chip ${t === startTime ? "selected" : ""}`}
                        onClick={() => setStartTime(t)}
                      >
                        {formatTime(t)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="sl-field">
              <label className="sl-label" htmlFor="doubt">
                Your doubt
              </label>
              <textarea
                id="doubt"
                className="sl-textarea"
                maxLength={300}
                placeholder="e.g. Normalization and 3NF"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="sl-modal-actions">
              <button type="button" className="sl-btn ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="sl-btn" disabled={sending}>
                {sending ? "Sending..." : "Send request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
