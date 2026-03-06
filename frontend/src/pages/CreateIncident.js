import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { incidentAPI, typesAPI, locationsAPI, userAPI } from '../services/api';
import '../styles/CreateIncident.css';

const CreateIncident = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    incident_type_id: '',
    location_id: '',
    assigned_to: '',
    priority: 'medium',
  });

  const [types, setTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesRes, locationsRes, usersRes] = await Promise.all([
          typesAPI.list(),
          locationsAPI.list(),
          userAPI.list(),
        ]);

        setTypes(typesRes.data.types);
        setLocations(locationsRes.data.locations);
        setUsers(usersRes.data.users);
      } catch (error) {
        toast.error('Failed to load form data');
        console.error(error);
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        incident_type_id: parseInt(formData.incident_type_id),
        location_id: parseInt(formData.location_id),
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null,
      };

      const response = await incidentAPI.create(payload);
      toast.success('Incident created successfully');
      navigate(`/incident/${response.data.incident.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create incident');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return <div className="loading">Loading form data...</div>;
  }

  return (
    <div className="create-incident-container">
      <div className="create-incident-card">
        <h1>Create New Incident</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief incident title"
              required
              minLength="5"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of the incident"
              required
              minLength="10"
              rows="5"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Incident Type</label>
              <select
                name="incident_type_id"
                value={formData.incident_type_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                {types.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.type_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Location</label>
              <select
                name="location_id"
                value={formData.location_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.location_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label>Assign To (Optional)</label>
              <select
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
              >
                <option value="">Leave Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateIncident;
