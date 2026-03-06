import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { incidentAPI, userAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState('overview');
  const [incidents, setIncidents] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalIncidents: 0,
    openIncidents: 0,
    closedIncidents: 0,
    criticalIncidents: 0,
    totalUsers: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/dashboard');
      return;
    }

    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all incidents without filters
      const incidentsResponse = await incidentAPI.list({ limit: 1000 });
      const allIncidents = incidentsResponse.data.incidents || [];
      setIncidents(allIncidents);

      // Fetch all users
      const usersResponse = await userAPI.list();
      const allUsers = usersResponse.data.users || [];
      setUsers(allUsers);

      // Calculate stats
      const stats = {
        totalIncidents: allIncidents.length,
        openIncidents: allIncidents.filter(i => i.status === 'open').length,
        closedIncidents: allIncidents.filter(i => i.status === 'closed').length,
        criticalIncidents: allIncidents.filter(i => i.priority === 'critical').length,
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter(u => u.is_active === 1).length
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setSubmittingComment(true);
    try {
      await incidentAPI.addComment(selectedIncident.id, { comment: commentText });
      toast.success('Comment added successfully');
      setCommentText('');
      // Refresh incident details
      await fetchData();
      // Close detail view
      setSelectedIncident(null);
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusChange = async (incidentId, newStatus) => {
    try {
      await incidentAPI.updateStatus(incidentId, { status: newStatus });
      toast.success('Status updated successfully');
      await fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleAssign = async (incidentId, userId) => {
    try {
      await incidentAPI.assign(incidentId, { assigned_to: userId });
      toast.success('Incident assigned successfully');
      await fetchData();
    } catch (error) {
      console.error('Error assigning incident:', error);
      toast.error('Failed to assign incident');
    }
  };

  const getFilteredIncidents = () => {
    return incidents.filter(incident => {
      const statusMatch = filterStatus === 'all' || incident.status === filterStatus;
      const priorityMatch = filterPriority === 'all' || incident.priority === filterPriority;
      return statusMatch && priorityMatch;
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#F44336',
      critical: '#9C27B0'
    };
    return colors[priority] || '#757575';
  };

  const getStatusColor = (status) => {
    const colors = {
      open: '#2196F3',
      in_progress: '#FF9800',
      closed: '#4CAF50'
    };
    return colors[status] || '#757575';
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-loading">Loading admin dashboard...</div>
      </div>
    );
  }

  const filteredIncidents = getFilteredIncidents();

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>System overview and management</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'incidents' ? 'active' : ''}`}
          onClick={() => setActiveTab('incidents')}
        >
          All Incidents
        </button>
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="admin-tab-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Incidents</div>
              <div className="stat-value">{stats.totalIncidents}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Open Incidents</div>
              <div className="stat-value" style={{ color: '#2196F3' }}>{stats.openIncidents}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Closed Incidents</div>
              <div className="stat-value" style={{ color: '#4CAF50' }}>{stats.closedIncidents}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Critical Priority</div>
              <div className="stat-value" style={{ color: '#9C27B0' }}>{stats.criticalIncidents}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{stats.totalUsers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Active Users</div>
              <div className="stat-value" style={{ color: '#4CAF50' }}>{stats.activeUsers}</div>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="overview-section">
            <h3>Incident Status Distribution</h3>
            <div className="status-distribution">
              {['open', 'in_progress', 'closed'].map(status => {
                const count = incidents.filter(i => i.status === status).length;
                const percentage = stats.totalIncidents > 0 ? (count / stats.totalIncidents * 100).toFixed(1) : 0;
                return (
                  <div key={status} className="distribution-item">
                    <div className="distribution-label">{status.replace('_', ' ')}</div>
                    <div className="distribution-bar-container">
                      <div
                        className="distribution-bar"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: getStatusColor(status)
                        }}
                      ></div>
                    </div>
                    <div className="distribution-count">{count} ({percentage}%)</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="overview-section">
            <h3>Incident Priority Distribution</h3>
            <div className="priority-distribution">
              {['low', 'medium', 'high', 'critical'].map(priority => {
                const count = incidents.filter(i => i.priority === priority).length;
                return (
                  <div key={priority} className="priority-badge" style={{ borderLeft: `4px solid ${getPriorityColor(priority)}` }}>
                    <span className="priority-name">{priority}</span>
                    <span className="priority-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* INCIDENTS TAB */}
      {activeTab === 'incidents' && (
        <div className="admin-tab-content">
          <div className="incidents-filters">
            <div className="filter-group">
              <label>Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Priority</label>
              <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="incidents-table-container">
            <table className="incidents-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Type</th>
                  <th>Created By</th>
                  <th>Assigned To</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncidents.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-data">No incidents found</td>
                  </tr>
                ) : (
                  filteredIncidents.map(incident => (
                    <tr key={incident.id}>
                      <td className="ticket-number">{incident.ticket_number}</td>
                      <td className="incident-title">{incident.title}</td>
                      <td>
                        <select
                          className="status-select"
                          value={incident.status}
                          onChange={(e) => handleStatusChange(incident.id, e.target.value)}
                          style={{ borderColor: getStatusColor(incident.status) }}
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td>
                        <span
                          className="priority-badge-inline"
                          style={{ backgroundColor: getPriorityColor(incident.priority) }}
                        >
                          {incident.priority}
                        </span>
                      </td>
                      <td>{incident.incident_type}</td>
                      <td>{incident.created_by_name}</td>
                      <td>
                        <select
                          className="assign-select"
                          value={incident.assigned_to || ''}
                          onChange={(e) => handleAssign(incident.id, e.target.value ? parseInt(e.target.value) : null)}
                        >
                          <option value="">Unassigned</option>
                          {users.map(u => (
                            <option key={u.id} value={u.id}>{u.username}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          className="view-btn"
                          onClick={() => setSelectedIncident(incident)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="admin-tab-content">
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">No users found</td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id}>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge ${u.role}`}>{u.role}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${u.is_active ? 'active' : 'inactive'}`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td>
                        <button className="edit-btn">Edit</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INCIDENT DETAIL MODAL */}
      {selectedIncident && (
        <div className="modal-overlay" onClick={() => setSelectedIncident(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedIncident.ticket_number}</h2>
              <button className="close-btn" onClick={() => setSelectedIncident(null)}>×</button>
            </div>
            <div className="modal-body">
              <h3>{selectedIncident.title}</h3>
              <div className="incident-details">
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <select
                    value={selectedIncident.status}
                    onChange={(e) => {
                      handleStatusChange(selectedIncident.id, e.target.value);
                      setSelectedIncident({ ...selectedIncident, status: e.target.value });
                    }}
                    className="status-select"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Priority:</span>
                  <span
                    className="priority-badge-inline"
                    style={{ backgroundColor: getPriorityColor(selectedIncident.priority) }}
                  >
                    {selectedIncident.priority}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Type:</span>
                  <span>{selectedIncident.incident_type}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Location:</span>
                  <span>{selectedIncident.location}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Created By:</span>
                  <span>{selectedIncident.created_by_name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Assigned To:</span>
                  <select
                    value={selectedIncident.assigned_to || ''}
                    onChange={(e) => {
                      handleAssign(selectedIncident.id, e.target.value ? parseInt(e.target.value) : null);
                      setSelectedIncident({ ...selectedIncident, assigned_to: e.target.value ? parseInt(e.target.value) : null });
                    }}
                    className="assign-select"
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.username}</option>
                    ))}
                  </select>
                </div>
                <div className="detail-row full-width">
                  <span className="detail-label">Description:</span>
                  <p className="description">{selectedIncident.description}</p>
                </div>
              </div>

              {/* COMMENTS SECTION */}
              <div className="comments-section">
                <h4>Comments</h4>
                <div className="comment-input">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    rows="3"
                  ></textarea>
                  <button
                    className="submit-btn"
                    onClick={handleAddComment}
                    disabled={submittingComment}
                  >
                    {submittingComment ? 'Adding...' : 'Add Comment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
