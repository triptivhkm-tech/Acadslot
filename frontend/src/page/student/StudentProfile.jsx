import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function StudentProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <>
      <div className="sl-page-head">
        <h1>My Profile</h1>
      </div>

      <div className="sl-card sl-profile">
        <div className="sl-profile-top">
          <div className="sl-avatar">{(user?.name || "S").charAt(0).toUpperCase()}</div>
          <div>
            <h2>{user?.name || "Student"}</h2>
            <span>Student</span>
          </div>
        </div>

        <dl className="sl-rows">
          <div>
            <dt>Email</dt>
            <dd>{user?.email || "-"}</dd>
          </div>
          {user?.department && (
            <div>
              <dt>Department</dt>
              <dd>{user.department}</dd>
            </div>
          )}
          <div>
            <dt>College</dt>
            <dd>Thakur College of Engineering and Technology</dd>
          </div>
        </dl>

        <button className="sl-btn ghost" style={{ marginTop: 18 }} onClick={handleLogout}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </>
  );
}
