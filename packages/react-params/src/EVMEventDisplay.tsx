// Copyright 2017-2025 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RawParam } from './types.js';
import type { EthAddress, EthBloom, EthLog } from '@polkadot/types/interfaces/eth/types';
import type { H256 } from '@polkadot/types/interfaces/runtime';
import type { Option, u32, Vec } from '@polkadot/types-codec';

import React from 'react';

import Params from '@polkadot/react-params';
import { TypeDefInfo } from '@polkadot/types-create/types/types';

export interface Props {
  children?: React.ReactNode;
  className?: string;
  eventName?: string;
  transactionIndex: u32;
  from: EthAddress;
  to: Option<EthAddress>;
  contractAddress: Option<EthAddress>;
  logs: Vec<EthLog>;
  logsBloom: EthBloom;
  transactionHash: H256;
  withExpander?: boolean;
}

function EVMEventDisplay ({ children, className = '', contractAddress, from, logs, logsBloom, to, transactionHash, transactionIndex, withExpander }: Props): React.ReactElement<Props> {
  const values = [{ isValid: true, value: contractAddress },
    { isValid: true, value: from },
    { isValid: true, value: to },
    { isValid: true, value: transactionHash },
    { isValid: true, value: logs },
    { isValid: true, value: logsBloom },
    { isValid: true, value: transactionIndex }
  ];
  const params = [
    { name: 'contractAddress', type: { info: TypeDefInfo.Plain, type: 'EthAddress' } },
    { name: 'from', type: { info: TypeDefInfo.Plain, type: 'EthAddress' } },
    { name: 'to', type: { info: TypeDefInfo.Plain, type: 'EthAddress' } },
    { name: 'transactionHash', type: { info: TypeDefInfo.Plain, type: 'H256' } },
    { name: 'logs', type: { info: TypeDefInfo.Plain, type: 'EthLog1' } },
    { name: 'logsBloom', type: { info: TypeDefInfo.Plain, type: 'EthBloom' } },
    { name: 'transactionIndex', type: { info: TypeDefInfo.Plain, type: 'u32' } }
  ];

  return (
    <div className={`${className} ui--Event`}>
      {children}
      <Params
        isDisabled
        params={params}
        values={values as RawParam[]}
        withExpander={withExpander}
      ></Params>
    </div>
  );
}

export default React.memo(EVMEventDisplay);
