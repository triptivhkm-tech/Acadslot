import { formatTime } from "./formatDates";

// "10:30" or "10:30:00" -> 630
export function toMinutes(t) {
  const [h, m] = String(t).split(":").map(Number);
  return h * 60 + (m || 0);
}

export function fromMinutes(total) {
  const h = String(Math.floor(total / 60)).padStart(2, "0");
  const m = String(total % 60).padStart(2, "0");
  return `${h}:${m}:00`;
}

// local date as yyyy-mm-dd (toISOString would give the UTC date, which is wrong near midnight in IST)
export function todayString(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function minutesNow(now = new Date()) {
  return now.getHours() * 60 + now.getMinutes();
}

// true when the whole availability window is already over
export function isWindowExpired(avail, now = new Date()) {
  const today = todayString(now);
  if (avail.date < today) return true;
  if (avail.date === today) return toMinutes(avail.endTime) <= minutesNow(now);
  return false;
}

export function overlaps(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

// start times a student can pick inside one window, for a given duration.
// Past times on today's date are left out.
export function buildStartTimes(avail, duration, now = new Date()) {
  if (!avail?.startTime || !avail?.endTime) return [];
  const isToday = avail.date === todayString(now);
  const earliest = isToday ? minutesNow(now) : -1;

  const times = [];
  const end = toMinutes(avail.endTime);
  for (let t = toMinutes(avail.startTime); t + duration <= end; t += duration) {
    if (t > earliest) times.push(fromMinutes(t));
  }
  return times;
}

// the time range a request occupies
export function requestRange(req) {
  const start = toMinutes(req.requestedStartTime);
  return { date: req.availability?.date, start, end: start + req.requestedDuration };
}

export function isActive(req) {
  const s = (req.status || "").toUpperCase();
  return s === "PENDING" || s === "ACCEPTED";
}

export function timeRangeLabel(startTime, minutes) {
  const start = toMinutes(startTime);
  return `${formatTime(startTime)} – ${formatTime(fromMinutes(start + minutes))}`;
}
