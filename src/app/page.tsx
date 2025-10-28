"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AddQuesion from "../app/add_questions/page";
import './app.css';
export default function Home() {
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  // Polite, varied error messages for fetch failures
  const errorMessages = [
    "Oops, I couldn't understand that. Please try rephrasing your question.",
    "Sorry, I'm having trouble right now. Please try again later.",
    "Hmm, that didn't work. Maybe try asking in a different way.",
    "I'm here to help! Please try asking the question again shortly.",
  ];

  // Empty state message for no questions loaded
  const emptyMessage =
    "No questions available. Please select a category or try again.";

  // Load theme preference from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("vprep-theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark-theme");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark-theme");
    }
  }, []);

  // Toggle theme and persist choice
  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark-theme");
      localStorage.setItem("vprep-theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark-theme");
      localStorage.setItem("vprep-theme", "dark");
      setDarkMode(true);
    }
  };

  // Fetch questions with error handling and polite messages
  const fetchQuestions = async (category: string) => {
    setLoading(true);
    setError(null);
    setQuestions([]);

    try {
      const res = await fetch(`/api/questions?category=${category}`);
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await res.json();

      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        setQuestions([]);
        setError(emptyMessage);
      }
    } catch (err) {
      // Pick random error message to avoid repetition
      const randomIndex = Math.floor(Math.random() * errorMessages.length);
      setError(errorMessages[randomIndex]);
      setQuestions([]);
      console.error("Error fetching questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionClick = (question: string) => {
    router.push(`/question?text=${encodeURIComponent(question)}`);
  };
  //
  return (
    <div className="landing-page" role="main">
      <header>
        <h1 tabIndex={0}>AI-Based Interview Platform</h1>
        <h6 tabIndex={0} className="text-base mb-3">
          Choose between HR and Technical questions to prepare for your next
          interview.
        </h6>
        <button
          onClick={toggleDarkMode}
          aria-pressed={darkMode}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          type="button"
          className="theme-toggle-btn"
        >
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </header>

      <main>
        <section
          className="category-selection"
          aria-label="Question Categories"
        >
          <h2>Select a Question Category</h2>
          <div
            className="button-group"
            role="group"
            aria-label="Question category selection buttons"
          >
            <button
              onClick={() => fetchQuestions("HR")}
              aria-pressed="false"
              aria-label="Load HR questions"
              type="button"
            >
              HR Questions
            </button>
            <button
              onClick={() => fetchQuestions("Technical")}
              aria-pressed="false"
              aria-label="Load Technical questions"
              type="button"
            >
              Technical Questions
            </button>
          </div>
        </section>

        <section
          className="add-question"
          aria-label="Add a new interview question"
        >
          <h3>Add a New Question</h3>
          <AddQuesion />
        </section>

        <section
          className="questions-display"
          aria-live="polite"
          aria-atomic="true"
        >
          {loading ? (
            <p>Loading questions...</p>
          ) : error ? (
            <p role="alert" className="error-message">
              {error}
            </p>
          ) : questions.length > 0 ? (
            <ul>
              {questions.map((question, index) => (
                <li
                  key={index}
                  tabIndex={0}
                  role="button"
                  aria-label={`Interview question: ${question}`}
                  onClick={() => handleQuestionClick(question)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleQuestionClick(question);
                    }
                  }}
                >
                  {question}
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-message" aria-live="polite">
              {emptyMessage}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
