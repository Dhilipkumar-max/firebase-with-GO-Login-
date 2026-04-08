import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Welcome from "./pages/Welcome";
import Quiz from "./pages/Quiz";

function App() {
  const [view, setView] = useState("login");
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync dark mode class with state
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setView("welcome");
  };

  const handleLogout = () => {
    setUser(null);
    setView("login");
  };

  return (
    <div className="app-container">
      {/* Theme Toggle Button */}
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          padding: '0.75rem',
          borderRadius: '50%',
          border: '1px solid var(--border-light)',
          background: 'var(--card-light)',
          cursor: 'pointer',
          zIndex: 100,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
        }}
        title="Toggle Dark Mode"
      >
        {isDarkMode ? "🌙" : "☀️"}
      </button>

      {view === "welcome" && user ? (
        <Welcome 
          user={user} 
          onLogout={handleLogout} 
          onStartQuiz={() => setView("quiz")} 
        />
      ) : view === "quiz" && user ? (
        <Quiz user={user} onBack={() => setView("welcome")} />
      ) : view === "login" ? (
        <Login onShowSignup={() => setView("signup")} onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Signup onShowLogin={() => setView("login")} />
      )}
      
      <footer style={{ marginTop: '3rem', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span>© 2024 ARCHITECTURAL VOID. ALL RIGHTS RESERVED.</span>
          <span>PRIVACY POLICY</span>
          <span>TERMS OF SERVICE</span>
          <span>SECURITY</span>
          <span>SUPPORT</span>
        </div>
      </footer>
    </div>
  );
}

export default App;