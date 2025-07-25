import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import ValidationPage from './pages/ValidationPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/quiz/:id" element={<QuizPage />} />
            <Route path="/validation" element={<ValidationPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;