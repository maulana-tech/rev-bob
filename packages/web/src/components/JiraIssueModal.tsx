import { useState, useEffect } from 'react';
import { getJiraStatus, getJiraProjects, createJiraIssue, type CreateJiraIssuePayload, type JiraProject } from '../lib/api';

interface JiraIssueModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultSummary?: string;
    defaultDescription?: string;
}

export default function JiraIssueModal({ isOpen, onClose, defaultSummary = '', defaultDescription = '' }: JiraIssueModalProps) {
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState<JiraProject[]>([]);
    const [configured, setConfigured] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [formData, setFormData] = useState<CreateJiraIssuePayload>({
        project: '',
        summary: defaultSummary,
        description: defaultDescription,
        issuetype: 'Task',
        priority: 'Medium',
    });

    useEffect(() => {
        if (isOpen) {
            loadJiraData();
        }
    }, [isOpen]);

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            summary: defaultSummary,
            description: defaultDescription,
        }));
    }, [defaultSummary, defaultDescription]);

    const loadJiraData = async () => {
        try {
            const status = await getJiraStatus();
            setConfigured(status.configured && status.connected);

            if (status.configured && status.connected) {
                const { projects: projectList } = await getJiraProjects();
                setProjects(projectList);
                if (projectList.length > 0 && !formData.project) {
                    setFormData((prev) => ({ ...prev, project: projectList[0].key }));
                }
            }
        } catch (err) {
            console.error('[Jira] Failed to load data:', err);
            setConfigured(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const issue = await createJiraIssue(formData);
            setSuccess(`Issue created: ${issue.key}`);
            setTimeout(() => {
                onClose();
                setSuccess(null);
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create Jira issue');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content jira-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Create Jira Issue</h2>
                    <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>

                {!configured ? (
                    <div className="jira-not-configured">
                        <div className="jira-warning-icon">⚠️</div>
                        <p>
                            Jira is not configured. Please set <code>JIRA_HOST</code>, <code>JIRA_EMAIL</code>, and{' '}
                            <code>JIRA_API_TOKEN</code> in your environment variables.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="jira-form">
                        <div className="form-group">
                            <label htmlFor="jira-project">Project *</label>
                            <select
                                id="jira-project"
                                value={formData.project}
                                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                                required
                                disabled={loading}
                            >
                                {projects.map((project) => (
                                    <option key={project.key} value={project.key}>
                                        {project.name} ({project.key})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="jira-summary">Summary *</label>
                            <input
                                id="jira-summary"
                                type="text"
                                value={formData.summary}
                                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                placeholder="Brief description of the issue"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="jira-description">Description</label>
                            <textarea
                                id="jira-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Detailed description..."
                                rows={6}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="jira-issuetype">Issue Type</label>
                                <select
                                    id="jira-issuetype"
                                    value={formData.issuetype}
                                    onChange={(e) => setFormData({ ...formData, issuetype: e.target.value })}
                                    disabled={loading}
                                >
                                    <option value="Task">Task</option>
                                    <option value="Bug">Bug</option>
                                    <option value="Story">Story</option>
                                    <option value="Epic">Epic</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="jira-priority">Priority</label>
                                <select
                                    id="jira-priority"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    disabled={loading}
                                >
                                    <option value="Highest">Highest</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                    <option value="Lowest">Lowest</option>
                                </select>
                            </div>
                        </div>

                        {error && <div className="jira-error">{error}</div>}
                        {success && <div className="jira-success">{success}</div>}

                        <div className="modal-actions">
                            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Issue'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
