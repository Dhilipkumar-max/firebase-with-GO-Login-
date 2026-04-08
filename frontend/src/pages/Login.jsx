import React, { useState } from "react";
import axios from "axios";

function Login({ onShowSignup, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      if (res.data === "Login Success") {
        onLoginSuccess({ email });
      } else {
        alert(res.data);
      }
    } catch (error) {
      alert("Login failed: " + (error.response?.data || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card fade-in">
      <div className="need-help">Need Help?</div>
      
      <h1>Welcome back</h1>
      <p className="subtitle">Enter your credentials to access your studio.</p>

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input 
            id="email"
            type="email" 
            placeholder="name@studio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="password">Password</label>
            <span className="forgot-password">Forgot password?</span>
          </div>
          <input 
            id="password"
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="auth-footer" style={{ marginTop: '2.5rem' }}>
        New to Architect? <span onClick={onShowSignup}>Create an account</span>
      </div>
    </div>
  );
}

export default Login;