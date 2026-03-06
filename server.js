require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const authRoutes = require('./routes/auth');
const incidentRoutes = require('./routes/incidents');
const userRoutes = require('./routes/users');
const typesRoutes = require('./routes/types');
const locationsRoutes = require('./routes/locations');

const { requestLogger, errorHandler } = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');
const { initializeEmailService } = require('./services/emailService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use(requestLogger);

app.use('/api/auth', authRoutes);
app.use('/api/incidents', authenticateToken, incidentRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/types', authenticateToken, typesRoutes);
app.use('/api/locations', authenticateToken, locationsRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

initializeEmailService();

app.listen(PORT, () => {
  console.log(`IT Incident Ticketing System running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
