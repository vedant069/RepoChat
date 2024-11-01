import React, { useRef, useEffect } from 'react';
import { Loader2, ExternalLink } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Chat } from '../types';

interface ChatWindowProps {
  chat: Chat;
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
  className?: string;
}

export function ChatWindow({ chat, isLoading, error, onSendMessage, className = '' }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  const repoInfo = {
    owner: chat.repoUrl.split('/')[3],
    name: chat.repoUrl.split('/')[4]?.replace('.git', ''),
  };

  return (
    <div className={`flex flex-col bg-white dark:bg-gray-800 ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{chat.title}</h2>
          <a
            href={chat.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
          >
            {repoInfo.owner}/{repoInfo.name}
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>{chat.messages.length} messages</span>
          <span>•</span>
          <span>{new Date(chat.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
        {isLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 text-primary-600 dark:text-primary-400 animate-spin" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <ChatInput
          onSendMessage={onSendMessage}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}