const crypto = require('crypto');

const round = (number) => Math.round(number * 10) / 10;

const stats = {
  startedAt: new Date().toISOString(),
  total: 0,
  clientErrors: 0,
  serverErrors: 0,
  totalMs: 0,
  routes: {},
};

function who(req) {
  if (!req.apiKey) return 'none';

  const hash = crypto
    .createHash('sha256')
    .update(req.apiKey)
    .digest('hex');

  return `key-${hash.slice(0, 6)}`;
}

function newRoute() {
  return {
    count: 0,
    clientErrors: 0,
    serverErrors: 0,
    totalMs: 0,
    maxMs: 0,
  };
}

function monitor(req, res, next) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;

    console.log(JSON.stringify({
      time: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ms: round(ms),
      caller: who(req),
    }));

    const route = req.route
      ? req.baseUrl + req.route.path
      : '(no route)';

    const label = `${req.method} ${route}`;
    const routeStats = stats.routes[label] || newRoute();

    stats.routes[label] = routeStats;
    stats.total += 1;
    stats.totalMs += ms;
    routeStats.count += 1;
    routeStats.totalMs += ms;
    routeStats.maxMs = Math.max(routeStats.maxMs, ms);

    if (res.statusCode >= 500) {
      stats.serverErrors += 1;
      routeStats.serverErrors += 1;
    } else if (res.statusCode >= 400) {
      stats.clientErrors += 1;
      routeStats.clientErrors += 1;
    }
  });

  next();
}

function statsHandler(req, res) {
  const routes = {};

  for (const [label, routeStats] of Object.entries(stats.routes)) {
    routes[label] = {
      count: routeStats.count,
      clientErrors: routeStats.clientErrors,
      serverErrors: routeStats.serverErrors,
      avgMs: round(routeStats.totalMs / routeStats.count),
      maxMs: round(routeStats.maxMs),
    };
  }

  const errorRate = stats.total
    ? (stats.serverErrors / stats.total) * 100
    : 0;

  const average = stats.total
    ? stats.totalMs / stats.total
    : 0;

  res.json({
    startedAt: stats.startedAt,
    uptimeSeconds: Math.round(process.uptime()),
    total: stats.total,
    clientErrors: stats.clientErrors,
    serverErrors: stats.serverErrors,
    errorRatePercent: round(errorRate),
    avgMs: round(average),
    routes,
  });
}

module.exports = { monitor, statsHandler };