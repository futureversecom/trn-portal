// Copyright 2017-2023 @polkadot/app-explorer authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Link } from 'react-router-dom';

import { EVMEventDisplay, Expander } from '@polkadot/react-components';
import { BlockEVMEvents } from '@polkadot/react-hooks/ctx/types';

interface Props {
  className?: string;
  value: BlockEVMEvents;
}

function EVMEvent ({ className = '', value: { blockHash, blockNumber, contractAddress, from, logs, logsBloom, to, transactionHash, transactionIndex } }: Props): React.ReactElement<Props> {
  console.log('blockNumber:::::', blockNumber?.toString());
  console.log('blockHash:::', blockHash?.toString());

  return (
    <Expander
      className={className}
      isLeft
      summary={transactionHash}
    >
      {(
        <EVMEventDisplay
          className='details'
          contractAddress={contractAddress}
          from={from}
          logs={logs}
          logsBloom={logsBloom}
          to={to}
          transactionHash={transactionHash}
          transactionIndex={transactionIndex}
          withExpander
        />
      )
      }
      {blockNumber && (
        <div className='absolute --digits'>
          <Link to={`/explorer/query/${blockHash?.toString() || ''}`}>{blockNumber.toString()}-{transactionIndex?.toString()?.padStart(2, '0')}</Link>
        </div>
      )}
    </Expander>
  );
}

export default React.memo(EVMEvent);
