
import StatusBadge from "./StatusBadge";

export default function RequestCard({ request, onStatusChange }) {
  const student = request.studentName || request.student || "Student";
  const doubt = request.doubt || request.description || "Academic doubt";

  return (
    <div className="session-card">
      <div>
        <h3>{student}</h3>
        <p><strong>Subject:</strong> {request.subject}</p>
        <p><strong>Doubt:</strong> {doubt}</p>
        <p><strong>Date:</strong> {request.date || "Not specified"}</p>
        <p><strong>Time:</strong> {request.time || "Not specified"}</p>
        <StatusBadge status={request.status || "Pending"} />
      </div>

      {request.status === "Pending" && onStatusChange && (
        <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
          <button
            className="btn-primary"
            onClick={() => onStatusChange(request.id, "Accepted")}
          >
            Accept
          </button>

          <button
            className="btn-danger"
            onClick={() => onStatusChange(request.id, "Rejected")}
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
