/**
 * watsonx Orchestrate Chat Widget (Embedded)
 *
 * Embeds agent chat with custom auth handler
 */

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    wxOConfiguration?: any;
    wxoLoader?: any;
  }
}

export default function OrchestrateChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Configure watsonx Orchestrate with auth handler
    window.wxOConfiguration = {
      orchestrationID: "d1f08545ed6b493887e77d150dae4c98_aeeceae5-bc1a-450b-bf9b-507f284c3f0a",
      hostURL: "https://au-syd.watson-orchestrate.cloud.ibm.com",
      rootElementID: "orchestrate-chat-root",
      deploymentPlatform: "ibmcloud",
      crn: "crn:v1:bluemix:public:watsonx-orchestrate:au-syd:a/d1f08545ed6b493887e77d150dae4c98:aeeceae5-bc1a-450b-bf9b-507f284c3f0a::",
      chatOptions: {
        agentId: "cb3cf0d3-1441-43b6-b8f4-05e08642c936",
        agentEnvironmentId: "28a18158-5812-4155-8894-9c310992020f",

        // Custom auth handler
        customAuthHandler: true,

        // Handle auth token request
        onAuthTokenRequest: async () => {
          // Option A: Return anonymous token (if public access enabled)
          return null;

          // Option B: Get token from your backend
          // const response = await fetch('/api/orchestrate/token');
          // const { token } = await response.json();
          // return token;
        },

        // Disable features that require auth
        enableUserProfile: false,
        enableHistory: false,
      }
    };

    // Load script if not already loaded
    if (!scriptLoaded) {
      const script = document.createElement('script');
      script.src = `${window.wxOConfiguration.hostURL}/wxochat/wxoLoader.js?embed=true`;
      script.async = true;
      script.addEventListener('load', () => {
        setScriptLoaded(true);
        if (window.wxoLoader) {
          window.wxoLoader.init();
        }
      });
      script.addEventListener('error', (e) => {
        console.error('[OrchestrateChat] Failed to load script:', e);
      });
      document.head.appendChild(script);
    } else if (window.wxoLoader) {
      // Re-init if already loaded
      window.wxoLoader.init();
    }

    return () => {
      // Cleanup on close
      if (window.wxoLoader?.destroy) {
        window.wxoLoader.destroy();
      }
    };
  }, [isOpen, scriptLoaded]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Button */}
      <div
        className={`orchestrate-chat-button ${isOpen ? 'is-open' : ''}`}
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        aria-label={isOpen ? 'Close AI Agent' : 'Open AI Agent'}
      >
        <div className="orchestrate-icon">
          {isOpen ? (
            // Close icon
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
            </svg>
          ) : (
            // Chat icon
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 2H4C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM18 14H6V12H18V14ZM18 11H6V9H18V11ZM18 8H6V6H18V8Z" fill="currentColor"/>
            </svg>
          )}
        </div>
      </div>

      {/* Chat Container */}
      {isOpen && (
        <div className="orchestrate-chat-container">
          <div className="orchestrate-chat-header">
            <div className="orchestrate-chat-title">
              <span className="orchestrate-chat-title-text">AI Agent</span>
              <span className="orchestrate-chat-subtitle">Powered by IBM Granite</span>
            </div>
            <button
              className="orchestrate-chat-close"
              onClick={handleToggle}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
          <div id="orchestrate-chat-root" className="orchestrate-chat-content"></div>
        </div>
      )}

      <style>{`
        .orchestrate-chat-button {
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

        .orchestrate-chat-button:hover {
          transform: scale(1.1);
          box-shadow: 0 8px 24px rgba(0, 199, 190, 0.6);
        }

        .orchestrate-chat-button:active {
          transform: scale(0.95);
        }

        .orchestrate-chat-button.is-open {
          background: linear-gradient(135deg, #FF3B30 0%, #FF9500 100%);
        }

        .orchestrate-icon {
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .orchestrate-chat-container {
          position: fixed;
          bottom: 96px;
          right: 24px;
          width: 400px;
          height: 600px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
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

        .orchestrate-chat-header {
          background: linear-gradient(135deg, #00C7BE 0%, #0082FF 100%);
          color: #fff;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .orchestrate-chat-title {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .orchestrate-chat-title-text {
          font-size: 16px;
          font-weight: 600;
        }

        .orchestrate-chat-subtitle {
          font-size: 12px;
          opacity: 0.9;
        }

        .orchestrate-chat-close {
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

        .orchestrate-chat-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .orchestrate-chat-content {
          flex: 1;
          overflow: hidden;
          background: #f5f5f5;
        }

        @media (max-width: 768px) {
          .orchestrate-chat-container {
            bottom: 0;
            right: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 0;
          }

          .orchestrate-chat-button {
            bottom: 16px;
            right: 16px;
            width: 48px;
            height: 48px;
          }

          .orchestrate-icon svg {
            width: 20px;
            height: 20px;
          }
        }
      `}</style>
    </>
  );
}
