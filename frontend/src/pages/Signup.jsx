import React, { useState } from "react";
import axios from "axios";

function Signup({ onShowLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert("Please agree to the Terms and Privacy Policy.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/api/auth/signup`, {
        name,
        email,
        password,
      });
      alert("Registration Successful!");
      onShowLogin();
    } catch (error) {
      alert(
        "Signup failed: " +
          (error.response?.data?.message ||
            error.response?.data ||
            error.message),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card fade-in">
      <div className="need-help">
        ALREADY HAVE AN ACCOUNT?{" "}
        <span
          style={{
            color: "var(--primary-color)",
            cursor: "pointer",
            fontWeight: "600",
          }}
          onClick={onShowLogin}
        >
          Sign In
        </span>
      </div>

      <h1 style={{ marginTop: "2rem" }}>Create Account</h1>
      <p className="subtitle">Step 1 of 3: Personal Details</p>

      <form onSubmit={handleSignup}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            placeholder="Le Corbusier"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="visionary@architect.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1.5rem",
            fontSize: "0.8rem",
            color: "#64748b",
          }}
        >
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            style={{ width: "1.25rem", height: "1.25rem", cursor: "pointer" }}
          />
          <span>
            I agree to the{" "}
            <b style={{ color: "var(--primary-color)", cursor: "pointer" }}>
              Terms of Service
            </b>{" "}
            and{" "}
            <b style={{ color: "var(--primary-color)", cursor: "pointer" }}>
              Privacy Policy
            </b>{" "}
            regarding my data.
          </span>
        </div>

        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div
        className="auth-footer"
        style={{ marginTop: "2rem", marginBottom: "1rem" }}
      >
        <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
          NEED HELP?
        </span>
      </div>
    </div>
  );
}

export default Signup;
