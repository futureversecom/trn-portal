/* eslint-disable header/header */

// Something is seriously going wrong here...
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import type { ExternalProvider } from '@ethersproject/providers';
import type { Dispatch, SetStateAction } from 'react';
import type { Option } from '@polkadot/types';
import type { Codec } from '@polkadot/types/types';
import type { Keyring } from '@polkadot/ui-keyring';

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
  const [connectedAccounts, setConnectedAccounts]: [string[], Dispatch<SetStateAction<string[]>>] = useLocalStorage<string[]>(
    STORAGE_KEY, []
  );
  const { api, isApiReady } = useApi();
  const [activeAccount, setActiveAccount] = useState<string>();

  const [hasEthereumWallet, setHasEthereumWallet] = useState<boolean>(!!window?.ethereum);

  useEffect(() => {
    setHasEthereumWallet(!!window?.ethereum);
  }, []);

  useEffect(() => {
    if (!connectedAccounts.length || !hasEthereumWallet || !isApiReady) {
      return;
    }

    const handleAccountsChanged = async (accounts: string[]) => {
      if (!accounts?.length) {
        return;
      }

      const address = accounts[0];
      const holder = (await api.query.futurepass.holders(address)) as Option<Codec>;

      if (holder.isSome) {
        addAddress(holder.toString());
      }

      setActiveAccount(address);

      if (connectedAccounts.indexOf(address) >= 0) {
        return;
      }

      setConnectedAccounts([...connectedAccounts, address]);
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
  }, [connectedAccounts, hasEthereumWallet, isApiReady, setConnectedAccounts, api]);

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

  (keyring as unknown as Keyring).addExternal(address, meta);
}
