import app from "../backend/app.js";

function applyCors(req, res) {
  const origin = req.headers.origin;

  if (
    origin &&
    (
      /^https:\/\/skillswap(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(origin) ||
      /^http:\/\/localhost(?::\d+)?$/i.test(origin) ||
      /^http:\/\/127\.0\.0\.1(?::\d+)?$/i.test(origin)
    )
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400");
}

export default function handler(req, res) {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  return app(req, res);
}
