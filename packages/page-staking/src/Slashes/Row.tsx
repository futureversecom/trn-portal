// Copyright 2017-2023 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Slash } from './types';

import React, { useCallback } from 'react';

import { AddressMini, AddressSmall, Badge, Checkbox, ExpanderScroll } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';
import { FormatBalance } from '@polkadot/react-query';
import { formatNumber } from '@polkadot/util';

import { useTranslation } from '../translate';

interface Props {
  index: number;
  isSelected: boolean;
  onSelect?: (index: number) => void;
  slash: Slash;
}

function Row ({ index, isSelected, onSelect, slash: { era, isMine, slash: { others, own, payout, reporters, validator }, total, totalOther } }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();

  const _onSelect = useCallback(
    () => onSelect && onSelect(index),
    [index, onSelect]
  );

  const renderOthers = useCallback(
    () => others.map(([accountId, balance], index): React.ReactNode => (
      <AddressMini
        balance={balance}
        key={index}
        value={accountId}
        withBalance
      />
    )),
    [others]
  );

  return (
    <tr>
      <td className='badge'>
        {isMine && (
          <Badge
            color='red'
            icon='skull-crossbones'
          />
        )}
      </td>
      <td className='address'>
        <AddressSmall value={validator} />
      </td>
      <td className='expand all'>
        {!!others.length && (
          <ExpanderScroll
            renderChildren={renderOthers}
            summary={t<string>('Nominators ({{count}})', { replace: { count: formatNumber(others.length) } })}
          />
        )}
      </td>
      <td className='address'>
        {reporters.map((reporter, index): React.ReactNode => (
          <AddressMini
            key={index}
            value={reporter}
          />
        ))}
      </td>
      <td className='number together'>
        <FormatBalance value={own} format={[6, "ROOT" ]} />
      </td>
      <td className='number together'>
        <FormatBalance value={totalOther} format={[6, "ROOT" ]}/>
      </td>
      <td className='number together'>
        <FormatBalance value={total} format={[6, "ROOT" ]}/>
      </td>
      <td className='number together'>
        <FormatBalance value={payout} format={[6, "ROOT" ]}/>
      </td>
      {!api.query.staking.earliestUnappliedSlash && !!api.consts.staking.slashDeferDuration && (
        <td className='number together'>
          {formatNumber(era)}
        </td>
      )}
      <td>
        <Checkbox
          isDisabled={!onSelect}
          onChange={_onSelect}
          value={isSelected}
        />
      </td>
    </tr>
  );
}

export default React.memo(Row);
