import StatusPill from "./student/StatusPill";

// Kept so existing imports keep working; renders the same pill the student portal uses.
export default function StatusBadge({ status }) {
  return <StatusPill status={status} />;
}
