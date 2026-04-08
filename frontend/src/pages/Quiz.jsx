import React, { useState, useEffect } from "react";

const API_BASE_URL = "/api";

function Quiz({ user, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/questions`);
      const data = await response.json();
      setQuestions(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setLoading(false);
    }
  };

  const handleOptionClick = (index) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === questions[currentQuestionIndex].correctOption) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      submitResult();
      setShowResult(true);
    }
  };

  const submitResult = async () => {
    const result = {
      userId: user ? user.email : "Anonymous",
      score: score,
      total: questions.length,
      timestamp: new Date().toISOString()
    };

    try {
      await fetch(`${API_BASE_URL}/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result)
      });
    } catch (error) {
      console.error("Error submitting result:", error);
    }
  };

  if (loading) {
    return <div className="auth-card fade-in">Loading questions...</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="auth-card fade-in" style={{ textAlign: 'center' }}>
        <h2>No questions available.</h2>
        <p>Please add some questions to the database first.</p>
        <button onClick={onBack} className="btn-primary">Go Back</button>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="auth-card fade-in" style={{ textAlign: 'center' }}>
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
        <h1>Quiz Completed!</h1>
        <div style={{ margin: '1.5rem 0', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
          You scored {score} out of {questions.length}
        </div>
        <p className="subtitle">Your progress has been saved.</p>
        <button onClick={onBack} className="btn-primary" style={{ marginTop: '2rem' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div key={currentQuestion.id || currentQuestionIndex} className="auth-card slide-up" style={{ minWidth: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.8rem', opacity: 0.7 }}>
        <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
        <span>Score: {score}</span>
      </div>
      
      <div style={{ 
        height: '4px', 
        width: '100%', 
        backgroundColor: '#e2e8f0', 
        borderRadius: '2px', 
        marginBottom: '2rem',
        overflow: 'hidden'
      }}>
        <div style={{ 
          height: '100%', 
          width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`, 
          backgroundColor: 'var(--primary-color)',
          transition: 'width 0.4s ease-in-out'
        }}></div>
      </div>

      <h2 style={{ marginBottom: '2rem', lineHeight: '1.4' }}>{currentQuestion.text}</h2>

      <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
        {currentQuestion.options.map((option, index) => {
          let style = {
            padding: '1rem',
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0',
            cursor: isAnswered ? 'default' : 'pointer',
            transition: 'all 0.3s ease',
            textAlign: 'left',
            background: 'white',
            fontWeight: '500'
          };

          if (isAnswered) {
            if (index === currentQuestion.correctOption) {
              style.borderColor = '#0F9D58';
              style.backgroundColor = 'rgba(15, 157, 88, 0.1)';
              style.color = '#0F9D58';
            } else if (index === selectedOption) {
              style.borderColor = '#ef4444';
              style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              style.color = '#ef4444';
            }
          } else if (selectedOption === index) {
            style.borderColor = 'var(--primary-color)';
            style.backgroundColor = 'rgba(15, 157, 88, 0.05)';
          }

          return (
            <button 
              key={index} 
              onClick={() => handleOptionClick(index)}
              style={style}
              className={!isAnswered ? "option-hover" : ""}
            >
              {option}
            </button>
          );
        })}
      </div>

      <button 
        onClick={handleNext} 
        disabled={!isAnswered}
        className="btn-primary"
        style={{ 
          opacity: isAnswered ? 1 : 0.5,
          transform: isAnswered ? 'none' : 'scale(0.98)',
          transition: 'all 0.3s ease'
        }}
      >
        {currentQuestionIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
      </button>
    </div>
  );
}

export default Quiz;
