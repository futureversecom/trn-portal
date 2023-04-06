// Copyright 2017-2023 @polkadot/app-explorer authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { MarkError, Table } from '@polkadot/react-components';

import { BlockEVMEvents } from '../types';
import EVMEvent from './EVMEvent';

interface Props {
  className?: string;
  error?: Error | null;
  emptyLabel?: React.ReactNode;
  events?: BlockEVMEvents[] | null;
  eventClassName?: string;
  label?: React.ReactNode;
}

function renderEvent (className: string | undefined, ethTransactionStatus: BlockEVMEvents): React.ReactNode {
  const { blockHash, blockNumber, transactionHash, transactionIndex } = ethTransactionStatus;

  return (
    <tr
      className={className}
      key={transactionHash?.toString()}
    >
      <td className='overflow relative'>
        <EVMEvent value={ethTransactionStatus} />
        {blockNumber && (
          <div className='absolute --digits'>
            <Link to={`/explorer/query/${blockHash?.toString() || ''}`}>{blockNumber.toString()}-{transactionIndex?.toString()?.padStart(2, '0')}</Link>
          </div>
        )}
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
