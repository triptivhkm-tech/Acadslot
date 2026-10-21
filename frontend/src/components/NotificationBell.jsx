
import { useState } from "react";

export default function NotificationBell({ requests = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  const pendingRequests = requests.filter(
    (item) => item.status === "Pending"
  );

  return (
    <div className="notification-wrapper">
      <button
        className="notification-bell"
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="View notifications"
        aria-expanded={isOpen}
      >
        <svg
          viewBox="0 0 24 24"
          width="23"
          height="23"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>

        {pendingRequests.length > 0 && (
          <span className="notification-count">
            {pendingRequests.length > 99
              ? "99+"
              : pendingRequests.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <strong>Notifications</strong>
            <span>{pendingRequests.length} pending</span>
          </div>

          <div className="notification-list">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((item) => (
                <div
                  className="notification-item"
                  key={item.id}
                >
                  <span className="notification-dot" />

                  <div className="notification-item-content">
                    <strong>
                      {item.studentName ||
                        item.student ||
                        "Student"}
                    </strong>

                    <p>
                      Subject: {item.subject || "Not specified"}
                    </p>

                    <p>
                      Doubt:{" "}
                      {item.doubt ||
                        item.description ||
                        "No description provided"}
                    </p>

                    <small>
                      Time: {item.time || "Not specified"}
                    </small>
                  </div>
                </div>
              ))
            ) : (
              <div className="notification-empty">
                <p>You're all caught up!</p>
                <small>No pending doubt requests.</small>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
