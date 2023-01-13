import { Button, Grid, Table, Text, useToasts } from '@geist-ui/core';
import React, { useEffect } from 'react';
import { saveAs } from 'file-saver';
import { LoaderComponent } from 'react-fullscreen-loader';
import 'react-fullscreen-loader/src/loader.css';
import { MdRestartAlt } from 'react-icons/md';
import { BiReset, BiCoin } from 'react-icons/bi';
import TransferModal from './TransferModal';
import AirdropModal from './AirdropModal';

const { ipcRenderer } = window?.electron || {
  ipcRenderer: {
    on: () => {},
    sendMessage: () => {},
    once: () => {},
  },
};

const delayFunc = (ms: number | undefined) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const mock: any = [];
const mockObj: any = {};

function Home() {
  const { setToast } = useToasts();
  const [accounts, setAccounts] = React.useState<any>(mock);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [localnet, setLocalnet] = React.useState<any>(mockObj);

  const [isAirdropModalVisible, setIsAirdropModalVisible] =
    React.useState<boolean>(false);

  const [isTransferModalVisible, setIsTransferModalVisible] =
    React.useState<boolean>(false);
  const [transferKey, setTransferKey] = React.useState<number>(0);

  const [toastValue, setToastValue] = React.useState<any>({
    text: '',
    delay: 0,
  });

  ipcRenderer.on('get-all', (arg: any) => {
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

  ipcRenderer.on('get-localnet', (arg: any) => {
    setLocalnet(arg);
  });

  ipcRenderer.on('get-block-height', (arg: any) => {
    setLocalnet({
      ...localnet,
      blockHeight: arg,
    });
  });

  ipcRenderer.on('get-slot', (arg: any) => {
    setLocalnet({
      ...localnet,
      slot: arg,
    });
  });

  ipcRenderer.on('get-balances', (arg: any) => {
    const newAccountData = accounts.map((account: any, index: number) => {
      return {
        ...account,
        balance: arg[index].balance,
      };
    });
    setAccounts(newAccountData);
  });

  ipcRenderer.on('get-keypair', (arg) => {
    const blob = new Blob([JSON.stringify(arg)], {
      type: 'text/plain',
    });
    saveAs(blob, 'keypair.json');
  });

  ipcRenderer.once('transfer-tokens', (arg: any) => {
    setLoading(false);
    setToastValue({ text: arg, delay: 2000 });
  });

  ipcRenderer.once('airdrop-custom-tokens', (arg: any) => {
    setLoading(false);
    setToastValue({ text: arg, delay: 2000 });
  });

  ipcRenderer.on('airdrop-tokens', (arg) => {
    ipcRenderer.sendMessage('get-balances', []);
    setLoading(false);
  });

  ipcRenderer.on('reset-localnet', (arg) => {
    setLoading(false);
    window.location.reload();
  });

  ipcRenderer.on('restart-localnet', (arg) => {
    setLoading(false);
    window.location.reload();
  });

  const resetHandler = () => {
    ipcRenderer.sendMessage('reset-localnet', []);
    setLoading(true);
  };

  const restartHandler = () => {
    ipcRenderer.sendMessage('restart-localnet', []);
    setLoading(true);
  };

  const keyAction = (_value: any, _rowData: any, index: any) => {
    const keyHandler = () => {
      ipcRenderer.sendMessage('get-keypair', [index]);
    };
    return (
      <Button type="error" auto scale={1 / 3} font="12px" onClick={keyHandler}>
        Get Key Pair
      </Button>
    );
  };

  const requestAction = (_value: any, _rowData: any, index: any) => {
    const keyHandler = () => {
      ipcRenderer.sendMessage('airdrop-tokens', [_rowData.address]);
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
      setTransferKey(index);
      setIsTransferModalVisible(true);
    };
    return (
      <Button type="error" auto scale={1 / 3} font="12px" onClick={keyHandler}>
        Transfer Tokens
      </Button>
    );
  };

  const transferHandler = (
    to: string | undefined,
    amount: string | undefined
  ) => {
    setIsTransferModalVisible(false);
    if (!to || !amount) {
      setToast({ text: 'Please enter valid values', delay: 2000 });
      return;
    }
    setLoading(true);
    ipcRenderer.sendMessage('transfer-tokens', [
      {
        index: transferKey,
        to,
        amount,
      },
    ]);
  };

  const airdropHandler = (
    to: string | undefined,
    amount: string | undefined
  ) => {
    setIsAirdropModalVisible(false);
    if (!to || !amount) {
      setToast({ text: 'Please enter valid values', delay: 2000 });
      return;
    }
    setLoading(true);
    ipcRenderer.sendMessage('airdrop-custom-tokens', [
      {
        to,
        amount,
      },
    ]);
  };

  useEffect(() => {
    if (toastValue.text) {
      const { text, delay } = toastValue;
      setToastValue({ text: '', delay: 0 });
      setToast({ text, delay });
    }
  }, [setToast, toastValue]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      await delayFunc(10000);
      ipcRenderer.sendMessage('get-localnet', []);
      ipcRenderer.sendMessage('get-all', []);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      ipcRenderer.sendMessage('get-balances', []);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      ipcRenderer.sendMessage('get-block-height', []);
      ipcRenderer.sendMessage('get-slot', []);
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
      <TransferModal
        isModalVisible={isTransferModalVisible}
        setIsModalVisible={setIsTransferModalVisible}
        onSubmit={transferHandler}
      />
      <AirdropModal
        isModalVisible={isAirdropModalVisible}
        setIsModalVisible={setIsAirdropModalVisible}
        onSubmit={airdropHandler}
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
              onClick={() => setIsAirdropModalVisible(true)}
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
              onClick={restartHandler}
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
