"use client";

import { useGlobal } from '@/stores';
import { AnimatePresence, motion } from 'framer-motion';
import { Bug, ExternalLink, MessageCircle, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { BugReport } from './BugReport';
import { ChatInterface } from './ChatInterface';

interface HelpContent {
  title: string;
  message: string;
  actions?: Array<{
    label: string;
    action: 'chat' | 'docs' | 'report';
    url?: string;
  }>;
}

const routeHelpContent: Record<string, HelpContent> = {
  '/dashboard': {
    title: 'Dashboard Overview',
    message: 'Welcome to your learning dashboard! Here you can track your progress, access courses, and manage your profile.',
    actions: [
      { label: 'Ask a question', action: 'chat' },
      { label: 'View dashboard docs', action: 'docs', url: '/docs/dashboard' },
    ],
  },
  '/courses': {
    title: 'Course Catalog',
    message: 'Browse our comprehensive Web3 courses. Filter by difficulty, topic, or search for specific skills.',
    actions: [
      { label: 'Get course recommendations', action: 'chat' },
      { label: 'Learning path guide', action: 'docs', url: '/docs/learning-paths' },
    ],
  },
  '/playground': {
    title: 'Code Playground',
    message: 'Practice your coding skills in our interactive playground. Write, test, and share your code.',
    actions: [
      { label: 'Code help', action: 'chat' },
      { label: 'Playground tutorial', action: 'docs', url: '/docs/playground' },
    ],
  },
  '/simulator': {
    title: 'Network Simulator',
    message: 'Simulate blockchain transactions and network behavior in a safe environment.',
    actions: [
      { label: 'Simulation help', action: 'chat' },
      { label: 'Simulator guide', action: 'docs', url: '/docs/simulator' },
    ],
  },
  '/certificates': {
    title: 'Certificates',
    message: 'View and manage your earned certificates. Share your achievements with the community.',
    actions: [
      { label: 'Certificate questions', action: 'chat' },
      { label: 'Certificate info', action: 'docs', url: '/docs/certificates' },
    ],
  },
};

const defaultHelpContent: HelpContent = {
  title: 'Need Help?',
  message: 'I\'m here to assist you with your Web3 learning journey. Ask me anything!',
  actions: [
    { label: 'Start chatting', action: 'chat' },
    { label: 'Browse documentation', action: 'docs', url: '/docs' },
    { label: 'Report an issue', action: 'report' },
  ],
};

export function HelpBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showBugReport, setShowBugReport] = useState(false);
  const [content, setContent] = useState<HelpContent>(defaultHelpContent);
  const pathname = usePathname();
  const { features } = useGlobal();
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const routeKey = pathname || '/';
    setContent(routeHelpContent[routeKey] || defaultHelpContent);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (action: NonNullable<HelpContent['actions']>[0]) => {
    switch (action.action) {
      case 'chat':
        setShowChat(true);
        break;
      case 'docs':
        if (action.url) {
          window.open(action.url, '_blank');
        }
        break;
      case 'report':
        setShowBugReport(true);
        break;
    }
  };

  if (!features.aiChat) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50" ref={chatRef}>
        <AnimatePresence>
          {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`mb-4 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-[380px] ${
              isMinimized ? 'h-[60px]' : 'h-[500px]'
            }`}
          >
            {!isMinimized ? (
              <>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{content.title}</h3>
                      <p className="text-sm opacity-90">AI Assistant</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsMinimized(true)}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                      >
                        <div className="w-4 h-1 bg-white rounded-full"></div>
                      </button>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 h-[calc(100%-140px)] overflow-y-auto">
                  <div className="mb-4">
                    <p className="text-gray-700">{content.message}</p>
                  </div>

                  {content.actions && content.actions.length > 0 && (
                    <div className="space-y-2">
                      {content.actions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleAction(action)}
                          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <span className="text-sm font-medium text-gray-700">
                            {action.label}
                          </span>
                          {action.action === 'docs' && <ExternalLink className="w-4 h-4 text-gray-500" />}
                          {action.action === 'report' && <Bug className="w-4 h-4 text-gray-500" />}
                          {action.action === 'chat' && <MessageCircle className="w-4 h-4 text-gray-500" />}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Chat Interface */}
                  <div className="mt-6">
                    <div className="bg-gray-50 rounded-lg p-3 h-64 flex items-center justify-center">
                      <div className="text-center">
                        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Chat interface coming soon!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Minimized State */
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">AI Assistant</span>
                </div>
                <button
                  onClick={() => setIsMinimized(false)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <div className="w-4 h-1 bg-white rounded-full"></div>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Bubble Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>
      </div>

      {/* Chat Interface */}
      <ChatInterface
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        context={{ route: pathname }}
      />

      {/* Bug Report */}
      <BugReport
        isOpen={showBugReport}
        onClose={() => setShowBugReport(false)}
        context={{ route: pathname }}
      />
    </>
  );
}
