// Copyright 2017-2023 @polkadot/react-query authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';
import { PalletAssetsAssetAccount } from "@polkadot/types/lookup";
import { Option } from "@polkadot/types";
import React from 'react';

import { useApi, useCall } from '@polkadot/react-hooks';

import FormatBalance from './FormatBalance';

interface Props {
  children?: React.ReactNode;
  className?: string;
  label?: React.ReactNode;
  params?: AccountId | AccountIndex | Address | string | Uint8Array | null;
}

function BalanceFree ({ children, className = '', label, params }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const xrpBalance = useCall<Option<PalletAssetsAssetAccount>>(api.query.assets?.account, [2, params]);
  return (
    <FormatBalance
      className={className}
      label={label}
      value={xrpBalance?.unwrap()?.balance}
    >
      {children}
    </FormatBalance>
  );
}

export default React.memo(BalanceFree);
