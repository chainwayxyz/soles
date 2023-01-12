import { exec } from 'promisify-child-process';

export const fetchBalances = async (pubKeys: any) => {
  const balances: { address: string; balance: number }[] = [];
  for (let i = 0; i < pubKeys.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop, promise/always-return
    await exec(`solana balance ${pubKeys[i]}`).then(({ stdout }) => {
      // eslint-disable-next-line promise/always-return
      if (stdout) {
        balances.push({
          address: pubKeys[i],
          balance: parseFloat(stdout.toString()),
        });
      }
    });
  }
  return balances;
};

export const fetchNonces = async (pubKeys: any) => {
  const nonces: { address: string; nonce: string }[] = [];
  for (let i = 0; i < pubKeys.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop, promise/always-return
    await exec(`solana nonce ${pubKeys[i]}`).then(({ stdout }) => {
      // eslint-disable-next-line promise/always-return
      if (stdout) {
        nonces.push({
          address: pubKeys[i],
          nonce: stdout.toString(),
        });
      }
    });
  }

  return nonces;
};
