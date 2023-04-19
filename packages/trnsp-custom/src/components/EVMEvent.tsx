// Copyright 2017-2023 @polkadot/app-explorer authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { Expander, styled } from '@polkadot/react-components';

import { BlockEVMEvent } from '../types';
import EVMEventDisplay from './EVMEventDisplay';

interface Props {
  className?: string;
  value: BlockEVMEvent;
}

function EVMEvent ({ className = '', value: { contractAddress, from, logs, logsBloom, to, transactionHash, transactionIndex } }: Props): React.ReactElement<Props> {
  return (
    <CustomExpander
      className={className}
      isLeft
      summary={transactionHash}
      summarySub={ from }
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
    </CustomExpander>
  );
}

export default React.memo(EVMEvent);

const CustomExpander = styled(Expander)`
  .ui--Expander-summary-header {
    max-width: calc(100% - 10rem) !important;
  }
`;
