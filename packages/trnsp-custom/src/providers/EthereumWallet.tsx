/* eslint-disable header/header */

import { ExternalProvider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { useApi } from '@polkadot/react-hooks/useApi';
import { Option } from '@polkadot/types';
import { Codec } from '@polkadot/types/types';
import { Keyring, keyring } from '@polkadot/ui-keyring';

import { useLocalStorage } from '../hooks/useLocalStorage';

export interface EthereumWallet {
  hasEthereumWallet: boolean;
  connectedAccounts: string[];
  activeAccount?: { address: string, connected: boolean };
  requestAccounts?: () => Promise<void>;
  removeAccount?: (address: string) => Promise<void>;
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
  const [connectedAccounts, setConnectedAccounts] = useLocalStorage<string[]>('METAMASK_WALLET', []);
  const { api, isApiReady } = useApi();
  const [activeAccount, setActiveAccount] = useState<{address: string, connected: boolean}>();
  const [hasEthereumWallet, setHasEthereumWallet] = useState<boolean>(!!window?.ethereum);

  useEffect(() => {
    setHasEthereumWallet(!!window?.ethereum);
  }, []);

  useEffect(() => {
    if (!connectedAccounts.length || !isApiReady) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    connectedAccounts.forEach(async (account) => {
      await addAccount(api, account);
    });
  }, [connectedAccounts, isApiReady, api]);

  useEffect(() => {
    if (!hasEthereumWallet) {
      return;
    }

    const handleAccountsChange = (accounts: string) => {
      setActiveAccount({ address: ethers.getAddress(accounts[0]), connected: true });
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    window.ethereum.request?.({
      method: 'eth_requestAccounts'
    }).then(handleAccountsChange);

    window.ethereum.on('accountsChanged', handleAccountsChange);

    return () => window.ethereum.removeListener('accountsChanged', handleAccountsChange);
  }, [hasEthereumWallet]);

  const requestAccounts = useCallback(async () => {
    try {
      const [{ caveats: [{ value: accounts }] }] = await window?.ethereum?.request?.({
        method: 'wallet_requestPermissions',
        params: [
          { eth_accounts: {} }
        ]
      }) as unknown as {caveats: {value: string[]}[]}[];

      const accountsToStore: string[] = [];

      for (const account of accounts) {
        const checksum = ethers.getAddress(account);

        if (connectedAccounts.includes(checksum)) {
          continue;
        }

        accountsToStore.push(checksum);
      }

      if (!accountsToStore.length) {
        return;
      }

      setConnectedAccounts([...connectedAccounts, ...accountsToStore]);
    } catch (error) {
      const { code } = error as { code?: number };

      // user reject with 4001, ignore
      if (code === 4001) {
        return console.info(error);
      }

      console.error(error);
    }
  }, [connectedAccounts, setConnectedAccounts]);

  const removeAccount = useCallback(async (address: string) => {
    const remove = (address: string) => {
      const checksum = ethers.getAddress(address);

      (keyring as unknown as Keyring).forgetAccount(checksum);
    };

    const fpAddress = (await api.query.futurepass.holders(address)) as Option<Codec>;

    if (fpAddress.isSome) {
      remove(fpAddress.toString());
    }

    const connectedAccountsIndex = connectedAccounts.indexOf(address);

    if (connectedAccountsIndex < 0) {
      return;
    }

    connectedAccounts.splice(connectedAccountsIndex, 1);

    setConnectedAccounts([...connectedAccounts]);
  }, [api.query.futurepass, connectedAccounts, setConnectedAccounts]);

  return <EthereumWalletCtx.Provider value={{ activeAccount, connectedAccounts, hasEthereumWallet, removeAccount, requestAccounts }}>
    {children}
  </EthereumWalletCtx.Provider>;
}

export function useEthereumWallet (): EthereumWallet {
  return useContext(EthereumWalletCtx);
}

async function addAccount (api: ApiPromise, address: string) {
  const add = (address: string, meta = {}) => {
    const hex = address.replace('0x', '');
    const checksum = ethers.getAddress(address);

    (keyring as unknown as Keyring).addExternal(checksum, {
      // add `isEthereumWallet` to easily target the account
      genesisHash: keyring.genesisHash,
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
