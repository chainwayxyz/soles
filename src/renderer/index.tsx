import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<App />);

// calling IPC exposed from preload script
window.electron.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron.ipcRenderer.once('get-public-keys', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron.ipcRenderer.once('get-balances', (arg: any) => {
  // eslint-disable-next-line no-console
  console.log(arg);
  if (arg[0].balance === 0) {
    window.electron.ipcRenderer.sendMessage('airdrop-tokens', [arg[0].address]);
  }
});
window.electron.ipcRenderer.once('airdrop-tokens', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron.ipcRenderer.once('transfer-tokens', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron.ipcRenderer.on('log-file-names', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
setTimeout(() => {
  window.electron.ipcRenderer.sendMessage('reset-localnet', []);
}, 20000);
setTimeout(() => {
  console.log('Sending test requests!');
  window.electron.ipcRenderer.sendMessage('get-public-keys', []);
  window.electron.ipcRenderer.sendMessage('get-balances', []);
  // window.electron.ipcRenderer.sendMessage('transfer-tokens', [
  //   {
  //     index: 1,
  //     to: 'AuJgnXJzGeuALyjk4EPYpWsxcWsHiWT6h3iM24m3Wk9Z',
  //     amount: 1,
  //   },
  // ]);
}, 10000);
// window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
