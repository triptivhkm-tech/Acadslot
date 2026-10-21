export function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const d = new Date(dateString + (dateString.includes("T") ? "" : "T12:00:00"));
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function formatTime(timeString) {
  if (!timeString) return "";
  try {
    const parts = timeString.split(":");
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1] || "00";
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  } catch {
    return timeString;
  }
}

// "17 September 2026"
export function formatLongDate(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString.includes("T") ? dateString : dateString + "T12:00:00");
  if (Number.isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// "Mon" / "17" / "Sep" parts, used on the date chips
export function dateParts(dateString) {
  const d = new Date(dateString + "T12:00:00");
  return {
    day: d.toLocaleDateString("en-GB", { weekday: "short" }),
    num: d.getDate(),
    month: d.toLocaleDateString("en-GB", { month: "short" }),
  };
}
