import {
  LayoutDashboard,
  Users,
  MapPin,
  GraduationCap,
  ClipboardList,
} from "lucide-react";
import PortalLayout from "./PortalLayout";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/faculty", label: "Manage Faculty", icon: Users },
  { to: "/admin/students", label: "Manage Students", icon: GraduationCap },
  { to: "/admin/bookings", label: "Booking Records", icon: ClipboardList },
];

export default function AdminLayout() {
  return (
    <PortalLayout
      portalLabel="ADMIN PORTAL"
      links={links}
      fallbackName="Administrator"
    />
  );
}
