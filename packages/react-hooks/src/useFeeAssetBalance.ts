// Copyright 2017-2025 @polkadot/react-hooks authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Option } from '@polkadot/types';
import type { PalletAssetsAssetAccount } from '@polkadot/types/lookup';
import type { BN } from '@polkadot/util';

import { ethers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';

import { useApi, useCall } from '@polkadot/react-hooks';

export interface FeeAsset {
  assetId: number;
  symbol: string;
  decimals: number;
}

export type ChainSpecName = 'root';

export const feeAssets: Record<ChainSpecName, FeeAsset> = {
  root: {
    assetId: 2,
    decimals: 6,
    symbol: 'XRP'
  }
};

export const useFeeAssetBalance = (accountId?: string | null): [
  FeeAsset,
  BN | null,
  (balance: BN) => string
] => {
  const { api } = useApi();
  const [feeBalance, setFeeBalance] = useState<BN | null>(null);
  const chainName = api.runtimeVersion.specName.toString() as ChainSpecName;
  const feeAsset = feeAssets[chainName];
  const assetsAccount = useCall<Option<PalletAssetsAssetAccount>>(api.query.assets?.account, [feeAsset?.assetId, accountId]);
  const formatBalance = useCallback((balance: BN) => {
    return `${ethers.formatUnits(balance.toString(), feeAsset.decimals)} ${feeAsset.symbol}`;
  }, [feeAsset.decimals, feeAsset.symbol]);

  useEffect(() => {
    if (!assetsAccount) {
      return;
    }

    if (assetsAccount.isSome) {
      const { balance } = assetsAccount.unwrap();

      setFeeBalance(balance);
    }

    if (assetsAccount.isNone) {
      setFeeBalance(api.registry.createType('Balance', 0));
    }
  }, [api, assetsAccount]);

  return [feeAsset, feeBalance, formatBalance];
};
