import React, { useEffect } from 'react';
import { Tabs, Textarea } from '@geist-ui/core';
import LogData from './LogData';

const { ipcRenderer } = window?.electron || {
  ipcRenderer: {
    on: () => {},
    sendMessage: () => {},
    once: () => {},
  },
};

// Currently logs are not persisted
// TODO: find a way to persist logs from main to renderer
const Logs = () => {
  const [logData, setLogData] = React.useState<LogData>(new LogData());
  const [newLine, setNewLine] = React.useState<string>('');
  const [lastLine, setLastLine] = React.useState<string>('');

  const [solanaData, setSolanaData] = React.useState<any>(new LogData());
  const [newSolanaLine, setNewSolanaLine] = React.useState<string>('');
  const [lastSolanaLine, setLastSolanaLine] = React.useState<string>('');

  useEffect(() => {
    return ipcRenderer.on('solana-log', (arg: any) => {
      setNewSolanaLine(arg);
    });
  });

  useEffect(() => {
    return ipcRenderer.on('log', (arg: any) => {
      setNewLine(arg);
    });
  });

  useEffect(() => {
    if (newSolanaLine !== lastSolanaLine) {
      solanaData.addLine(lastSolanaLine);
      setSolanaData(solanaData);
      setLastSolanaLine(newSolanaLine);
    }
  }, [lastSolanaLine, solanaData, newSolanaLine, setNewSolanaLine]);

  useEffect(() => {
    if (newLine !== lastLine) {
      logData.addLine(lastLine);
      setLogData(logData);
      setLastLine(newLine);
    }
  }, [lastLine, logData, newLine, setNewLine]);

  return (
    <>
      <Tabs initialValue="0" style={{ width: '100vw', height: '100vh' }}>
        <Tabs.Item
          label="Solana Logs"
          value="0"
          style={{
            height: '100%',
            width: '100%',
            overflow: 'auto',
            backgroundColor: 'black',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
          }}
        >
          <Textarea
            style={{
              height: '100vh',
              width: '100vw',
            }}
            value={solanaData.getLines().join('\n')}
            readOnly
          />
        </Tabs.Item>
        <Tabs.Item
          label="Localnet"
          value="1"
          style={{
            height: '100%',
            width: '100%',
            overflow: 'auto',
            backgroundColor: 'black',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
          }}
        >
          <Textarea
            style={{
              height: '100vh',
              width: '100vw',
            }}
            value={logData.getLines().join('\n')}
            readOnly
          />
        </Tabs.Item>
      </Tabs>
    </>
  );
};

export default Logs;
