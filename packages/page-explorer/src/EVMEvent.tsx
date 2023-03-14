// Copyright 2017-2023 @polkadot/app-explorer authors & contributors
// SPDX-License-Identifier: Apache-2.0


import React from 'react';

import { EVMEventDisplay, Expander } from '@polkadot/react-components';
import {EthTransactionStatus} from "@polkadot/types/interfaces";

interface Props {
  className?: string;
  value: EthTransactionStatus;
}

function EVMEvent ({ className = '', value: { transactionIndex, transactionHash, contractAddress, from, to, logs, logsBloom } }: Props): React.ReactElement<Props> {
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
            transactionIndex={transactionIndex}
            contractAddress={contractAddress}
            transactionHash={transactionHash}
            from={from}
            to={to}
            logs={logs}
            logsBloom={logsBloom}
            withExpander
          />
        )
       }
    </Expander>
  );
}

export default React.memo(EVMEvent);
