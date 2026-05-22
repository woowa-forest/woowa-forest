import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// StrictMode 제외: Phaser 이중 마운트 방지
createRoot(document.getElementById('root')!).render(<App />);
