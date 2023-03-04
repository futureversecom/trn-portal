// eslint-disable-next-line header/header
import { ExternalProvider } from '@ethersproject/providers';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { keyring } from '@polkadot/ui-keyring';
import { useApi } from '@polkadot/react-hooks/useApi';

interface EthereumWallet {
  hasEthereumWallet: boolean;
  connectedAccounts: ConnectedAccount[];
  requestAccounts?: () => Promise<void>
}

export interface ConnectedAccount {
  address: string;
  meta: {
    name: string;
    source: string;
    whenCreated: number;
  };
}

export const STORAGE_KEY = "ETHEREUM_WALLET_ACCOUNTS";


declare global {
  interface Window {
    ethereum: ExternalProvider
  }
}

export const EthereumWalletCtx = React.createContext<EthereumWallet>({
  connectedAccounts: [],
  hasEthereumWallet: !!window?.ethereum
});

interface Props {
  children: React.ReactNode;
}

export function EthereumWalletCtxRoot ({ children }: Props): React.ReactElement<Props> {
  const [connectedAccounts, setConnectedAccounts] = useLocalStorage<ConnectedAccount[]>(
    STORAGE_KEY, []
  );

  const [hasEthereumWallet, setHasEthereumWallet] = useState<boolean>(!!window?.ethereum);
  const { isApiReady } = useApi();


  useEffect(() => {
    setHasEthereumWallet(!!window?.ethereum);
  }, [])

  const requestAccounts = useCallback(async () => {
    try {
      const result = await window?.ethereum?.request?.({
        method: 'wallet_requestPermissions',
        params: [
          { eth_accounts: {} }
        ]
      });

      const accounts = result[0]?.caveats?.[0]?.value as unknown as string[] ?? [];

      setConnectedAccounts(accounts.map((address) => {
        const hex = address.replace("0x", "");
        return {
          address,
          meta: {
            name: `${hex.substring(0, 4)}..${hex.substring(hex.length - 4, hex.length)}`,
            source: "isEthereumWallet",
            whenCreated: Date.now()
          }
        }
      }))
    } catch (error: any) {
      // user reject with 4001, ignore
      if (error?.code === 4001) return;
    }
  }, []);

  useEffect(() => {
    if (!isApiReady) return

    connectedAccounts.forEach(({ address, meta }) => {
      keyring.addExternal(address, meta)
    });

  }, [isApiReady, connectedAccounts])

  return <EthereumWalletCtx.Provider value={{ connectedAccounts, requestAccounts, hasEthereumWallet }}>
    {children}
  </EthereumWalletCtx.Provider>;
}

export function useEthereumWallet (): EthereumWallet {
  return useContext(EthereumWalletCtx);
}
