/* eslint-disable header/header */

import { ExternalProvider } from '@ethersproject/providers';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { useApi } from '@polkadot/react-hooks/useApi';
import { keyring } from '@polkadot/ui-keyring';

import { useLocalStorage } from '../hooks/useLocalStorage';

export interface EthereumWallet {
  hasEthereumWallet: boolean;
  connectedAccounts: string[];
  activeAccount?: string;
  requestAccounts?: () => Promise<void>;
}

export const STORAGE_KEY = 'ETHEREUM_WALLET_ACCOUNTS';

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
  const [connectedAccounts, setConnectedAccounts] = useLocalStorage<string[]>(
    STORAGE_KEY, []
  );
  const [activeAccount, setActiveAccount] = useState<string>();
  const [hasEthereumWallet, setHasEthereumWallet] = useState<boolean>(!!window?.ethereum);
  const { isApiReady } = useApi();

  useEffect(() => {
    setHasEthereumWallet(!!window?.ethereum);
  }, []);

  useEffect(() => {
    if (!connectedAccounts.length || !hasEthereumWallet || !isApiReady) {
      return;
    }

    const handleAccountsChanged = (accounts: string[]) => {
      if (!accounts?.length) {
        return;
      }

      const address = accounts[0];

      setActiveAccount(address);

      if (connectedAccounts.indexOf(address) >= 0) {
        return;
      }

      setConnectedAccounts([...connectedAccounts, address]);
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    window?.ethereum?.request?.({ method: 'eth_accounts' }).then(handleAccountsChanged);
    window?.ethereum?.on?.('accountsChanged', handleAccountsChanged);

    return () => window?.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged);
  }, [connectedAccounts, hasEthereumWallet, isApiReady, setConnectedAccounts]);

  const requestAccounts = useCallback(async () => {
    try {
      const result = await window?.ethereum?.request?.({
        method: 'wallet_requestPermissions',
        params: [
          { eth_accounts: {} }
        ]
      }) as unknown as {caveats: {value: string[]}[]}[];

      const accounts = result[0]?.caveats?.[0]?.value as unknown as string[] ?? [];

      setConnectedAccounts(accounts);
    } catch (error) {
      const { code } = error as { code?: number };

      // user reject with 4001, ignore
      if (code === 4001) {
        return console.info(error);
      }

      console.error(error);
    }
  }, [setConnectedAccounts]);

  useEffect(() => {
    if (!isApiReady) {
      return;
    }

    connectedAccounts.forEach(addAddress);
  }, [isApiReady, connectedAccounts]);

  return <EthereumWalletCtx.Provider value={{ activeAccount, connectedAccounts, hasEthereumWallet, requestAccounts }}>
    {children}
  </EthereumWalletCtx.Provider>;
}

export function useEthereumWallet (): EthereumWallet {
  return useContext(EthereumWalletCtx);
}

function addAddress (address: string) {
  const hex = address.replace('0x', '');
  const meta = {
    // add `isEthereumWallet` to easily target the account
    isEthereumWallet: true,
    // add `isInjected` so the account can show up in `extension` group
    isInjected: true,
    name: `${hex.substring(0, 4)}..${hex.substring(hex.length - 4, hex.length)}`,
    whenCreated: Date.now()
  };

  keyring.addExternal(address, meta);
}
