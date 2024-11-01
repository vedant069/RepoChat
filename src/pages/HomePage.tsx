import React from 'react';
import { Link } from 'react-router-dom';
import { Github, MessageSquare, Code, Zap, ArrowRight, Brain, Globe } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation with subtle animation */}
      <nav className="py-6 sticky top-0 backdrop-blur-sm bg-white/75 dark:bg-gray-900/75 z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <Github className="w-8 h-8 text-primary-600 dark:text-primary-400 transition-transform group-hover:rotate-12" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">RepoChat</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with animated elements */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/50 to-white dark:from-gray-900/50 dark:to-gray-800 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-slide-up">
              Chat with Your GitHub Repositories Using{' '}
              <span className="text-primary-600 dark:text-primary-400 animate-pulse">AI</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 animate-fade-in opacity-0 [animation-delay:200ms]">
              Transform the way you understand code. Get instant insights, explanations, and answers 
              about your repositories through natural conversations.
            </p>
            <div className="flex items-center justify-center gap-4 animate-fade-in opacity-0 [animation-delay:400ms]">
              <Link
                to="/login"
                className="px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 group"
              >
                Start Chatting
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 group"
              >
                View on GitHub
                <Github className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid with hover animations */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to understand and work with your code better
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI-Powered Analysis",
                description: "Advanced AI understands your code context and provides intelligent responses to your questions."
              },
              {
                icon: MessageSquare,
                title: "Natural Conversations",
                description: "Chat naturally about your code, ask questions, and get detailed explanations in plain English."
              },
              {
                icon: Code,
                title: "Code Understanding",
                description: "Get deep insights into your codebase, including architecture explanations and best practices."
              }
            ].map((feature, index) => (
              <div 
                key={feature.title}
                className="group bg-gray-50 dark:bg-gray-700 p-8 rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in opacity-0"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works with scroll animations */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-gray-800 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Github,
                title: "1. Connect Repository",
                description: "Simply paste your GitHub repository URL to get started"
              },
              {
                icon: MessageSquare,
                title: "2. Start Chatting",
                description: "Ask questions about your code in natural language"
              },
              {
                icon: Zap,
                title: "3. Get Insights",
                description: "Receive detailed explanations and suggestions"
              }
            ].map((step, index) => (
              <div 
                key={step.title}
                className="text-center animate-fade-in opacity-0"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6 transition-transform duration-300 hover:scale-110">
                  <step.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simplified Premium Footer */}
      <footer className="bg-white dark:bg-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-4 group">
              <Github className="w-8 h-8 text-primary-600 dark:text-primary-400 transition-transform duration-300 group-hover:rotate-12" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">RepoChat</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md">
              Making code understanding easier with AI-powered conversations.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-transform duration-300 hover:scale-110">
                <Globe className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-transform duration-300 hover:scale-110">
                <Github className="w-6 h-6" />
              </a>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-gray-600 dark:text-gray-300">
              © 2024 RepoChat. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}