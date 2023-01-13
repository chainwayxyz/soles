import React, { useEffect } from 'react';
import { Grid, Tabs, Text, Textarea } from '@geist-ui/core';

const { ipcRenderer } = window?.electron || {
  ipcRenderer: {
    on: () => {},
    sendMessage: () => {},
    once: () => {},
  },
};

class LogData {
  private data: string[] = [];

  private maxLines: number = 1000;

  // add reverse
  public addLine(line: string) {
    this.data.unshift(line);
    if (this.data.length > this.maxLines) {
      this.data.pop();
    }
  }

  public getLines(): string[] {
    return this.data;
  }
}

const Logs = () => {
  const [logData, setLogData] = React.useState<LogData>(new LogData());
  const [newLine, setNewLine] = React.useState<string>('');
  const [lastLine, setLastLine] = React.useState<string>('');

  const [solanaData, setSolanaData] = React.useState<any>(new LogData());
  const [newSolanaLine, setNewSolanaLine] = React.useState<string>('');
  const [lastSolanaLine, setLastSolanaLine] = React.useState<string>('');

  // ipcRenderer.on('get-program-value', (arg: any) => {
  //   setProgramValue(arg);

  //   // read txt file from ../../logs
  //   const filePath = path.join(__dirname, `../../logs/localnet-${arg}.txt`);
  //   const files = fs.readdirSync(filePath);

  //   console.log(files);

  //   setLoading(false);
  // });

  ipcRenderer.on('solana-log', (arg: any) => {
    setNewSolanaLine(arg);
  });

  useEffect(() => {
    if (newSolanaLine !== lastSolanaLine) {
      solanaData.addLine(lastSolanaLine);
      setSolanaData(solanaData);
      setLastSolanaLine(newSolanaLine);
    }
  }, [lastSolanaLine, solanaData, newSolanaLine, setNewSolanaLine]);

  ipcRenderer.on('log', (arg: any) => {
    setNewLine(arg);
  });

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
