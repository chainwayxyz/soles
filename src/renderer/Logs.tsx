import { Tabs, Textarea } from '@geist-ui/core';
import LogData from './LogData';

// eslint-disable-next-line react/prop-types
const Logs = ({ log, solanaLog }: { log: LogData; solanaLog: LogData }) => {
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
              height: '75vh',
              width: '100vw',
              fontFamily: 'monospace',
            }}
            value={solanaLog.getLines().join('\n')}
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
              height: '75vh',
              width: '100vw',
              fontFamily: 'monospace',
            }}
            value={log.getLines().join('\n')}
            readOnly
          />
        </Tabs.Item>
      </Tabs>
    </>
  );
};

export default Logs;
