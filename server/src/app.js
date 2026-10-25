const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { clientUrls } = require('./config/env');
const sanitize = require('./middleware/sanitize');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.set('trust proxy', 1); // needed so rate limiting sees real IPs behind a host's proxy
app.use(helmet());

// CORS: only the configured frontend origin(s) may call the API from a browser.
app.use(
  cors({
    origin(origin, callback) {
      // No origin = tools like Postman or server-to-server calls.
      if (!origin || clientUrls.includes(origin)) return callback(null, true);
      return callback(new Error('Origin not allowed by CORS'));
    },
  })
);

// JSON parsing MUST come before the routes.
app.use(express.json({ limit: '10kb' }));
app.use(sanitize);
app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
