import React from 'react';
import { MessageSquare, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  // Ensure message.timestamp is a valid Date object
  const timestamp = message.timestamp ? new Date(message.timestamp) : new Date();

  // Check if the timestamp is valid
  const isValidDate = timestamp instanceof Date && !isNaN(timestamp.getTime());

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''} mb-4`}>
      <div
        className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-500' : 'bg-gray-600'
        }`}
      >
        {isUser ? (
          <MessageSquare className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div
          className={`inline-block rounded-lg px-4 py-2 ${
            isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
          }`}
        >
          <ReactMarkdown className="prose prose-sm max-w-none">
            {message.content}
          </ReactMarkdown>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {isValidDate ? timestamp.toLocaleTimeString() : 'Invalid Date'}
        </div>
      </div>
    </div>
  );
}