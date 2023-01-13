import { exec } from 'promisify-child-process';

// eslint-disable-next-line import/prefer-default-export
export const fetchBalances = async (pubKeys: any) => {
  const balances: { address: string; balance: string }[] = [];
  for (let i = 0; i < pubKeys.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop, promise/always-return
    await exec(`solana balance ${pubKeys[i]}`)
      .then(({ stdout }) => {
        // eslint-disable-next-line promise/always-return
        if (stdout) {
          balances.push({
            address: pubKeys[i],
            balance: stdout.toString(),
          });
        }
      })
      .catch((err) => {
        balances.push({
          address: pubKeys[i],
          balance: '0 SOL',
        });
      });
  }
  return balances;
};
