import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// Aquest fitxer s'executa al servidor de Vite (Node), NO al navegador.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ''); // llegeix el fitxer .env

  return {
    plugins: [react()],
    server: {
      proxy: {
        // El navegador demana /api/ia i Vite ho reenvia a Groq posant-hi la clau.
        // Així la clau no arriba mai al navegador.
        '/api/ia': {
          target: 'https://api.groq.com',
          changeOrigin: true,
          rewrite: () => '/openai/v1/chat/completions',
          headers: { Authorization: `Bearer ${env.IA_CLAU}` },
        },
      },
    },
  };
});
