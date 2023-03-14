// Copyright 2017-2023 @polkadot/app-explorer authors & contributors
// SPDX-License-Identifier: Apache-2.0


import React, { useMemo } from 'react';

import { MarkError, Table } from '@polkadot/react-components';
import { useTranslation } from './translate';
import {EthTransactionStatus} from "@polkadot/types/interfaces";
import EVMEvent from "./EVMEvent";

interface Props {
  className?: string;
  error?: Error | null;
  emptyLabel?: React.ReactNode;
  events?: EthTransactionStatus[] | null;
  eventClassName?: string;
  label?: React.ReactNode;
}

function renederEvent (className: string | undefined, ethTransactionStatus: EthTransactionStatus): React.ReactNode {
  console.log('Inside reneder event....');
  const {transactionIndex} = ethTransactionStatus;
  return (
    <tr
      className={className}
      key={transactionIndex.toString()}
    >
      <td className='overflow relative'>
        <EVMEvent value={ethTransactionStatus} />
        {/*{blockNumber && (*/}
        {/*  <div className='absolute --digits'>*/}
        {/*    {indexes.length !== 1 && <span>{formatNumber(indexes.length)}x&nbsp;</span>}*/}
        {/*    <Link to={`/explorer/query/${blockHash || ''}`}>{formatNumber(blockNumber)}-{indexes[0].toString().padStart(2, '0')}</Link>*/}
        {/*  </div>*/}
        {/*)}*/}
      </td>
    </tr>
  );
}

function EVMEvents ({ className = '', emptyLabel, error, eventClassName, events, label }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  console.log('events::::::::::::::',events);
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
        : events && events.map((e) => renederEvent(eventClassName, e))
      }
    </Table>
  );
}

export default React.memo(EVMEvents);
