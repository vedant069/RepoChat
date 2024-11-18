import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Github, LogOut, Plus, Moon, Sun, Search, Code, MessagesSquare, User, Settings } from 'lucide-react';
import { ChatWindow } from '../components/ChatWindow';
import { NewChatModal } from '../components/NewChatModal';
import { SearchModal } from '../components/SearchModal';
import { CodePreview } from '../components/CodePreview';
import { Chat } from '../types';

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [showCodePreview, setShowCodePreview] = useState(true);

  const handleSignOut = () => {
    signOut(auth);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', JSON.stringify(!isDarkMode));
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <Github className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">RepoChat</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCodePreview(!showCodePreview)}
                className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                title="Toggle code preview"
              >
                <Code className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                title="Search chats"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                title="Toggle theme"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                New Chat
              </button>
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <img
                    src={user?.photoURL || 'https://ui-avatars.com/api/?name=User'}
                    alt={user?.displayName || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hidden group-hover:block">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.displayName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <nav className="flex flex-col gap-1 p-2">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <MessagesSquare className="w-5 h-5" />
                  Chats
                </Link>
                <Link
                  to="/dashboard/profile"
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <User className="w-5 h-5" />
                  Profile
                </Link>
                <Link
                  to="/dashboard/settings"
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </Link>
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <Routes>
              <Route path="/" element={
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Welcome, {user?.displayName}!</h2>
                  <p className="text-gray-600 dark:text-gray-400">Start a new chat or continue an existing conversation.</p>
                </div>
              } />
              <Route path="/profile" element={
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Profile</h2>
                  {/* Add profile content here */}
                </div>
              } />
              <Route path="/settings" element={
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Settings</h2>
                  {/* Add settings content here */}
                </div>
              } />
            </Routes>
          </div>
        </div>
      </main>

      {/* Modals */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onSubmit={() => {}}
        isLoading={false}
      />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(true)}
        chats={[]}
        onSelectChat={() => {}}
      />
    </div>
  );
}