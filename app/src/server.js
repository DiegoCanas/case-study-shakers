const http = require('http');
const { randomUUID } = require('crypto');

const PORT = process.env.PORT || 3000;
const APP_VERSION = process.env.APP_VERSION || '1.0.0';

// In-memory store. No external DB needed to run the challenge.
const projects = new Map();

// App starts "cold" and needs a few seconds before it can serve traffic.
// (Simulates warming up connection pools, caches, etc.)
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

// Simulated variable latency on the create path, plus an occasional failure.
// This gives the observability dashboards something interesting to show.
function simulateWork() {
  return new Promise((resolve, reject) => {
    const delay = 20 + Math.floor(Math.random() * 180); // 20-200ms
    setTimeout(() => {
      // ~3% of create requests fail, to populate error metrics.
      if (Math.random() < 0.03) {
        reject(new Error('downstream_unavailable'));
      } else {
        resolve(delay);
      }
    }, delay);
  });
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        resolve(null);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  // --- Health endpoints (do NOT remove: deployment probes may use these) ---
  if (url === '/healthz' && method === 'GET') {
    return sendJson(res, 200, { status: 'ok', version: APP_VERSION });
  }

  if (url === '/ready' && method === 'GET') {
    if (ready) return sendJson(res, 200, { status: 'ready' });
    return sendJson(res, 503, { status: 'warming_up' });
  }

  // --- Business endpoints ---
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
      const project = { id, name: body.name, status: 'open', createdAt: new Date().toISOString() };
      projects.set(id, project);
      return sendJson(res, 201, project);
    } catch (e) {
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
    return sendJson(res, 200, { service: 'projects-api', version: APP_VERSION });
  }

  return notFound(res);
});

server.listen(PORT, () => {
  console.log(`projects-api listening on :${PORT} (version ${APP_VERSION})`);
});

// Graceful shutdown.
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down');
  server.close(() => process.exit(0));
});
