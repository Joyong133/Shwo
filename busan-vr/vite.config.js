import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

// - base './' : 어떤 경로(https://도메인/ 또는 /하위폴더/)에 배포해도 동작 (PWA·TWA용)
// - basicSsl  : dev/preview 서버를 HTTPS(자체 서명 인증서)로 실행
//               → 같은 Wi-Fi의 휴대폰/Quest 브라우저에서 자이로·WebXR 테스트 가능
//               (NO_HTTPS=1 npm run dev 로 끌 수 있음)
export default defineConfig({
  base: './',
  plugins: process.env.NO_HTTPS ? [] : [basicSsl({ name: 'busan-vr-dev' })],
  server: { host: true, port: 5173, strictPort: false },
  preview: { host: true, port: 4173, strictPort: false },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1600,
  },
});
