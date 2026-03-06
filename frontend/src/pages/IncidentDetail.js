import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { incidentAPI, userAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import '../styles/IncidentDetail.css';

const IncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [incident, setIncident] = useState(null);
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [assignUser, setAssignUser] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incidentRes, usersRes] = await Promise.all([
          incidentAPI.getDetails(id),
          userAPI.list(),
        ]);

        setIncident(incidentRes.data.incident);
        setComments(incidentRes.data.comments);
        setUsers(usersRes.data.users);
      } catch (error) {
        toast.error('Failed to load incident');
        console.error(error);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setActionLoading(true);
    try {
      await incidentAPI.addComment(id, { comment });
      toast.success('Comment added');
      setComment('');
      const updatedIncident = await incidentAPI.getDetails(id);
      setComments(updatedIncident.data.comments);
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignUser) return;

    setActionLoading(true);
    try {
      await incidentAPI.assign(id, { assigned_to: parseInt(assignUser) });
      toast.success('Incident assigned');
      setAssignUser('');
      const updatedIncident = await incidentAPI.getDetails(id);
      setIncident(updatedIncident.data.incident);
    } catch (error) {
      toast.error('Failed to assign incident');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    if (!newStatus) return;

    setActionLoading(true);
    try {
      await incidentAPI.updateStatus(id, { status: newStatus });
      toast.success('Status updated');
      setNewStatus('');
      const updatedIncident = await incidentAPI.getDetails(id);
      setIncident(updatedIncident.data.incident);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseIncident = async (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      toast.error('Please provide resolution notes');
      return;
    }

    setActionLoading(true);
    try {
      await incidentAPI.close(id, { resolution_notes: resolutionNotes });
      toast.success('Incident closed');
      setResolutionNotes('');
      const updatedIncident = await incidentAPI.getDetails(id);
      setIncident(updatedIncident.data.incident);
    } catch (error) {
      toast.error('Failed to close incident');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading incident...</div>;
  }

  if (!incident) {
    return <div className="error">Incident not found</div>;
  }

  const canAssign = user?.role === 'admin' || incident.created_by === user?.id;
  const canClose = user?.role === 'admin' || incident.assigned_to === user?.id || incident.created_by === user?.id;

  const getStatusClass = (status) => {
    const statusMap = {
      open: 'status-open',
      in_progress: 'status-progress',
      resolved: 'status-resolved',
      closed: 'status-closed',
    };
    return statusMap[status] || '';
  };

  const getPriorityClass = (priority) => {
    const priorityMap = {
      low: 'priority-low',
      medium: 'priority-medium',
      high: 'priority-high',
      critical: 'priority-critical',
    };
    return priorityMap[priority] || '';
  };

  return (
    <div className="incident-detail-container">
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <div className="incident-card">
            <div className="incident-header">
              <div>
                <h1>{incident.title}</h1>
                <p className="ticket-info">{incident.ticket_number}</p>
              </div>
              <div className="status-info">
                <span className={`status-badge ${getStatusClass(incident.status)}`}>
                  {incident.status.replace('_', ' ')}
                </span>
                <span className={`priority-badge ${getPriorityClass(incident.priority)}`}>
                  {incident.priority}
                </span>
              </div>
            </div>

            <div className="incident-meta">
              <div className="meta-item">
                <span className="meta-label">Type</span>
                <span className="meta-value">{incident.incident_type}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Location</span>
                <span className="meta-value">{incident.location}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Created By</span>
                <span className="meta-value">{incident.created_by_name}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Assigned To</span>
                <span className="meta-value">{incident.assigned_to_name || 'Unassigned'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Created</span>
                <span className="meta-value">{new Date(incident.created_at).toLocaleString()}</span>
              </div>
              {incident.closed_at && (
                <div className="meta-item">
                  <span className="meta-label">Closed</span>
                  <span className="meta-value">{new Date(incident.closed_at).toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="incident-section">
              <h2>Description</h2>
              <p className="description">{incident.description}</p>
            </div>

            {incident.resolution_notes && (
              <div className="incident-section">
                <h2>Resolution Notes</h2>
                <p className="resolution-notes">{incident.resolution_notes}</p>
              </div>
            )}
          </div>

          <div className="comments-card">
            <h2>Comments</h2>
            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="no-comments">No comments yet</p>
              ) : (
                comments.map((cmt) => (
                  <div key={cmt.id} className="comment-item">
                    <div className="comment-header">
                      <strong>{cmt.username}</strong>
                      <span className="comment-date">
                        {new Date(cmt.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="comment-text">{cmt.comment}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                rows="3"
              />
              <button
                type="submit"
                className="btn-primary"
                disabled={actionLoading}
              >
                Add Comment
              </button>
            </form>
          </div>
        </div>

        <div className="detail-sidebar">
          {canAssign && incident.status !== 'closed' && (
            <div className="action-card">
              <h3>Assign Incident</h3>
              <form onSubmit={handleAssign}>
                <select
                  value={assignUser}
                  onChange={(e) => setAssignUser(e.target.value)}
                  required
                >
                  <option value="">Select user</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={actionLoading}
                >
                  Assign
                </button>
              </form>
            </div>
          )}

          {incident.status !== 'closed' && (
            <div className="action-card">
              <h3>Update Status</h3>
              <form onSubmit={handleStatusChange}>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                >
                  <option value="">Select status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={actionLoading}
                >
                  Update
                </button>
              </form>
            </div>
          )}

          {canClose && incident.status !== 'closed' && (
            <div className="action-card danger">
              <h3>Close Incident</h3>
              <form onSubmit={handleCloseIncident}>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Resolution notes..."
                  rows="4"
                  required
                />
                <button
                  type="submit"
                  className="btn-danger"
                  disabled={actionLoading}
                >
                  Close Incident
                </button>
              </form>
            </div>
          )}

          {incident.status === 'closed' && (
            <div className="action-card success">
              <p className="closed-message">This incident has been closed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentDetail;
