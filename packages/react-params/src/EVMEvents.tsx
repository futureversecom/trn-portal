// Copyright 2017-2025 @polkadot/app-explorer authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BlockEVMEvent } from '@polkadot/react-hooks/ctx/types';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { MarkError, Table } from '@polkadot/react-components';

import EVMEvent from './EVMEvent.js';
import { useTranslation } from "./translate.js";

interface Props {
  className?: string;
  error?: Error | null;
  emptyLabel?: React.ReactNode;
  events?: BlockEVMEvent[] | null;
  eventClassName?: string;
  label?: React.ReactNode;
}

function renderEvent (className: string | undefined, event: BlockEVMEvent): React.ReactNode {
  const { blockHash, blockNumber, transactionHash, transactionIndex } = event;

  return (
    <tr
      className={className}
      key={transactionHash?.toString()}
    >
      <td className='overflow relative'>
        <EVMEvent value={event} />
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
      [label || t('recent evm events'), 'start']
    ],
    [label, t]
  );

  return (
    <Table
      className={className}
      empty={emptyLabel || t('No events available')}
      header={header}
    >
      {error
        ? (
          <tr
            className={eventClassName}
            key='error'
          >
            <td><MarkError content={t('Unable to decode the block events. {{error}}', { replace: { error: error.message } })} /></td>
          </tr>
        )
        : events?.map((e) => renderEvent(eventClassName, e))
      }
    </Table>
  );
}

export default React.memo(EVMEvents);
