// Copyright 2017-2023 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DecodedEvent } from '@polkadot/api-contract/types';
import type { Bytes } from '@polkadot/types';
import type { Event } from '@polkadot/types/interfaces';
import type { Codec } from '@polkadot/types/types';

import React, { useMemo } from 'react';

import Params from '@polkadot/react-params';

import { balanceEvents, balanceEventsOverrides } from './constants';
import Input from './Input';
import { useTranslation } from './translate';
import { getContractAbi } from './util';
import {EthTransactionStatus} from "@polkadot/types/interfaces";
import {Option, u32, Vec} from "@polkadot/types-codec";
import {EthAddress, EthBloom, EthLog} from "@polkadot/types/interfaces/eth/types";
import {H256} from "@polkadot/types/interfaces/runtime";
import {RawParam} from "@polkadot/react-params/types";

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

interface Value {
  isValid: boolean;
  value: Codec;

}

interface AbiEvent extends DecodedEvent {
  values: Value[];
}

function EVMEventDisplay ({ children, className = '', transactionIndex, transactionHash, contractAddress, from, to, logs, logsBloom, withExpander }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  // const names = value.data.names;
  // const params = value.typeDef.map((type, i) => ({
  //   name: (names && names[i]) || undefined,
  //   type
  // }));
  // const values = value.data.map((value) => ({ isValid: true, value }));
  //
  // const overrides = useMemo(
  //   () => eventName && balanceEvents.includes(eventName)
  //     ? balanceEventsOverrides
  //     : undefined,
  //   [eventName]
  // );

  // const abiEvent = useMemo(
  //   (): AbiEvent | null => {
  //     // for contracts, we decode the actual event
  //     if (value.section === 'contracts' && value.method === 'ContractExecution' && value.data.length === 2) {
  //       // see if we have info for this contract
  //       const [accountId, encoded] = value.data;
  //
  //       try {
  //         const abi = getContractAbi(accountId.toString());
  //
  //         if (abi) {
  //           const decoded = abi.decodeEvent(encoded as Bytes);
  //
  //           return {
  //             ...decoded,
  //             values: decoded.args.map((value) => ({ isValid: true, value }))
  //           };
  //         }
  //       } catch (error) {
  //         // ABI mismatch?
  //         console.error(error);
  //       }
  //     }
  //
  //     return null;
  //   },
  //   [value]
  // );

  return (
    <div className={`${className} ui--Event`}>
      {children}
      <Params
        isDisabled
        // overrides={overrides}
        params={[]}
        // registry={value.registry}
        values={[{ isValid: true, value: transactionIndex.toString()}, { isValid: true, value: transactionHash.toString()}, { isValid: true, value: contractAddress.toString()},
          { isValid: true, value: transactionIndex.toString()}, { isValid: true, value: transactionIndex.toString()} ] as RawParam[]}
        withExpander={withExpander}
      >
          <>
            <Input
              isDisabled
              label={t<string>('TransactionHash')}
              value={transactionHash?.toString()}
            />
            <Input
              isDisabled
              label={t<string>('ContractAddress')}
              value={contractAddress?.toString()}
            />
            <Input
              isDisabled
              label={t<string>('To')}
              value={to?.toString()}
            />
            <Input
              isDisabled
              label={t<string>('From')}
              value={from?.toString()}
            />
            <Input
              isDisabled
              label={t<string>('Log')}
              value={JSON.stringify(logs?.toString())}
            />
            <Input
              isDisabled
              label={t<string>('LogsBloom')}
              value={logsBloom?.toString()}
            />
            {/*<Params*/}
            {/*  isDisabled*/}
            {/*  params={abiEvent.event.args}*/}
            {/*  registry={value.registry}*/}
            {/*  values={abiEvent.values}*/}
            {/*/>*/}
          </>

      </Params>
    </div>
  );
}

export default React.memo(EVMEventDisplay);
