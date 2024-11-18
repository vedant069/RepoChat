
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Loader2 } from 'lucide-react';
import { auth } from './firebase';


// Import components

import { GitHubRepoChat } from './components/GitHubRepoChat';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';


function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/chat" /> : <LoginPage />}
        />
        <Route
          path="/chat/*"
          element={user ? <GitHubRepoChat /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;



