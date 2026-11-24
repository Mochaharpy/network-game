import { defineConfig, type ViteDevServer } from 'vite'; 
import { resolve } from 'path';
import type { IncomingMessage, ServerResponse } from 'http';

const cleanDevRoutesPlugin = () => ({
  name: 'clean-dev-routes',
  configureServer(server: ViteDevServer) {
    server.middlewares.use((req: IncomingMessage & { url?: string }, _res: ServerResponse, next: () => void) => { 
      const url = req.url ? req.url.split('?')[0] : '';
      
      if (url === '/host' || url === '/host/' || url === '/host/index.html') {
        req.url = '/src/host/index.html';
      } 
      else if (url === '/controller' || url === '/controller/' || url === '/controller/index.html') {
        req.url = '/src/controller/index.html';
      }
      
      next();
    });
  }
});

export default defineConfig({
  root: './',
  plugins: [cleanDevRoutesPlugin()],
  server: {
    port: 5173,
    proxy: {
      '/games': {
        target: 'http://localhost:8080',
      },
      '/socket.io': {
        target: 'http://localhost:8080',
        ws: true,
      },
      '/api': {
        target: 'http://localhost:8080',
      },
    },
  },
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        host: resolve(__dirname, 'src/host/index.html'),
        controller: resolve(__dirname, 'src/controller/index.html')
      }
    }
  }
});
