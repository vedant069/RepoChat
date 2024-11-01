import React from 'react';
import { MessageSquare, Trash2, LogOut, User } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { Chat } from '../types';
import { signOut } from 'firebase/auth';

interface DashboardProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export function Dashboard({ chats, currentChatId, onSelectChat, onDeleteChat }: DashboardProps) {
  const [user] = useAuthState(auth);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="w-80 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
              <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.displayName || user?.email || 'Anonymous User'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chats Section */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="p-4 text-sm font-medium text-gray-600 dark:text-gray-400">
          Your Chats
        </h3>
        
        <div className="space-y-1 px-3">
          {chats.length === 0 ? (
            <p className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
              No chats yet. Create a new chat to get started.
            </p>
          ) : (
            chats.map(chat => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`
                  flex flex-col gap-1 p-3 rounded-lg cursor-pointer
                  ${currentChatId === chat.id 
                    ? 'bg-primary-50 dark:bg-primary-900/50' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}
                `}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white truncate">
                    {chat.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{chat.messages.length} messages</span>
                  <span>{new Date(chat.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}