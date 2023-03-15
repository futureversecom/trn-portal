// Copyright 2017-2023 @polkadot/app-explorer authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { EVMEventDisplay, Expander } from '@polkadot/react-components';
import { EthTransactionStatus } from '@polkadot/types/interfaces';

interface Props {
  className?: string;
  value: EthTransactionStatus;
}

function EVMEvent ({ className = '', value: { contractAddress, from, logs, logsBloom, to, transactionHash, transactionIndex } }: Props): React.ReactElement<Props> {
  // const con = `${event.section}.${event.method}`;

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
    </Expander>
  );
}

export default React.memo(EVMEvent);
