import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setError(
      "Student registration is not connected yet. We need to confirm the registration API with the backend.",
    );
  }

  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "#F2EFE7",
      fontFamily: "Arial, sans-serif",
    },
    card: {
      width: "100%",
      maxWidth: "420px",
      padding: "32px",
      background: "#FFFFFF",
      borderRadius: "16px",
      boxShadow: "0 8px 28px rgba(51,104,160,0.12)",
    },
    input: {
      width: "100%",
      padding: "12px",
      marginTop: "7px",
      marginBottom: "16px",
      border: "1px solid #C8DFDB",
      borderRadius: "8px",
      boxSizing: "border-box",
      fontSize: "15px",
    },
    button: {
      width: "100%",
      padding: "13px",
      border: "none",
      borderRadius: "8px",
      background: "#3368A0",
      color: "white",
      fontSize: "16px",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={{ color: "#3368A0", marginBottom: "8px" }}>
          Create Student Account
        </h1>
        <p style={{ color: "#666", marginBottom: "24px" }}>
          Register to book doubt-solving sessions with faculty.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            style={styles.input}
          />

          <label htmlFor="email">College Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your college email"
            style={styles.input}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a password"
            style={styles.input}
          />

          {error && (
            <p style={{ color: "#B42318", fontSize: "14px" }}>{error}</p>
          )}

          <button type="submit" style={styles.button}>
            Create Account
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px" }}>
          Already registered? <Link to="/login">Login</Link>
        </p>

        <button
          type="button"
          onClick={() => navigate("/login")}
          style={{
            display: "block",
            margin: "12px auto 0",
            border: "none",
            background: "none",
            color: "#3368A0",
            cursor: "pointer",
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
