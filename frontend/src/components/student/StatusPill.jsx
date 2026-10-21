const LABELS = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  UPCOMING: "Upcoming",
};

export default function StatusPill({ status }) {
  const key = (status || "PENDING").toUpperCase();
  return <span className={`sl-pill ${key.toLowerCase()}`}>{LABELS[key] || key}</span>;
}
