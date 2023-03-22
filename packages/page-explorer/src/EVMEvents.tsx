// Copyright 2017-2023 @polkadot/app-explorer authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo } from 'react';

import { MarkError, Table } from '@polkadot/react-components';
import { EthTransactionStatus } from '@polkadot/types/interfaces';

import EVMEvent from './EVMEvent';
import { useTranslation } from './translate';

interface Props {
  className?: string;
  error?: Error | null;
  emptyLabel?: React.ReactNode;
  events?: EthTransactionStatus[] | null;
  eventClassName?: string;
  label?: React.ReactNode;
}

function renderEvent (className: string | undefined, ethTransactionStatus: EthTransactionStatus): React.ReactNode {
  const { transactionHash } = ethTransactionStatus;

  return (
    <tr
      className={className}
      key={transactionHash.toString()}
    >
      <td className='overflow relative'>
        <EVMEvent value={ethTransactionStatus} />
      </td>
    </tr>
  );
}

function EVMEvents ({ className = '', emptyLabel, error, eventClassName, events, label }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const header = useMemo<[React.ReactNode?, string?, number?][]>(
    () => [
      [label || t<string>('recent evm events'), 'start']
    ],
    [label, t]
  );

  return (
    <Table
      className={className}
      empty={emptyLabel || t<string>('No events available')}
      header={header}
    >
      {error
        ? (
          <tr
            className={eventClassName}
            key='error'
          >
            <td><MarkError content={t<string>('Unable to decode the block events. {{error}}', { replace: { error: error.message } })} /></td>
          </tr>
        )
        : events && events.map((e) => renderEvent(eventClassName, e))
      }
    </Table>
  );
}

export default React.memo(EVMEvents);
