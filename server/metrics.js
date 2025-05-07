const client = require('prom-client');
const express = require('express');
const router = express.Router();

// Collect default system metrics
client.collectDefaultMetrics();

// --- Custom Metrics ---

// Student Count (Gauge)
const studentCount = new client.Gauge({
  name: 'student_records_count',
  help: 'Number of student records maintained'
});

// Request Duration (Histogram)
const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 1.5, 2]
});

// Request Count (Counter)
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'code']
});

// Error Count (Counter)
const httpErrorsTotal = new client.Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP errors (status code >= 400)',
  labelNames: ['method', 'route', 'code']
});

// --- Middleware for capturing request metrics ---
router.use((req, res, next) => {
  const end = httpRequestDurationSeconds.startTimer();
  
  res.on('finish', () => {
    const route = req.route?.path || req.path || 'unknown';
    const code = res.statusCode;

    end({ method: req.method, route, code });
    httpRequestsTotal.inc({ method: req.method, route, code });

    if (code >= 400) {
      httpErrorsTotal.inc({ method: req.method, route, code });
    }
  });

  next();
});

// --- Update student count ---
function updateStudentCount(count) {
  studentCount.set(count);
}

// --- Metrics endpoint ---
router.get('/', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

module.exports = {
  router,
  updateStudentCount
};
