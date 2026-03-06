import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { incidentAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [pagination, setPagination] = useState({ offset: 0, limit: 20 });
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    fetchIncidents();
  }, [filters, pagination, navigate]);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const response = await incidentAPI.list({
        ...filters,
        ...pagination,
      });
      setIncidents(response.data.incidents);
    } catch (error) {
      toast.error('Failed to load incidents');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination({ offset: 0, limit: 20 });
  };

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
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome, {user?.username || 'User'}</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate('/create-incident')}
        >
          Create Incident
        </button>
      </div>

      <div className="filters-section">
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select
          name="priority"
          value={filters.priority}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading incidents...</div>
      ) : incidents.length === 0 ? (
        <div className="empty-state">
          <p>No incidents found</p>
        </div>
      ) : (
        <div className="incidents-table">
          <table>
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assigned To</th>
                <th>Location</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr key={incident.id}>
                  <td className="ticket-number">{incident.ticket_number}</td>
                  <td className="title">{incident.title}</td>
                  <td>{incident.incident_type}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(incident.status)}`}>
                      {incident.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`priority-badge ${getPriorityClass(incident.priority)}`}>
                      {incident.priority}
                    </span>
                  </td>
                  <td>{incident.assigned_to_name || 'Unassigned'}</td>
                  <td>{incident.location}</td>
                  <td className="date">{new Date(incident.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-link"
                      onClick={() => navigate(`/incident/${incident.id}`)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
