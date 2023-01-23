// Copyright 2017-2023 @polkadot/react-hooks authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { initializeConnector, useWeb3React } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useCallback, useEffect, useState } from "react";

export const [metaMask, metaMaskHooks] = initializeConnector(
  (actions) =>
    new MetaMask({
      actions,
      options: {
        mustBeMetaMask: true,
      },
    })
);
export const metaMaskConnectors = [metaMask, metaMaskHooks];

const storedAccountAtom = atomWithStorage("metamask_account", '');

export const useMetaMask = () => {
  const wallet = useWeb3React();
  const provider = wallet?.provider;
  const [isMetaMask, setIsMetaMask] = useState<boolean | undefined>();
  const chainId = 3999;

  const [isConnecting, setIsConnecting] = useState(true);
  const [storedAccount, setStoredAccount] = useAtom(storedAccountAtom);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsMetaMask(window.ethereum?.isMetaMask);
  }, []);

  const connectWallet = useCallback(() => {
    metaMask
      .activate(chainId)
      .then(() => setIsConnecting(false));
  }, []);

  const disconnectWallet = useCallback(() => {
    setStoredAccount('');

    if (metaMask?.deactivate) return metaMask.deactivate();

//    if (metaMask?.actions?.resetState) return metaMask.actions.resetState();
  }, [setStoredAccount]);

  // Update stored account
  useEffect(() => {
    if (!wallet?.account || wallet?.account === storedAccount) return;

    setStoredAccount(wallet.account);
  }, [storedAccount, setStoredAccount, wallet?.account]);

  useEffect(() => {
    if (!isMetaMask || typeof isMetaMask === "undefined" || wallet?.isActive)
      return;

    metaMask.connectEagerly().then(() => setIsConnecting(false));
  }, [isMetaMask, wallet?.isActive]);

  // Update connecting state on account change
  useEffect(() => {
    if (!wallet?.account) return;

    setIsConnecting(false);
  }, [wallet?.account]);

  return {
    wallet,
    provider,
    connectWallet,
    disconnectWallet,
    isConnecting,
    isMetaMask,
  };
};
