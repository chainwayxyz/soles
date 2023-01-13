import { createRoot } from 'react-dom/client';
import { GeistProvider, CssBaseline } from '@geist-ui/core';
import App from './App';

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(
  <GeistProvider themeType="dark">
    <CssBaseline />
    <App />
  </GeistProvider>
);
