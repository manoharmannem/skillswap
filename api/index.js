import app from "../backend/app.js";

const allowedOrigin =
  process.env.FRONTEND_URL ||
  "https://skillswap-59xb-eeei74mqa-titan-4daf.vercel.app";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
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

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  return app(req, res);
}
