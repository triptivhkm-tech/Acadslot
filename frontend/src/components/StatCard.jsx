
export default function StatCard({ title, value, color = "#ffffff" }) {
  return (
    <div className="stat-card" style={{ backgroundColor: color }}>
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}
