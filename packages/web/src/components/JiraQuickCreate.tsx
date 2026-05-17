/**
 * Jira Quick Create Panel
 *
 * Quick UI for creating Jira issues from agent recommendations
 */

import { useState } from 'react';

interface JiraIssue {
  project: string;
  summary: string;
  description: string;
  issuetype: string;
  priority: string;
}

export default function JiraQuickCreate() {
  const [issue, setIssue] = useState<JiraIssue>({
    project: 'KAN',
    summary: '',
    description: '',
    issuetype: 'Task',
    priority: 'Medium',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!issue.summary.trim()) {
      setResult('❌ Summary is required');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3001/api/jira/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issue),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setResult(`✅ Created: ${data.issue.key}`);
        // Reset form
        setIssue({
          ...issue,
          summary: '',
          description: '',
        });
      } else {
        setResult(`❌ Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="jira-quick-create">
      <h3>Create Jira Issue</h3>

      <div className="jira-form">
        <div className="jira-form-group">
          <label>Project</label>
          <select
            value={issue.project}
            onChange={(e) => setIssue({ ...issue, project: e.target.value })}
          >
            <option value="KAN">KAN - My Team</option>
            <option value="EPL">EPL - Product Launch</option>
          </select>
        </div>

        <div className="jira-form-group">
          <label>Summary *</label>
          <input
            type="text"
            value={issue.summary}
            onChange={(e) => setIssue({ ...issue, summary: e.target.value })}
            placeholder="Brief description of the issue"
          />
        </div>

        <div className="jira-form-group">
          <label>Description</label>
          <textarea
            value={issue.description}
            onChange={(e) => setIssue({ ...issue, description: e.target.value })}
            placeholder="Detailed description, location, recommendations..."
            rows={6}
          />
        </div>

        <div className="jira-form-row">
          <div className="jira-form-group">
            <label>Type</label>
            <select
              value={issue.issuetype}
              onChange={(e) => setIssue({ ...issue, issuetype: e.target.value })}
            >
              <option value="Task">Task</option>
              <option value="Bug">Bug</option>
              <option value="Story">Story</option>
            </select>
          </div>

          <div className="jira-form-group">
            <label>Priority</label>
            <select
              value={issue.priority}
              onChange={(e) => setIssue({ ...issue, priority: e.target.value })}
            >
              <option value="Highest">Highest</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="Lowest">Lowest</option>
            </select>
          </div>
        </div>

        <button
          className="jira-create-button"
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Issue'}
        </button>

        {result && (
          <div className={`jira-result ${result.startsWith('✅') ? 'success' : 'error'}`}>
            {result}
          </div>
        )}
      </div>

      <style>{`
        .jira-quick-create {
          padding: 20px;
          background: var(--bg-secondary, #1a1a1a);
          border-radius: 8px;
          max-width: 600px;
        }

        .jira-quick-create h3 {
          margin: 0 0 20px 0;
          font-size: 18px;
          color: var(--text-primary, #fff);
        }

        .jira-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .jira-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .jira-form-group label {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary, #aaa);
        }

        .jira-form-group input,
        .jira-form-group select,
        .jira-form-group textarea {
          padding: 10px 12px;
          background: var(--bg-primary, #0a0a0a);
          border: 1px solid var(--border-color, #333);
          border-radius: 6px;
          color: var(--text-primary, #fff);
          font-size: 14px;
          font-family: inherit;
        }

        .jira-form-group input:focus,
        .jira-form-group select:focus,
        .jira-form-group textarea:focus {
          outline: none;
          border-color: var(--accent-color, #00C7BE);
        }

        .jira-form-group textarea {
          resize: vertical;
          min-height: 100px;
        }

        .jira-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .jira-create-button {
          padding: 12px 24px;
          background: var(--accent-color, #00C7BE);
          color: #000;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .jira-create-button:hover:not(:disabled) {
          opacity: 0.9;
        }

        .jira-create-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .jira-result {
          padding: 12px;
          border-radius: 6px;
          font-size: 14px;
        }

        .jira-result.success {
          background: rgba(48, 209, 88, 0.1);
          color: #30D158;
          border: 1px solid rgba(48, 209, 88, 0.3);
        }

        .jira-result.error {
          background: rgba(255, 69, 58, 0.1);
          color: #FF453A;
          border: 1px solid rgba(255, 69, 58, 0.3);
        }
      `}</style>
    </div>
  );
}
