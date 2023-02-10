// Copyright 2017-2023 @polkadot/react-hooks authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { initializeConnector, useWeb3React } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { useCallback, useEffect, useState } from 'react';

export const [metaMask, metaMaskHooks] = initializeConnector(
  (actions) =>
    new MetaMask({
      actions,
      options: {
        mustBeMetaMask: true
      }
    })
);
export const metaMaskConnectors = [metaMask, metaMaskHooks];

export const useMetaMask = () => {
  const wallet = useWeb3React();
  const provider = wallet?.provider;
  const [isMetaMask, setIsMetaMask] = useState<boolean | undefined>();
  const chainId = metaMaskHooks.useChainId();

  const [isConnecting, setIsConnecting] = useState(true);

  console.log('Is connecting:::', isConnecting);
  console.log('^^^^^^^^^^^');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setIsMetaMask(window.ethereum?.isMetaMask);
  }, []);

  const connectWallet = useCallback(() => {
    metaMask
      .activate(chainId)
      .then(() => {
        console.log('*******'); setIsConnecting(false);
      })
      .catch(console.error);
  }, [chainId]);

  useEffect(() => {
    if (!isMetaMask || typeof isMetaMask === 'undefined' || wallet?.isActive) {
      return;
    }

    metaMask.connectEagerly().then(() => setIsConnecting(false)).catch(console.error);
  }, [isMetaMask, wallet?.isActive]);

  // Update connecting state on account change
  useEffect(() => {
    if (!wallet?.account) {
      return;
    }

    setIsConnecting(false);
  }, [wallet?.account]);

  return {
    connectWallet,
    isConnecting,
    isMetaMask,
    provider,
    wallet
  };
};
