// Copyright 2017-2023 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import Params from '@polkadot/react-params';
import { RawParam } from '@polkadot/react-params/types';
import { EthAddress, EthBloom, EthLog } from '@polkadot/types/interfaces/eth/types';
import { H256 } from '@polkadot/types/interfaces/runtime';
import { Option, u32, Vec } from '@polkadot/types-codec';

import Input from './Input';
import { useTranslation } from './translate';

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
  const { t } = useTranslation();

  return (
    <div className={`${className} ui--Event`}>
      {children}
      <Params
        isDisabled
        // overrides={overrides}
        params={[]}
        // registry={value.registry}
        values={[{ isValid: true, value: transactionIndex.toString() }
          // { isValid: true, value: transactionHash.toString() }, { isValid: true, value: contractAddress.toString() },
          // { isValid: true, value: transactionIndex.toString() }, { isValid: true, value: transactionIndex.toString() }
        ] as RawParam[]}
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
          {(logs.map((log) =>
            <Params
              isDisabled
              key={log.data.toString()}
              // overrides={overrides}
              params={[]}
              // registry={value.registry}
              values={[{ isValid: true, value: `log-${log.data.toString()}` }] as RawParam[]}
              withExpander={withExpander}
            >
              <>
                <Input
                  isDisabled
                  label={t<string>('Address')}
                  value={log.address?.toString()}
                />
                {(log.topics.map((topic, idx) =>
                  <Input
                    isDisabled
                    key={idx}
                    label={t<string>(`topics - ${idx}`)}
                    value={topic?.toString()}
                  />
                ))}
                <Input
                  isDisabled
                  label={t<string>('data')}
                  value={log.data?.toString()}
                />
              </>
            </Params>
          ))
          }
          {/* </Input>*/}
          <Input
            isDisabled
            label={t<string>('LogsBloom')}
            value={logsBloom?.toString()}
          />
          {/* <Params*/}
          {/* isDisabled*/}
          {/* params={transactionHash.toString()}*/}
          {/* // registry={value.registry}*/}
          {/* // values={abiEvent.values}*/}
          {/* />*/}
        </>

      </Params>
    </div>
  );
}

export default React.memo(EVMEventDisplay);
