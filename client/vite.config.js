import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  port: 3001,
  server: {
    allowedHosts: [
      '59efc1ec664b.ngrok-free.app', // add your ngrok URL here
      'localhost', // keep localhost
    ],
  },
});
