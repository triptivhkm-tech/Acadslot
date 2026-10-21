import { LayoutDashboard, Inbox, CheckSquare, Clock, CalendarDays } from "lucide-react";
import PortalLayout from "./PortalLayout";

const links = [
  { to: "/teacher", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/teacher/requests", label: "Incoming Requests", icon: Inbox },
  { to: "/teacher/todo", label: "To-Do List", icon: CheckSquare },
  { to: "/teacher/availability", label: "Availability", icon: Clock },
  { to: "/teacher/sessions", label: "All Sessions", icon: CalendarDays },
];

export default function FacultyLayout() {
  return <PortalLayout portalLabel="FACULTY PORTAL" links={links} fallbackName="Faculty" />;
}
