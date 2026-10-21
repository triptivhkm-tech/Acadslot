
export default function SearchBar({ value, onChange }) {
  return (
    <input
      type="search"
      placeholder="Search student, subject or doubt..."
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label="Search doubt requests"
    />
  );
}
