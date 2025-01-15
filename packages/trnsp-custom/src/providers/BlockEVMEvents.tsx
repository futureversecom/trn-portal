// Copyright 2017-2025 @polkadot/react-query authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Vec } from '@polkadot/types';
import type { EthTransactionStatus, H256 } from '@polkadot/types/interfaces';

import React, { useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { useApi, useCall } from '@polkadot/react-hooks';
import { Option } from '@polkadot/types';
import { BlockHash } from '@polkadot/types/interfaces/chain';
import { EthTransaction } from '@polkadot/types/interfaces/eth';
import { u32 } from '@polkadot/types-codec';

import { BlockEVMEvent } from '../types';

interface Props {
  children: React.ReactNode;
}

export const BlockEVMEventsCtx = React.createContext<BlockEVMEvent[]>([]);

async function evmDetails (evmRecords: Vec<EthTransactionStatus>, api: ApiPromise): Promise<BlockEVMEvent[]> {
  const evmRecordsUpdated = await Promise.all(
    evmRecords.map(async (e) => {
      const txHash = e.transactionHash;
      const blockDetails: EthTransaction = await api.rpc.eth.getTransactionByHash(txHash) as unknown as EthTransaction;
      const blockNumber = blockDetails.blockNumber as unknown as Option<u32>;
      const blockHash = await api.rpc.chain.getBlockHash(blockNumber.toString()) as unknown as BlockHash;

      return { blockHash, blockNumber, ...e };
    }));

  return evmRecordsUpdated;
}

export function BlockEVMEventsCtxRoot ({ children }: Props): React.ReactElement<Props> {
  const { api, isApiReady } = useApi();
  const [evmEvents, setEVMEvents] = useState<BlockEVMEvent[]>([]);
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
      ? [...rawEvents, ...evmEvents.filter((e) => !transactionHashes.has(e?.transactionHash))]
      : evmEvents) as unknown as Vec<EthTransactionStatus>;

    if (evmRecords && evmRecords.length) {
      evmDetails(evmRecords, api).then((evmRecordsUpdated) => setEVMEvents(evmRecordsUpdated)).catch(console.error);
    }
  }, [api, evmEvents, rawEvents, transactionHashes]);

  return (
    <BlockEVMEventsCtx.Provider value={evmEvents}>
      {children}
    </BlockEVMEventsCtx.Provider>
  );
}
