import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { spawn } from 'child_process';
import { readFileSync } from 'fs';

const PORT = 9001;

function devApiServer(): Plugin {
  let apiProcess: ReturnType<typeof spawn> | null = null;
  return {
    name: 'dev-api-server',
    configureServer(server) {
      server.httpServer?.on('listening', () => {
        if (!apiProcess) {
          apiProcess = spawn('node', [resolve(__dirname, 'server.js')], {
            stdio: 'inherit',
            env: {
              ...process.env,
              OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ?? '',
            },
          });
        }
      });
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(
          req.url ?? '',
          `http://localhost:${server.config.server?.port ?? 3000}`,
        );
        if (url.pathname.startsWith('/api/')) {
          const target = `http://localhost:${PORT}${url.pathname}${url.search}`;
          const rawBody = await new Promise<string>((resolve, reject) => {
            let data = '';
            req.on('data', (chunk) => (data += chunk));
            req.on('end', () => resolve(data));
            req.on('error', reject);
          });
          const response = await fetch(target, {
            method: req.method,
            headers: { 'Content-Type': 'application/json' },
            body: rawBody,
          });
          const data = await response.json();
          res.statusCode = response.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        } else {
          next();
        }
      });
    },
    closeBundle() {
      if (apiProcess) {
        apiProcess.kill();
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), devApiServer()],
  base: '/',
  server: {
    port: 3000,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
