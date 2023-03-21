// Copyright 2017-2023 @polkadot/react-query authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Vec } from '@polkadot/types';
import type {EthTransactionStatus, H256} from '@polkadot/types/interfaces';

import React, { useEffect, useRef, useState } from 'react';

import { Option } from '@polkadot/types';

import { useApi } from '../useApi';
import { useCall } from '../useCall';
import { BlockEVMEvents } from './types';

interface Props {
  children: React.ReactNode;
}

interface PrevHashes {
  txHash: string | null;
  event: string | null;
}

//const DEFAULT_EVENTS: BlockEVMEvents = { evmEventCount: 0, evmEvents: [] };

export const BlockEVMEventsCtx = React.createContext<EthTransactionStatus[]>([]);

function manageEvents (eventsRecords: Vec<EthTransactionStatus>, setState: React.Dispatch<React.SetStateAction<BlockEVMEvents>>): void {
  if (eventsRecords.length) {
    setState(() => ({
      evmEventCount: eventsRecords.length,
      evmEvents: eventsRecords
    }));
  }
}

export function BlockEVMEventsCtxRoot ({ children }: Props): React.ReactElement<Props> {
  const { api, isApiReady } = useApi();
  const [evmEvents, setEVMEvents] = useState<EthTransactionStatus[]>([]);
  const [rawEvents, setRawEvents] = useState<EthTransactionStatus[]>([]);
  const [transactionHashes, setTransactionHashes] = useState<Set<H256>>(new Set());
  const records = useCall<Option<Vec<EthTransactionStatus>>>(isApiReady && api.query.ethereum.currentTransactionStatuses, []);
  // console.log('record::',records);
  // const prevHashes = useRef({ block: null, event: null, txHash: null });
  // let event;
  // if (records && records.isSome) {
  //   events = records?.unwrap().toJSON() as unknown as Vec<EthTransactionStatus>;
  // }
  // const stateEvnts = state.evmEvents;
  // const transactionHashes = events ? new Set(events.map((evt) => evt.transactionHash)) : new Set();
  // const evmRecords = (events && stateEvnts
  //   ? [...events, ...stateEvnts.filter((e) => !transactionHashes.has(e.transactionHash))]
  //   : stateEvnts) as unknown as Vec<EthTransactionStatus>;
  // console.log('mergedEvents::',evmRecords);


  useEffect((): void => {
    const events = records?.unwrap().toJSON() as unknown as Vec<EthTransactionStatus>;
    const txHash = events ? new Set(events.map((evt) => evt.transactionHash)) : new Set([]);
    if (JSON.stringify([...txHash].sort()) != JSON.stringify([...transactionHashes].sort())) {
      setTransactionHashes(txHash);
      setRawEvents(events);
    }
  }, [records]);

  useEffect((): void => {
    // transactionHashes
  //const stateEvnts = state.evmEvents;
    const evmRecords = (rawEvents && evmEvents
      ? [...rawEvents, ...evmEvents.filter((e) => !transactionHashes.has(e.transactionHash))]
      : evmEvents) as unknown as Vec<EthTransactionStatus>;
    console.log('mergedEvents::',evmRecords);
    // mergedEvents && manageEvents(mergedEvents, setState);
    if (evmRecords && evmRecords.length) {
      setEVMEvents(evmRecords);
    }
  }, [rawEvents, transactionHashes]);

  return (
    <BlockEVMEventsCtx.Provider value={evmEvents}>
      {children}
    </BlockEVMEventsCtx.Provider>
  );
}
