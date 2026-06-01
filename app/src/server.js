const http = require('http');
const { randomUUID } = require('crypto');
const client = require('prom-client');

const PORT = process.env.PORT || 3000;
const APP_VERSION = process.env.APP_VERSION || '1.0.0';

const register = new client.Registry();

client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1]
});

const activeRequests = new client.Gauge({
  name: 'http_active_requests',
  help: 'Active HTTP requests'
});

const endpointRequests = new client.Counter({
  name: 'api_endpoint_requests_total',
  help: 'Requests by endpoint',
  labelNames: ['endpoint']
});

register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDuration);
register.registerMetric(activeRequests);
register.registerMetric(endpointRequests);

const projects = new Map();

let ready = false;
const WARMUP_MS = Number(process.env.WARMUP_MS || 6000);

setTimeout(() => {
  ready = true;
  console.log('projects-api is ready to serve traffic');
}, WARMUP_MS);

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(payload);
}

function notFound(res) {
  sendJson(res, 404, { error: 'not_found' });
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve(null);
      }
    });
  });
}

function simulateWork() {
  return new Promise((resolve, reject) => {
    const delay = 20 + Math.floor(Math.random() * 180);
    setTimeout(() => {
      if (Math.random() < 0.03) {
        reject(new Error('downstream_unavailable'));
      } else {
        resolve(delay);
      }
    }, delay);
  });
}

const server = http.createServer(async (req, res) => {
  const start = process.hrtime();
  const { method, url } = req;

  activeRequests.inc();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const duration = diff[0] + diff[1] / 1e9;

    httpRequestsTotal.inc({
      method,
      route: url,
      status: res.statusCode
    });

    httpRequestDuration.observe(
      { method, route: url, status: res.statusCode },
      duration
    );

    endpointRequests.inc({ endpoint: url });

    activeRequests.dec();
  });

  if (url === '/metrics' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': register.contentType });
    return res.end(await register.metrics());
  }

  if (url === '/healthz' && method === 'GET') {
    return sendJson(res, 200, { status: 'ok', version: APP_VERSION });
  }

  if (url === '/ready' && method === 'GET') {
    if (ready) return sendJson(res, 200, { status: 'ready' });
    return sendJson(res, 503, { status: 'warming_up' });
  }

  if (url === '/projects' && method === 'GET') {
    return sendJson(res, 200, { projects: Array.from(projects.values()) });
  }

  if (url === '/projects' && method === 'POST') {
    const body = await readBody(req);
    if (!body || !body.name) {
      return sendJson(res, 400, { error: 'name_required' });
    }

    try {
      await simulateWork();

      const id = randomUUID();
      const project = {
        id,
        name: body.name,
        status: 'open',
        createdAt: new Date().toISOString()
      };

      projects.set(id, project);

      return sendJson(res, 201, project);
    } catch {
      return sendJson(res, 503, { error: 'could_not_create_project' });
    }
  }

  const projectMatch = url.match(/^\/projects\/([^/]+)$/);
  if (projectMatch && method === 'GET') {
    const project = projects.get(projectMatch[1]);
    if (!project) return notFound(res);
    return sendJson(res, 200, project);
  }

  if (url === '/' && method === 'GET') {
    return sendJson(res, 200, {
      service: 'projects-api',
      version: APP_VERSION
    });
  }

  return notFound(res);
});

server.listen(PORT, () => {
  console.log(`projects-api listening on :${PORT} (version ${APP_VERSION})`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down');
  server.close(() => process.exit(0));
});