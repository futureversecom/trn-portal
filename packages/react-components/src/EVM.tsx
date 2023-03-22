// Copyright 2017-2023 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import Params from '@polkadot/react-params';
import { RawParam } from '@polkadot/react-params/types';
import { EthAddress, EthBloom, EthLog } from '@polkadot/types/interfaces/eth/types';
import { H256 } from '@polkadot/types/interfaces/runtime';
import { Option, u32, Vec } from '@polkadot/types-codec';
import { TypeDefInfo } from "@polkadot/types-create/types/types";

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
    { isValid: true, value: transactionIndex },
  ];
  const params = [
    { name: `contractAddress`,  type: { type: 'EthAddress', info: TypeDefInfo.Plain}},
    { name: `from`, type: {type: 'EthAddress', info: TypeDefInfo.Plain}},
    { name: `to`, type: {type: 'EthAddress', info: TypeDefInfo.Plain}},
    { name: `transactionHash`, type: {type: 'H256', info: TypeDefInfo.Plain}},
    { name: `logs`,  type: { type: 'EthLog1', info: TypeDefInfo.Plain}},
    { name: `logsBloom`, type: { type: 'EthBloom', info: TypeDefInfo.Plain}},
    { name: `transactionIndex`, type: {type: 'u32', info: TypeDefInfo.Plain}}
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
