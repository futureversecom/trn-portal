// Copyright 2017-2024 @polkadot/app-assets authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { FrameSystemAccountInfo, PalletAssetsAssetAccount } from '@polkadot/types/lookup';
import type { Option } from '@polkadot/types-codec';

import { useMemo } from 'react';

import { createNamedHook, useAccounts, useApi, useCall } from '@polkadot/react-hooks';
import { BN, BN_ONE } from '@polkadot/util';

interface AccountResult {
  accountId: string;
  account: PalletAssetsAssetAccount;
}

interface Result {
  assetId: BN;
  accounts: AccountResult[];
}

function isOptional (value: PalletAssetsAssetAccount | Option<PalletAssetsAssetAccount>): value is Option<PalletAssetsAssetAccount> {
  return (value as Option<PalletAssetsAssetAccount>).isSome || (value as Option<PalletAssetsAssetAccount>).isNone;
}

const ASSETS_OPTS = {
  transform: ([[params], accounts]: [[[BN, string][]], (PalletAssetsAssetAccount | Option<PalletAssetsAssetAccount>)[]]): Result => ({
    accounts: params
      .map(([, accountId], index) => {
        const o = accounts[index];

        return {
          account: isOptional(o)
            ? o.unwrapOr(null)
            : o,
          accountId
        };
      })
      .filter((a): a is AccountResult =>
        !!a.account &&
        !a.account.balance.isZero()
      ),
    assetId: params[0][0]
  }),
  withParamsTransform: true
};

const BALANCES_OPTS = {
  transform: ([[accountIds], accounts]: [[string[]], FrameSystemAccountInfo[]], api: ApiPromise): Result => ({
    accounts: accounts.map((account, index) => {
      const { data: { feeFrozen, free, miscFrozen } } = account;
      const balance = free.sub(BN.max(feeFrozen, miscFrozen));

      return {
        account: api.registry.createType('PalletAssetsAssetAccount', {
          balance,
          extra: null,
          isFrozen: false,
          reason: null
        }),
        accountId: accountIds[index]
      };
    }).filter((a): a is AccountResult => !!a.account && !a.account.balance.isZero()),
    assetId: BN_ONE
  }),
  withParamsTransform: true
};

function useBalancesImpl (id?: BN | null): AccountResult[] | null {
  const { api } = useApi();
  const { allAccounts } = useAccounts();
  const keys = useMemo(
    () => id ? [allAccounts.map((a) => [id, a])] : [[]],
    [allAccounts, id]
  );
  const isBalances = id?.toString() === '1';

  const balancesQuery = useCall(isBalances && api.query.system.account.multi, [allAccounts], BALANCES_OPTS);
  const assetsQuery = useCall(keys && api.query.assets.account.multi, keys, ASSETS_OPTS);

  return (isBalances
    ? balancesQuery && balancesQuery.accounts
    : assetsQuery && id && (assetsQuery.assetId === id) && assetsQuery.accounts) || null;
}

export default createNamedHook('useBalances', useBalancesImpl);
