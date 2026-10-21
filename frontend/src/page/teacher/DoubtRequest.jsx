import { useState, useEffect } from "react";
import { Search, Calendar, Clock, MapPin } from "lucide-react";
import facultyService from "../../services/facultyService";
import StatusPill from "../../components/student/StatusPill";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import { formatTime, formatLongDate } from "../../utils/formatDates";

const TABS = [
  { key: "PENDING", label: "Pending", statuses: ["PENDING"] },
  { key: "ACCEPTED", label: "Accepted", statuses: ["ACCEPTED", "COMPLETED"] },
  { key: "REJECTED", label: "Rejected", statuses: ["REJECTED", "CANCELLED"] },
  { key: "ALL", label: "All", statuses: null },
];

const initialOf = (name = "") => name.charAt(0).toUpperCase() || "S";

export default function DoubtRequest() {
  const [requests, setRequests] = useState([]);
  const [tab, setTab] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [acceptingRequest, setAcceptingRequest] = useState(null);
  const [customVenue, setCustomVenue] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      setLoading(true);
      setError("");
      setRequests(await facultyService.getMyRequests());
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load incoming requests. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function openAcceptModal(req) {
    setAcceptingRequest(req);
    setCustomVenue(req.availability?.venue || req.teacher?.defaultVenue || "Staff Room");
  }

  async function handleAccept() {
    if (!acceptingRequest) return;
    try {
      setActionLoading(acceptingRequest.id);
      setError("");
      await facultyService.approveRequest(acceptingRequest.id, customVenue);
      setSuccessMsg(`Request accepted. The session is now in your To-Do List at ${customVenue}.`);
      setAcceptingRequest(null);
      await fetchRequests();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not accept the request. Check for a scheduling conflict."
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id) {
    if (!window.confirm("Reject this request? The student will be notified.")) return;
    try {
      setActionLoading(id);
      setError("");
      await facultyService.rejectRequest(id);
      setSuccessMsg("Request rejected. The student has been notified.");
      await fetchRequests();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Could not reject the request.");
    } finally {
      setActionLoading(null);
    }
  }

  const current = TABS.find((t) => t.key === tab);
  const inTab = (r, t) => !t.statuses || t.statuses.includes((r.status || "").toUpperCase());

  const q = search.trim().toLowerCase();
  const shown = requests.filter((r) => {
    if (!inTab(r, current)) return false;
    if (!q) return true;
    return [r.student?.name, r.student?.email, r.reason, r.availability?.subject].some((v) =>
      v?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="sl-page-head">
        <h1>Incoming Requests</h1>
        <p>Review booking requests from students and accept or reject them.</p>
      </div>

      {successMsg && <div className="sl-notice" role="status">{successMsg}</div>}
      {error && <ErrorMessage message={error} onRetry={fetchRequests} />}

      <div className="sl-toolbar">
        <div className="sl-search">
          <Search size={17} />
          <input
            className="sl-input"
            placeholder="Search by student, email or subject"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="sl-tabs wide">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`sl-tab ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            <small>{requests.filter((r) => inTab(r, t)).length}</small>
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading requests..." />
      ) : shown.length === 0 ? (
        <div className="sl-empty">
          <h3>No {current.label.toLowerCase()} requests</h3>
          <p>
            {tab === "PENDING"
              ? "You have no requests waiting for a reply."
              : "No requests match this filter."}
          </p>
        </div>
      ) : (
        <div className="sl-grid">
          {shown.map((req) => {
            const isPending = (req.status || "").toUpperCase() === "PENDING";
            const busy = actionLoading === req.id;

            return (
              <article className="sl-card" key={req.id}>
                <div className="sl-item-head">
                  <div className="sl-person">
                    <div className="sl-avatar">{initialOf(req.student?.name)}</div>
                    <div style={{ minWidth: 0 }}>
                      <h3>{req.student?.name || "Student"}</h3>
                      <div className="sl-dept">{req.student?.email}</div>
                    </div>
                  </div>
                  <StatusPill status={req.status} />
                </div>

                <div className="sl-item-meta">
                  <div>
                    <Calendar size={15} />
                    {formatLongDate(req.availability?.date)}
                  </div>
                  <div>
                    <Clock size={15} />
                    {formatTime(req.requestedStartTime)} ({req.requestedDuration} min)
                  </div>
                  <div>
                    <MapPin size={15} />
                    {req.availability?.venue || req.teacher?.defaultVenue || "Staff Room"}
                  </div>
                </div>

                <div className="sl-kv">
                  <p>
                    <span className="k">Subject: </span>
                    {req.availability?.subject || "Not specified"}
                  </p>
                  <p>
                    <span className="k">Doubt: </span>
                    {req.reason || "No description provided."}
                  </p>
                </div>

                {isPending && (
                  <div className="sl-card-actions">
                    <button className="sl-btn" disabled={busy} onClick={() => openAcceptModal(req)}>
                      Accept
                    </button>
                    <button
                      className="sl-btn danger"
                      disabled={busy}
                      onClick={() => handleReject(req.id)}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {acceptingRequest && (
        <div className="sl-modal-backdrop" onClick={() => setAcceptingRequest(null)}>
          <div className="sl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sl-modal-head">
              <div>
                <h2>Accept request</h2>
                <p>Confirm the venue. The student will see it under My Sessions.</p>
              </div>
            </div>

            <div className="sl-modal-body">
              <div className="sl-summary">
                <p>
                  <span className="k">Student: </span>
                  {acceptingRequest.student?.name} ({acceptingRequest.student?.email})
                </p>
                <p>
                  <span className="k">Subject: </span>
                  {acceptingRequest.availability?.subject}
                </p>
                <p>
                  <span className="k">When: </span>
                  {formatLongDate(acceptingRequest.availability?.date)}, {formatTime(acceptingRequest.requestedStartTime)} (
                  {acceptingRequest.requestedDuration} min)
                </p>
                <p>
                  <span className="k">Doubt: </span>
                  {acceptingRequest.reason}
                </p>
              </div>

              <div className="sl-field">
                <label className="sl-label" htmlFor="venue-input">Venue</label>
                <input
                  id="venue-input"
                  className="sl-input"
                  value={customVenue}
                  onChange={(e) => setCustomVenue(e.target.value)}
                  placeholder="e.g. Staff Room 402, 4th Floor"
                />
              </div>

              <div className="sl-modal-actions">
                <button
                  className="sl-btn ghost"
                  onClick={() => setAcceptingRequest(null)}
                  disabled={actionLoading !== null}
                >
                  Cancel
                </button>
                <button
                  className="sl-btn"
                  onClick={handleAccept}
                  disabled={actionLoading !== null || !customVenue.trim()}
                >
                  {actionLoading ? "Confirming..." : "Confirm and accept"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
