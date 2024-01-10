/* eslint-disable header/header */

import { ExternalProvider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { useAccounts } from '@polkadot/react-hooks';
import { useApi } from '@polkadot/react-hooks/useApi';
import { Option } from '@polkadot/types';
import { Codec } from '@polkadot/types/types';
import { Keyring, keyring } from '@polkadot/ui-keyring';

export interface EthereumWallet {
  hasEthereumWallet: boolean;
  connectedAccounts: string[];
  activeAccount?: string;
  requestAccounts?: () => Promise<void>;
}

interface MetaMaskIshProvider extends ExternalProvider {
  on: (event: string, handler: (args: any) => void) => void;
  removeListener: (event: string, handler: (args: any) => void) => void;
}

declare global {
  interface Window {
    ethereum: MetaMaskIshProvider
  }
}

export const EthereumWalletCtx = React.createContext<EthereumWallet>({
  activeAccount: undefined,
  connectedAccounts: [],
  hasEthereumWallet: !!window?.ethereum
});

interface Props {
  children: React.ReactNode;
}

export function EthereumWalletCtxRoot ({ children }: Props): React.ReactElement<Props> {
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);
  const { api, isApiReady } = useApi();
  const [activeAccount, setActiveAccount] = useState<string>();
  const [hasEthereumWallet, setHasEthereumWallet] = useState<boolean>(!!window?.ethereum);
  const { allAccounts } = useAccounts();

  useEffect(() => {
    setHasEthereumWallet(!!window?.ethereum);
  }, []);

  useEffect(() => {
    if (!hasEthereumWallet || !isApiReady) {
      return;
    }

    const handleAccountsChanged = async (accounts: string[]) => {
      const connectedAccounts = keyring.getAccounts().filter((account) => account.meta.isExternal && !account.meta.isProxied).map((account) => account.address);

      const checksumAddresses = accounts.map((address) => ethers.getAddress(address));

      // remove disconnected accounts
      for (const connectedAccount of connectedAccounts) {
        if (checksumAddresses.includes(connectedAccount)) {
          continue;
        }

        await forgetAddress(api, connectedAccount);
      }

      // add connected accounts by extension
      for (const address of checksumAddresses) {
        if (connectedAccounts.includes(address)) {
          continue;
        }

        await addAddress(api, address);
      }

      setConnectedAccounts(checksumAddresses);
      setActiveAccount(checksumAddresses[0]);
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    window?.ethereum?.request?.({ method: 'eth_accounts' }).then(async (acc: string[]) => {
      await handleAccountsChanged(acc);
    });
    window?.ethereum?.on?.('accountsChanged', (acc: string[]) => {
      (async (acc: string[]) => {
        await handleAccountsChanged(acc);
      })(acc).catch(console.log);
    });

    return () => window?.ethereum?.removeListener?.('accountsChanged', (acc: string[]) => {
      (async (acc: string[]) => {
        await handleAccountsChanged(acc);
      })(acc).catch(console.log);
    });
  }, [hasEthereumWallet, isApiReady, api]);

  const requestAccounts = useCallback(async () => {
    try {
      const result = await window?.ethereum?.request?.({
        method: 'wallet_requestPermissions',
        params: [
          { eth_accounts: {} }
        ]
      }) as unknown as {caveats: {value: string[]}[]}[];

      const accounts = result[0]?.caveats?.[0]?.value as unknown as string[] ?? [];

      for (const account of accounts) {
        await addAddress(api, account);
      }
    } catch (error) {
      const { code } = error as { code?: number };

      // user reject with 4001, ignore
      if (code === 4001) {
        return console.info(error);
      }

      console.error(error);
    }
  }, [api]);

  useEffect(() => {
    const accounts = keyring.getAccounts().filter((account) => account.meta.isExternal && !account.meta.isProxied).map((account) => account.address);

    setConnectedAccounts(accounts);
  }, [allAccounts]);

  return <EthereumWalletCtx.Provider value={{ activeAccount, connectedAccounts, hasEthereumWallet, requestAccounts }}>
    {children}
  </EthereumWalletCtx.Provider>;
}

export function useEthereumWallet (): EthereumWallet {
  return useContext(EthereumWalletCtx);
}

async function addAddress (api: ApiPromise, address: string) {
  const add = (address: string, meta = {}) => {
    const hex = address.replace('0x', '');
    const checksum = ethers.getAddress(address);

    (keyring as unknown as Keyring).addExternal(checksum, {
      // add `isEthereumWallet` to easily target the account
      isEthereumWallet: true,
      name: `${hex.substring(0, 4)}..${hex.substring(hex.length - 4, hex.length)}`,
      whenCreated: Date.now(),
      ...meta
    });
  };

  add(address, { isInjected: true });

  const fpAddress = (await api.query.futurepass.holders(address)) as Option<Codec>;

  if (fpAddress.isSome) {
    add(fpAddress.toString(), { isProxied: true });
  }
}

async function forgetAddress (api: ApiPromise, address: string) {
  const remove = (address: string) => {
    const checksum = ethers.getAddress(address);

    (keyring as unknown as Keyring).forgetAccount(checksum);
  };

  remove(address);

  const fpAddress = (await api.query.futurepass.holders(address)) as Option<Codec>;

  if (fpAddress.isSome) {
    remove(fpAddress.toString());
  }
}
