import React from "react";

function Welcome({ user, onLogout, onStartQuiz }) {
  return (
    <div className="auth-card fade-in" style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: 'rgba(15, 157, 88, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h1>Welcome Back!</h1>
        <p className="subtitle" style={{ marginBottom: '1rem' }}>
          You have successfully logged in to your professional dashboard.
        </p>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: 'var(--input-bg-light)', 
          borderRadius: '1rem', 
          display: 'inline-block',
          marginBottom: '2rem',
          fontWeight: '600',
          color: 'var(--primary-color)'
        }} className="dark-mode-target">
          {user ? user.email : "Authenticated User"}
        </div>
      </div>

      <button onClick={onStartQuiz} className="btn-primary" style={{ marginBottom: '1rem' }}>
        Start Professional Quiz
      </button>

      <button onClick={onLogout} className="btn-primary" style={{ background: '#f1f5f9', color: '#1e293b', border: '1px solid #e2e8f0' }}>
        Sign Out Safely
      </button>
    </div>
  );
}

export default Welcome;
