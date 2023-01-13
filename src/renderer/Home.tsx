import { Button, Divider, Grid, Table, Text } from '@geist-ui/core';
import React, { useEffect } from 'react';
import { saveAs } from 'file-saver';
import { LoaderComponent } from 'react-fullscreen-loader';
import 'react-fullscreen-loader/src/loader.css';
import { MdRestartAlt } from 'react-icons/md';
import { BiReset, BiCoin } from 'react-icons/bi';

const delay = (ms: number | undefined) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const mock: any = [];
const mockObj: any = {};

function Home() {
  const [keyPair, setKeyPair] = React.useState<any>([]);
  const [accounts, setAccounts] = React.useState<any>(mock);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [localnet, setLocalnet] = React.useState<any>(mockObj);

  window.electron.ipcRenderer.on('get-all', (arg: any) => {
    const newAccountData = arg.map((account: any, index: number) => {
      return {
        ...account,
        key: '',
        requestTokens: '',
        transferTokens: '',
      };
    });
    setAccounts(newAccountData);
    setLoading(false);
  });

  window.electron.ipcRenderer.on('get-localnet', (arg: any) => {
    setLocalnet(arg);
  });

  window.electron.ipcRenderer.on('get-block-height', (arg: any) => {
    setLocalnet({
      ...localnet,
      blockHeight: arg,
    });
  });

  window.electron.ipcRenderer.on('get-slot', (arg: any) => {
    setLocalnet({
      ...localnet,
      slot: arg,
    });
  });

  window.electron.ipcRenderer.on('get-balances', (arg: any) => {
    const newAccountData = accounts.map((account: any, index: number) => {
      return {
        ...account,
        balance: arg[index].balance,
      };
    });
    setAccounts(newAccountData);
  });

  window.electron.ipcRenderer.on('get-nonces', (arg: any) => {
    const newAccountData = accounts.map((account: any, index: number) => {
      return {
        ...account,
        nonce: arg[index].nonce,
      };
    });
    setAccounts(newAccountData);
  });

  window.electron.ipcRenderer.on('get-keypair', (arg) => {
    const blob = new Blob([JSON.stringify(arg)], {
      type: 'text/plain',
    });
    saveAs(blob, 'keypair.json');
  });

  window.electron.ipcRenderer.on('transfer-tokens', (arg) => {
    console.log(arg);
    // toast!
  });

  window.electron.ipcRenderer.on('airdrop-tokens', (arg) => {
    window.electron.ipcRenderer.sendMessage('get-balances', []);
    setLoading(false);
  });

  window.electron.ipcRenderer.on('reset-localnet', (arg) => {
    setLoading(false);
    window.location.reload();
  });

  const resetHandler = () => {
    window.electron.ipcRenderer.sendMessage('reset-localnet', []);
    setLoading(true);
  };

  const keyAction = (_value: any, _rowData: any, index: any) => {
    const keyHandler = () => {
      window.electron.ipcRenderer.sendMessage('get-keypair', [index]);
    };
    return (
      <Button type="error" auto scale={1 / 3} font="12px" onClick={keyHandler}>
        Get Key Pair
      </Button>
    );
  };

  const requestAction = (_value: any, _rowData: any, index: any) => {
    const keyHandler = () => {
      window.electron.ipcRenderer.sendMessage('airdrop-tokens', [
        _rowData.address,
      ]);
      setLoading(true);
    };
    return (
      <Button type="error" auto scale={1 / 3} font="12px" onClick={keyHandler}>
        Request Token
      </Button>
    );
  };

  const transferAction = (_value: any, _rowData: any, index: any) => {
    const keyHandler = () => {
      // open modal
      // get to and amount
      // toast return value
    };
    return (
      <Button type="error" auto scale={1 / 3} font="12px" onClick={keyHandler}>
        Transfer Tokens
      </Button>
    );
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      await delay(10000);
      window.electron.ipcRenderer.sendMessage('get-localnet', []);
      window.electron.ipcRenderer.sendMessage('get-all', []);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      window.electron.ipcRenderer.sendMessage('get-balances', []);
      window.electron.ipcRenderer.sendMessage('get-nonces', []);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      window.electron.ipcRenderer.sendMessage('get-block-height', []);
      window.electron.ipcRenderer.sendMessage('get-slot', []);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <LoaderComponent
        loading={loading}
        backgroundColor="black"
        loadingColor="white"
      />
      <Grid.Container gap={2} justify="center" alignItems="flex-start">
        <Grid xs={6} height="100px">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <Text p b style={{ margin: 0 }}>
              RPC URL:
            </Text>
            <Text p style={{ margin: 0 }}>
              {localnet?.rpc}
            </Text>
          </div>
        </Grid>
        <Grid xs={6} height="100px">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <Text p b style={{ margin: 0 }}>
              BLOCK HEIGHT:
            </Text>
            <Text p style={{ margin: 0 }}>
              {localnet?.blockHeight}
            </Text>
          </div>
        </Grid>
        <Grid xs={6} height="100px">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <Text p b style={{ margin: 0 }}>
              SLOT:
            </Text>
            <Text p style={{ margin: 0 }}>
              {localnet?.slot}
            </Text>
          </div>
        </Grid>
        <Grid xs={6} height="100px">
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'start',
              width: '100%',
              gap: '5px',
            }}
          >
            <Text
              p
              small
              style={{
                margin: 0,
                textAlign: 'center',
                cursor: 'pointer',
                lineHeight: '0',
              }}
            >
              <BiCoin size={20} />
              <br />
              Airdrop
            </Text>
            <Text
              p
              small
              style={{
                margin: 0,
                textAlign: 'center',
                cursor: 'pointer',
                lineHeight: '0',
              }}
            >
              <MdRestartAlt size={20} />
              <br />
              Restart Localnet
            </Text>
            <Text
              p
              small
              style={{
                margin: 0,
                textAlign: 'center',
                cursor: 'pointer',
                lineHeight: '0',
              }}
              onClick={resetHandler}
            >
              <BiReset size={20} />
              <br />
              Reset Localnet
            </Text>
          </div>
        </Grid>
        <Grid xs={24}>
          <Table data={accounts}>
            <Table.Column prop="index" label="Index" />
            <Table.Column prop="address" label="Address" />
            <Table.Column prop="balance" label="Balance" />
            <Table.Column prop="nonce" label="Nonce" />
            <Table.Column prop="key" label="Key" render={keyAction} />
            <Table.Column
              prop="requst"
              label="Request Tokens"
              render={requestAction}
            />
            <Table.Column
              prop="transfer"
              label="Transfer Tokens"
              render={transferAction}
            />
          </Table>
        </Grid>
      </Grid.Container>
    </>
  );
}

export default Home;
