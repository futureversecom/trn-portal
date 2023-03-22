// Copyright 2017-2023 @polkadot/react-query authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Vec } from '@polkadot/types';
import type { EthTransactionStatus, H256 } from '@polkadot/types/interfaces';

import React, { useEffect, useState } from 'react';

import { Option } from '@polkadot/types';

import { useApi } from '../useApi';
import { useCall } from '../useCall';

interface Props {
  children: React.ReactNode;
}

export const BlockEVMEventsCtx = React.createContext<EthTransactionStatus[]>([]);

export function BlockEVMEventsCtxRoot ({ children }: Props): React.ReactElement<Props> {
  const { api, isApiReady } = useApi();
  const [evmEvents, setEVMEvents] = useState<EthTransactionStatus[]>([]);
  const [rawEvents, setRawEvents] = useState<EthTransactionStatus[]>([]);
  const [transactionHashes, setTransactionHashes] = useState<Set<H256>>(new Set());
  const records = useCall<Option<Vec<EthTransactionStatus>>>(isApiReady && api.query.ethereum.currentTransactionStatuses, []);

  useEffect((): void => {
    const events = records?.unwrap().toJSON() as unknown as Vec<EthTransactionStatus>;

    const txHash = events ? new Set(events.map((evt) => evt.transactionHash)) : new Set([]);

    if (JSON.stringify([...txHash].sort()) !== JSON.stringify([...transactionHashes].sort())) {
      setTransactionHashes(txHash);
      setRawEvents(events);
    }
  }, [records, transactionHashes]);

  useEffect((): void => {
    const evmRecords = (rawEvents && evmEvents
      ? [...rawEvents, ...evmEvents.filter((e) => !transactionHashes.has(e.transactionHash))]
      : evmEvents) as unknown as Vec<EthTransactionStatus>;

    if (evmRecords && evmRecords.length) {
      setEVMEvents(evmRecords);
    }
  }, [evmEvents, rawEvents, transactionHashes]);

  return (
    <BlockEVMEventsCtx.Provider value={evmEvents}>
      {children}
    </BlockEVMEventsCtx.Provider>
  );
}
