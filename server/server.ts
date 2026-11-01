import http, { type IncomingMessage, type ServerResponse } from 'http';
import dotenv from 'dotenv';
import { handleApiRequest, setCorsHeaders } from './api.ts';

dotenv.config();

const PORT = Number(process.env.PORT) || 3001;
const HOST = '0.0.0.0';

const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const handled = await handleApiRequest(req, res);
    if (handled) {
      return;
    }

    // Return JSON 404 response for unknown routes
    setCorsHeaders(req, res);
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'Not Found',
      message: `Cannot ${req.method || 'GET'} ${req.url || '/'}`,
      status: 404,
    }));
  } catch (err: any) {
    console.error('[Server Uncaught Error]:', err);
    if (!res.headersSent) {
      setCorsHeaders(req, res);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'Internal Server Error',
        message: err?.message || 'An unexpected error occurred.',
        status: 500,
      }));
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[CampusConnect API] Server running on http://${HOST}:${PORT}`);
  console.log(`[CampusConnect API] Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.FRONTEND_ORIGIN) {
    console.log(`[CampusConnect API] Allowed Frontend Origin: ${process.env.FRONTEND_ORIGIN}`);
  }
});

export default server;
