import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin } from "lucide-react";
import studentService from "../../services/studentService";
import BookingModal from "../../components/BookingModal";
import StatusPill from "../../components/student/StatusPill";
import { formatTime, formatLongDate } from "../../utils/formatDates";
import { isActive, isWindowExpired, todayString } from "../../utils/slotUtils";

// "Prof. Sharma" -> "S"
function initialOf(name = "") {
  return name.replace(/^(prof|dr)\.?\s+/i, "").charAt(0).toUpperCase();
}

function dayLabel(dateStr) {
  const today = todayString();
  if (dateStr === today) return "Today";
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateStr === todayString(tomorrow)) return "Tomorrow";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function StudentDashboard() {
  const [faculty, setFaculty] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState(null);

  async function load() {
    try {
      setError("");
      const [list, requests, sessions] = await Promise.all([
        studentService.getFacultyList(),
        studentService.getMyRequests().catch(() => []),
        studentService.getMySessions().catch(() => []),
      ]);
      setFaculty(list);
      setMyRequests(requests);
      setMySessions(sessions);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load faculty. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const activeRequests = useMemo(() => myRequests.filter(isActive), [myRequests]);

  const pendingRequests = useMemo(
    () => myRequests.filter((r) => (r.status || "").toUpperCase() === "PENDING"),
    [myRequests]
  );

  const upcomingSessions = useMemo(
    () =>
      mySessions
        .filter((s) => (s.status || "").toUpperCase() === "UPCOMING")
        .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime)),
    [mySessions]
  );

  const departments = useMemo(
    () => ["All", ...new Set(faculty.map((f) => f.department).filter(Boolean))],
    [faculty]
  );

  const liveWindows = (f) =>
    (f.availabilities || [])
      .filter((a) => !isWindowExpired(a))
      .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));

  const bookingFaculty = faculty.find((f) => f.id === bookingId);

  const visible = faculty.filter((f) => {
    if (dept !== "All" && f.department !== dept) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [f.name, f.subject, f.department].some((v) => v?.toLowerCase().includes(q));
  });

  return (
    <>
      <div className="sl-page-head">
        <h1>Faculty & Slots</h1>
        <p>Find a faculty member and book a short doubt session.</p>
      </div>

      <div className="sl-toolbar">
        <div className="sl-search">
          <Search size={17} />
          <input
            className="sl-input"
            placeholder="Search by faculty name or subject"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="sl-select" value={dept} onChange={(e) => setDept(e.target.value)}>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d === "All" ? "All departments" : d}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="sl-error" role="alert">
          <span>{error}</span>
          <button onClick={load}>Try again</button>
        </div>
      )}

      {loading ? (
        <p className="sl-loading">Loading faculty...</p>
      ) : visible.length === 0 && !error ? (
        <div className="sl-empty">
          <h3>No faculty found</h3>
          <p>Try a different name, subject or department.</p>
        </div>
      ) : (
        <div className="sl-dash">
        <div className="sl-grid">
          {visible.map((f) => {
            const windows = liveWindows(f);
            const mine = activeRequests.find((r) => r.teacher?.id === f.id);

            return (
              <article className="sl-card" key={f.id}>
                <div className="sl-faculty-top">
                  <div className="sl-avatar">{initialOf(f.name)}</div>
                  <div>
                    <h3>{f.name}</h3>
                    <div className="sl-dept">{f.department}</div>
                    <div className="sl-subject">{f.subject}</div>
                  </div>
                </div>

                {windows.length === 0 ? (
                  <ul className="sl-slot-list">
                    <li className="sl-slot-none">No slots available right now</li>
                  </ul>
                ) : (
                  <ul className="sl-slot-list">
                    {windows.slice(0, 3).map((w) => (
                      <li key={w.id}>
                        <span className="sl-slot-day">{dayLabel(w.date)}</span>
                        <span>
                          {formatTime(w.startTime)} – {formatTime(w.endTime)}
                        </span>
                      </li>
                    ))}
                    {windows.length > 3 && (
                      <li className="sl-slot-none">+{windows.length - 3} more windows</li>
                    )}
                  </ul>
                )}

                <div className="sl-venue">
                  <MapPin size={15} />
                  {f.defaultVenue || "Staff Room"}
                </div>

                <div className="sl-card-foot">
                  {mine ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <StatusPill status={mine.status} />
                      <Link
                        to="/student/requests"
                        style={{ color: "#3368a0", fontWeight: 600, fontSize: 14 }}
                      >
                        See my request
                      </Link>
                    </div>
                  ) : (
                    <button
                      className="sl-btn"
                      disabled={windows.length === 0}
                      onClick={() => setBookingId(f.id)}
                    >
                      View slots / Book
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <aside className="sl-aside">
          <section className="sl-side-card">
            <div className="sl-side-head">
              <h2>Upcoming sessions</h2>
              <Link to="/student/sessions">View all</Link>
            </div>
            {upcomingSessions.length === 0 ? (
              <p className="sl-side-empty">No confirmed sessions yet.</p>
            ) : (
              <ul className="sl-side-list">
                {upcomingSessions.slice(0, 4).map((s) => (
                  <li key={s.id}>
                    <strong>{s.teacher?.name || "Faculty"}</strong>
                    <span>{formatLongDate(s.date)}, {formatTime(s.startTime)}</span>
                    <span>{s.venue || "Staff Room"}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="sl-side-card">
            <div className="sl-side-head">
              <h2>Pending requests</h2>
              <Link to="/student/requests">View all</Link>
            </div>
            {pendingRequests.length === 0 ? (
              <p className="sl-side-empty">Nothing waiting for a reply.</p>
            ) : (
              <ul className="sl-side-list">
                {pendingRequests.slice(0, 4).map((r) => (
                  <li key={r.id}>
                    <strong>{r.teacher?.name || "Faculty"}</strong>
                    <span>{formatLongDate(r.availability?.date)}, {formatTime(r.requestedStartTime)}</span>
                    <span>{r.availability?.subject || "Doubt"}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
        </div>
      )}

      {bookingFaculty && (
        <BookingModal
          faculty={{ ...bookingFaculty, availabilities: liveWindows(bookingFaculty) }}
          activeRequests={activeRequests}
          onClose={() => setBookingId(null)}
          onRefresh={load}
        />
      )}
    </>
  );
}
