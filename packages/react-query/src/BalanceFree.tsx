// Copyright 2017-2024 @polkadot/react-query authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { Option } from '@polkadot/types';
import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';
import type { PalletAssetsAssetAccount } from '@polkadot/types/lookup';

import React, { useMemo } from 'react';

import { styled } from '@polkadot/react-components/styled';
import { useApi, useCall } from '@polkadot/react-hooks';
import { formatBalance } from '@polkadot/util';

import FormatBalance from './FormatBalance';

interface Props {
  children?: React.ReactNode;
  className?: string;
  label?: React.ReactNode;
  params?: AccountId | AccountIndex | Address | string | Uint8Array | null;
}

const M_LENGTH = 6 + 1;

function BalanceFree ({ children, className = '', label, params }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const allBalances = useCall<DeriveBalancesAll>(api.derive.balances?.all, [params]);
  const xrpInfo = useCall<Option<PalletAssetsAssetAccount>>(api.query.assets.account, [2, params]);
  const [prefix, postfix, unit] = useMemo(() => {
    const value = xrpInfo?.unwrapOr({ balance: 0 }).balance;
    let unit = 'xrp';
    let [prefix, postfix = '0000'] = formatBalance(value, { decimals: 6, forceUnit: '-', withSi: false }).split('.');

    if (prefix.length > M_LENGTH) {
      [prefix, postfix] = formatBalance(value, { decimals: 6, withUnit: false }).split('.');
      [postfix, unit] = postfix.split(' ');
      unit += 'xrp';
    }

    return [prefix, postfix, unit];
  }, [xrpInfo]);

  return (
    <>
      <FormatBalance
        className={className}
        label={label}
        value={allBalances?.freeBalance}
      >
        {children}
      </FormatBalance>
      &nbsp;/&nbsp;
      <FormatXRP>
        {prefix}.<span className='postfix'>{postfix}</span>
        <span className='unit'> {unit}</span>
      </FormatXRP>
    </>
  );
}

const FormatXRP = styled.span`
  .postfix {
    font-weight: lighter;
    vertical-align: baseline;
  }
  .unit {
    font-size: var(--font-percent-tiny);
    text-transform: uppercase;
  }
`;

export default React.memo(BalanceFree);
