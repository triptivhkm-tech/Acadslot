import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import {
  CalendarCheck,
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

const COLLEGE_DOMAIN = "@tcetmumbai.in";

const ROLES = {
  STUDENT: {
    tab: "Student",
    title: "Student Login",
    sub: "Use G-Suite email to continue",
    side: "Student Portal",
    blurb: "Find faculty, pick a free slot and book a short doubt session.",
  },
  FACULTY: {
    tab: "Faculty",
    title: "Faculty Login",
    sub: "Enter the credentials given by the admin",
    side: "Faculty Portal",
    blurb: "Publish your free time and respond to student doubt requests.",
  },
  ADMIN: {
    tab: "Admin",
    title: "Admin Login",
    sub: "Enter your credentials to continue",
    side: "Admin Portal",
    blurb:
      "Manage faculty, oversee appointments, and keep the academic process running smoothly.",
  },
};

// only used while developing, so test accounts are one click away
const DEV_FILL = {
  STUDENT: { name: "Aarav Patel", email: "student@tcetmumbai.in" },
  FACULTY: { email: "sharma@tcetmumbai.in", password: "faculty123" },
  ADMIN: { email: "admin@acadslot.com", password: "admin123" },
};

function SideArt() {
  return (
    <svg
      className="au-art"
      viewBox="0 0 260 150"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="20"
        y="20"
        width="150"
        height="104"
        rx="10"
        fill="#f2efe7"
        stroke="#3368a0"
        strokeWidth="3"
      />
      <rect x="20" y="20" width="150" height="26" rx="10" fill="#3368a0" />
      <rect x="44" y="12" width="6" height="18" rx="3" fill="#f2efe7" />
      <rect x="140" y="12" width="6" height="18" rx="3" fill="#f2efe7" />
      <rect x="38" y="62" width="30" height="20" rx="4" fill="#c8dfdb" />
      <rect x="78" y="62" width="30" height="20" rx="4" fill="#66a3bf" />
      <rect x="118" y="62" width="30" height="20" rx="4" fill="#c8dfdb" />
      <rect x="38" y="92" width="30" height="20" rx="4" fill="#c8dfdb" />
      <rect x="78" y="92" width="30" height="20" rx="4" fill="#c8dfdb" />
      <circle cx="205" cy="98" r="32" fill="#3368a0" />
      <path
        d="M190 98l11 11 20-22"
        stroke="#f2efe7"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState("STUDENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const info = ROLES[role];

  function switchRole(next) {
    setRole(next);
    setError("");
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return setError("Please enter your email.");

    if (role === "STUDENT") {
      if (!cleanEmail.endsWith(COLLEGE_DOMAIN)) {
        return setError(
          `Only college emails ending in ${COLLEGE_DOMAIN} can sign in.`,
        );
      }
    } else if (!password) {
      return setError("Please enter your password.");
    }

    try {
      setLoading(true);
      if (role === "STUDENT") {
        const fallbackName = cleanEmail.split("@")[0].replace(/[._]/g, " ");
        const user = await authService.googleLogin(
          cleanEmail,
          name.trim() || fallbackName,
        );
        login(user);
        navigate("/student/dashboard");
      } else {
        const user = await authService.login(cleanEmail, password, role);
        login(user);
        navigate(user.role === "ADMIN" ? "/admin" : "/teacher");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.response
            ? err.message
            : "Cannot reach the server. Is the backend running?"),
      );
    } finally {
      setLoading(false);
    }
  }

  function devFill() {
    const d = DEV_FILL[role];
    setName(d.name || "");
    setEmail(d.email);
    setPassword(d.password || "");
  }

  return (
    <div className="au-page">
      <div className="au-shell">
        <aside className="au-side">
          <div className="au-logo">
            <img
              src="/logo.png"
              alt=""
              width="46"
              height="46"
              style={{ borderRadius: "50%" }}
            />
            AcadSlot
          </div>
          <div className="au-tagline">Make Time for Better Learning.</div>

          <h2>{info.side}</h2>
          <p className="au-blurb">{info.blurb}</p>

          <SideArt />
        </aside>

        <section className="au-form-wrap">
          <h1>{info.title}</h1>
          <p className="au-sub">{info.sub}</p>

          <div className="au-roles" role="tablist">
            {Object.entries(ROLES).map(([key, r]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={role === key}
                className={`au-role ${role === key ? "active" : ""}`}
                onClick={() => switchRole(key)}
              >
                {r.tab}
              </button>
            ))}
          </div>

          {error && (
            <div className="au-error" role="alert">
              <AlertCircle size={17} style={{ flex: "none", marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {role === "STUDENT" && (
              <div className="au-field">
                <label htmlFor="name">Full name</label>
                <div className="au-input-box">
                  <UserIcon size={17} />
                  <input
                    id="name"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="au-field">
              <label htmlFor="email">
                {role === "STUDENT" ? "College email" : "Email"}
              </label>
              <div className="au-input-box">
                <Mail size={17} />
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder={
                    role === "STUDENT"
                      ? `${COLLEGE_DOMAIN}`
                      : role === "ADMIN"
                        ? "Enter admin email"
                        : `name${COLLEGE_DOMAIN}`
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {role !== "STUDENT" && (
              <div className="au-field">
                <label htmlFor="password">Password</label>
                <div className="au-input-box">
                  <Lock size={17} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="au-eye"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
            )}

            <button className="au-submit" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          {import.meta.env.DEV && (
            <p className="au-dev">
              Dev only: <button onClick={devFill}>fill test account</button>
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
