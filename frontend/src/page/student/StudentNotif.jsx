import { useEffect, useState } from "react";
import notificationService from "../../services/notificationService";

export default function StudentNotif() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      setItems(await notificationService.getNotifications());
    } catch (err) {
      setError(err.response?.data?.message || "Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id) {
    try {
      await notificationService.markAsRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n)));
    } catch {
      setError("Could not mark that notification as read.");
    }
  }

  // the backend may name the flag isRead or read
  const isRead = (n) => Boolean(n.isRead ?? n.read);

  return (
    <>
      <div className="sl-page-head">
        <h1>Notifications</h1>
        <p>Updates on your requests and sessions.</p>
      </div>

      {error && (
        <div className="sl-error" role="alert">
          <span>{error}</span>
          <button onClick={load}>Try again</button>
        </div>
      )}

      {loading ? (
        <p className="sl-loading">Loading...</p>
      ) : items.length === 0 && !error ? (
        <div className="sl-empty">
          <h3>No notifications yet</h3>
          <p>Replies from faculty will show up here.</p>
        </div>
      ) : (
        <div className="sl-notif-list">
          {items.map((n) => (
            <div key={n.id} className={`sl-notif ${isRead(n) ? "" : "unread"}`}>
              <div>
                <h3>{n.title}</h3>
                <p>{n.message}</p>
                <time>{n.createdAt ? new Date(n.createdAt).toLocaleString("en-GB") : ""}</time>
                {!isRead(n) && <button onClick={() => markRead(n.id)}>Mark as read</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
