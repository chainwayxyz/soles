/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import fs from 'fs';

import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { fetchBalances, fetchNonces } from './handlers';

const { exec, spawn } = require('promisify-child-process');

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

let transactionLogFile: any;
let localnetLogFile: any;

let localnetProcess: any;
let transactionProcess: any;

export const programValue = Date.now();
export const keyPairs: any = [];
export const pubKeys: string[] = [];

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const checkAndDownloadSolanaTools = async () => {
  try {
    await exec(
      `rm -rf ${path.resolve(require('electron').app.getAppPath(), 'logs')}`
    );
  } catch (err) {
    console.log('Log directory already not exists, continuing');
  }

  try {
    await exec(
      `mkdir ${path.resolve(require('electron').app.getAppPath(), 'logs')}`
    );
  } catch (err) {
    console.log('Log directory already exists, continuing');
  }

  await exec(
    `touch ${path.resolve(
      require('electron').app.getAppPath(),
      `logs/localnet-${programValue}.txt`
    )}`
  );
  await exec(
    `touch ${path.resolve(
      require('electron').app.getAppPath(),
      `logs/transaction-${programValue}.txt`
    )}`
  );

  transactionLogFile = fs.createWriteStream(
    path.resolve(
      require('electron').app.getAppPath(),
      `logs/transaction-${programValue}.txt`
    ),
    { flags: 'a' }
  );
  localnetLogFile = fs.createWriteStream(
    path.resolve(
      require('electron').app.getAppPath(),
      `logs/localnet-${programValue}.txt`
    ),
    { flags: 'a' }
  );

  // download solana cli
  await exec(
    'sh -c "$(curl -sSfL https://release.solana.com/v1.14.12/install)"'
  );

  // check if solana --version returns correctly
  const { stdout: solanaVersion } = await exec('solana --version');
  if (!solanaVersion.includes('solana-cli')) {
    // throw err
    throw new Error('Solana CLI not installed correctly');
  }

  // mkdir ~/.soles-config if it doesn't exist
  try {
    await exec('mkdir ~/.solana-config/test-keys');
  } catch (err) {
    console.log('Key directory already exists, continuing');
  }

  // check if test-keys exists in that directory
  const { stdout: testKeys } = await exec('ls ~/.solana-config/test-keys');

  for (let i = 0; i < 5; i += 1) {
    if (!testKeys.includes(`test-keypair${i}.json`)) {
      // generate new and save
      // eslint-disable-next-line no-await-in-loop
      await exec(
        `solana-keygen new --no-passphrase --outfile ~/.solana-config/test-keys/test-keypair${i}.json`
      );
    }
    // add to keyPairs
    // eslint-disable-next-line no-await-in-loop
    const { stdout: testKey } = await exec(
      `cat ~/.solana-config/test-keys/test-keypair${i}.json`
    );
    keyPairs.push(JSON.parse(testKey.toString().split('\n')[0]));

    // eslint-disable-next-line no-await-in-loop
    const { stdout: pubKey } = await exec(
      `solana-keygen pubkey ~/.solana-config/test-keys/test-keypair${i}.json`
    );
    pubKeys.push(pubKey.toString().split('\n')[0]);
  }

  console.log('Starting test validator...');

  // fork new process to run solana localnet, no wait
  const v = spawn('solana-test-validator', [], {});
  v.stdout.pipe(localnetLogFile);

  localnetProcess = v;

  console.log('Test validator has been started.');

  // eslint-disable-next-line no-await-in-loop
  await exec('solana config set --url localhost');

  // sleep 5 seconds to allow localnet to start
  await new Promise((resolve) => setTimeout(resolve, 10000));

  const l = spawn('solana logs', [], {});
  l.stdout.pipe(transactionLogFile);

  transactionProcess = l;

  // send log file names to renderer
  mainWindow?.webContents.send('program-value', programValue);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    checkAndDownloadSolanaTools();
    ipcMain.on('restart-localnet', async (event, _arg) => {
      await transactionProcess.kill('SIGINT');
      await localnetProcess.kill('SIGINT');

      // sleep 5 seconds
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // delete log file and recreate
      await exec(
        `rm ${path.resolve(
          require('electron').app.getAppPath(),
          `logs/localnet-${programValue}.txt`
        )}`
      );
      await exec(
        `touch ${path.resolve(
          require('electron').app.getAppPath(),
          `logs/localnet-${programValue}.txt`
        )}`
      );

      await exec(
        `rm ${path.resolve(
          require('electron').app.getAppPath(),
          `logs/transaction-${programValue}.txt`
        )}`
      );
      await exec(
        `touch ${path.resolve(
          require('electron').app.getAppPath(),
          `logs/transaction-${programValue}.txt`
        )}`
      );

      localnetLogFile = fs.createWriteStream(
        path.resolve(
          require('electron').app.getAppPath(),
          `logs/localnet-${programValue}.txt`
        ),
        { flags: 'a' }
      );
      transactionLogFile = fs.createWriteStream(
        path.resolve(
          require('electron').app.getAppPath(),
          `logs/transaction-${programValue}.txt`
        ),
        { flags: 'a' }
      );

      console.log('Starting new test validator...');
      const v = spawn('solana-test-validator', [], {});
      v.stdout.pipe(localnetLogFile);
      localnetProcess = v;
      console.log('New test validator has been started.');

      // wait 5 seconds to allow localnet to start
      await new Promise((resolve) => setTimeout(resolve, 10000));

      const l = spawn('solana logs', [], {});
      l.stdout.pipe(transactionLogFile);
      transactionProcess = l;

      event.reply('restart-localnet', 'done');
    });

    ipcMain.on('reset-localnet', async (event, _arg) => {
      await transactionProcess.kill('SIGINT');
      await localnetProcess.kill('SIGINT');

      // sleep 5 seconds
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // delete log file and recreate
      await exec(
        `rm ${path.resolve(
          require('electron').app.getAppPath(),
          `logs/localnet-${programValue}.txt`
        )}`
      );
      await exec(
        `touch ${path.resolve(
          require('electron').app.getAppPath(),
          `logs/localnet-${programValue}.txt`
        )}`
      );

      await exec(
        `rm ${path.resolve(
          require('electron').app.getAppPath(),
          `logs/transaction-${programValue}.txt`
        )}`
      );
      await exec(
        `touch ${path.resolve(
          require('electron').app.getAppPath(),
          `logs/transaction-${programValue}.txt`
        )}`
      );

      localnetLogFile = fs.createWriteStream(
        path.resolve(
          require('electron').app.getAppPath(),
          `logs/localnet-${programValue}.txt`
        ),
        { flags: 'a' }
      );
      transactionLogFile = fs.createWriteStream(
        path.resolve(
          require('electron').app.getAppPath(),
          `logs/transaction-${programValue}.txt`
        ),
        { flags: 'a' }
      );

      console.log('Starting new test validator...');
      const v = spawn('solana-test-validator', [], {});
      v.stdout.pipe(localnetLogFile);
      localnetProcess = v;
      console.log('New test validator has been started.');

      // wait 5 seconds to allow localnet to start
      await new Promise((resolve) => setTimeout(resolve, 10000));

      const l = spawn('solana logs', [], {});
      l.stdout.pipe(transactionLogFile);
      transactionProcess = l;

      event.reply('reset-localnet', 'done');
    });

    ipcMain.on('get-public-keys', async (event, _arg) => {
      event.reply('get-public-keys', pubKeys);
    });

    ipcMain.on('get-balances', async (event, _arg) => {
      event.reply('get-balances', await fetchBalances(pubKeys));
    });

    ipcMain.on('get-nonces', async (event, _arg) => {
      event.reply('get-nonces', await fetchNonces(pubKeys));
    });

    ipcMain.on('get-block', async (event, _arg) => {
      const { stdout } = await exec('solana block');
      event.reply('get-block', stdout);
    });

    ipcMain.on('get-block-height', async (event, _arg) => {
      const { stdout } = await exec('solana block-height');
      event.reply('get-block-height', stdout);
    });

    ipcMain.on('get-slot', async (event, _arg) => {
      const { stdout } = await exec('solana slot');
      event.reply('get-slot', stdout);
    });

    ipcMain.on('get-keypair', async (event, arg) => {
      if (arg >= keyPairs.length) event.reply('get-keypair', null);
      event.reply('get-keypair', keyPairs[arg]);
    });

    ipcMain.on('get-nonce', async (event, arg) => {
      const { stdout } = await exec(`solana nonce ${arg}`);
      event.reply('get-nonce', stdout);
    });

    ipcMain.on('transfer-tokens', async (event, arg) => {
      const { stdout } = await exec(
        `solana transfer \
        -k ~/.solana-config/test-keys/test-keypair${arg[0].index}.json \
        ${arg[0].to} ${arg[0].amount} --allow-unfunded-recipient`
      );
      event.reply('transfer-tokens', stdout?.toString().trim().split(':')[1]);
    });

    ipcMain.on('airdrop-tokens', async (event, arg) => {
      await exec(`solana airdrop 10 ${arg}`);
      event.reply('airdrop-tokens', await fetchBalances(pubKeys));
    });
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
