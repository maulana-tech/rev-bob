/**
 * Simple Chat Interface
 *
 * Chat with watsonx Orchestrate agent via backend proxy
 * Avoids authentication and CORS issues
 */

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function SimpleChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m an AI DevOps analyst powered by IBM watsonx.ai Granite models. I can help you analyze code, identify security issues, and provide recommendations. What would you like me to help with?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Use backend proxy which will fallback to mock
      const response = await fetch('http://localhost:3001/api/orchestrate-proxy/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          sessionId,
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          role: 'assistant',
          content: `Error: ${data.error || 'Failed to get response'}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Floating Button */}
      <div
        className={`simple-chat-button ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        aria-label={isOpen ? 'Close AI Agent' : 'Open AI Agent'}
      >
        <div className="simple-chat-icon">
          {isOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 2H4C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM18 14H6V12H18V14ZM18 11H6V9H18V11ZM18 8H6V6H18V8Z" fill="currentColor"/>
            </svg>
          )}
        </div>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="simple-chat-container">
          {/* Header */}
          <div className="simple-chat-header">
            <div className="simple-chat-title">
              <span className="simple-chat-title-text">AI Agent</span>
              <span className="simple-chat-subtitle">Powered by IBM Granite</span>
            </div>
            <button
              className="simple-chat-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="simple-chat-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`simple-chat-message ${message.role === 'user' ? 'is-user' : 'is-assistant'}`}
              >
                <div className="simple-chat-message-content">
                  {message.content}
                </div>
                <div className="simple-chat-message-time">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="simple-chat-message is-assistant">
                <div className="simple-chat-message-content">
                  <div className="simple-chat-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="simple-chat-input-container">
            <textarea
              className="simple-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your code..."
              rows={1}
              disabled={loading}
            />
            <button
              className="simple-chat-send"
              onClick={handleSend}
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        .simple-chat-button {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #00C7BE 0%, #0082FF 100%);
          border-radius: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0, 199, 190, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 10000;
          user-select: none;
        }

        .simple-chat-button:hover {
          transform: scale(1.1);
          box-shadow: 0 8px 24px rgba(0, 199, 190, 0.6);
        }

        .simple-chat-button.is-open {
          background: linear-gradient(135deg, #FF3B30 0%, #FF9500 100%);
        }

        .simple-chat-icon {
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .simple-chat-container {
          position: fixed;
          bottom: 96px;
          right: 24px;
          width: 400px;
          height: 600px;
          background: #1a1a1a;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 9999;
          animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .simple-chat-header {
          background: linear-gradient(135deg, #00C7BE 0%, #0082FF 100%);
          color: #fff;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .simple-chat-title {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .simple-chat-title-text {
          font-size: 16px;
          font-weight: 600;
        }

        .simple-chat-subtitle {
          font-size: 12px;
          opacity: 0.9;
        }

        .simple-chat-close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: #fff;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          font-size: 24px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .simple-chat-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .simple-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .simple-chat-message {
          display: flex;
          flex-direction: column;
          max-width: 80%;
        }

        .simple-chat-message.is-user {
          align-self: flex-end;
        }

        .simple-chat-message.is-assistant {
          align-self: flex-start;
        }

        .simple-chat-message-content {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .simple-chat-message.is-user .simple-chat-message-content {
          background: linear-gradient(135deg, #00C7BE 0%, #0082FF 100%);
          color: #fff;
        }

        .simple-chat-message.is-assistant .simple-chat-message-content {
          background: #2a2a2a;
          color: #fff;
        }

        .simple-chat-message-time {
          font-size: 11px;
          color: #666;
          margin-top: 4px;
          padding: 0 8px;
        }

        .simple-chat-typing {
          display: flex;
          gap: 4px;
          align-items: center;
          padding: 4px 0;
        }

        .simple-chat-typing span {
          width: 8px;
          height: 8px;
          background: #666;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        .simple-chat-typing span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .simple-chat-typing span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }

        .simple-chat-input-container {
          padding: 16px 20px;
          background: #2a2a2a;
          border-top: 1px solid #333;
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .simple-chat-input {
          flex: 1;
          background: #1a1a1a;
          border: 1px solid #444;
          border-radius: 20px;
          color: #fff;
          font-size: 14px;
          padding: 10px 16px;
          resize: none;
          max-height: 100px;
          font-family: inherit;
        }

        .simple-chat-input:focus {
          outline: none;
          border-color: #00C7BE;
        }

        .simple-chat-input:disabled {
          opacity: 0.5;
        }

        .simple-chat-send {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #00C7BE 0%, #0082FF 100%);
          border: none;
          border-radius: 50%;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .simple-chat-send:hover:not(:disabled) {
          transform: scale(1.1);
        }

        .simple-chat-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .simple-chat-container {
            bottom: 0;
            right: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 0;
          }

          .simple-chat-button {
            bottom: 16px;
            right: 16px;
            width: 48px;
            height: 48px;
          }
        }
      `}</style>
    </>
  );
}
