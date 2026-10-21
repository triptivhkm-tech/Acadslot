import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim()) {
      setMessage("Please enter your college email.");
      return;
    }

    setMessage(
      "Password reset is not connected yet. The backend team needs to provide the reset-password API.",
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#F2EFE7",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "32px",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 8px 28px rgba(51,104,160,0.12)",
        }}
      >
        <h1 style={{ color: "#3368A0" }}>Forgot Password?</h1>

        <p style={{ color: "#666", lineHeight: 1.6 }}>
          Enter your college email to request a password reset.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">College Email</label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              marginBottom: "16px",
              border: "1px solid #C8DFDB",
              borderRadius: "8px",
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "8px",
              background: "#3368A0",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Reset Password
          </button>
        </form>

        {message && (
          <p style={{ color: "#B42318", marginTop: "16px", lineHeight: 1.5 }}>
            {message}
          </p>
        )}

        <p style={{ textAlign: "center", marginTop: "20px" }}>
          <Link to="/login" style={{ color: "#3368A0" }}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
