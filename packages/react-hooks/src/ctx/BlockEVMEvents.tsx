// Copyright 2017-2023 @polkadot/react-query authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Vec } from '@polkadot/types';
import type { EthTransactionStatus } from '@polkadot/types/interfaces';

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

const DEFAULT_EVENTS: BlockEVMEvents = { evmEventCount: 0, evmEvents: [] };

export const BlockEVMEventsCtx = React.createContext<BlockEVMEvents>(DEFAULT_EVENTS);

function manageEvents (prev: PrevHashes, eventsRecords: Vec<EthTransactionStatus>, setState: React.Dispatch<React.SetStateAction<BlockEVMEvents>>): void {
  if (eventsRecords.length) {
    setState(() => ({
      evmEventCount: eventsRecords.length,
      evmEvents: eventsRecords
    }));
  }
}

export function BlockEVMEventsCtxRoot ({ children }: Props): React.ReactElement<Props> {
  const { api, isApiReady } = useApi();
  const [state, setState] = useState<BlockEVMEvents>(DEFAULT_EVENTS);
  const records = useCall<Option<Vec<EthTransactionStatus>>>(isApiReady && api.query.ethereum.currentTransactionStatuses, []);

  const prevHashes = useRef({ block: null, event: null, txHash: null });
  const events = records?.unwrap().toJSON() as unknown as Vec<EthTransactionStatus>;
  const stateEvnts = state.evmEvents;

  useEffect((): void => {
    const transactionHashes = events ? new Set(events.map((evt) => evt.transactionHash)) : new Set();
    const mergedEvents = (events && stateEvnts
      ? [...events, ...stateEvnts.filter((e) => !transactionHashes.has(e.transactionHash))]
      : stateEvnts) as unknown as Vec<EthTransactionStatus>;

    records && manageEvents(prevHashes.current, mergedEvents, setState);
  }, [prevHashes, records, setState, events, stateEvnts]);

  return (
    <BlockEVMEventsCtx.Provider value={state}>
      {children}
    </BlockEVMEventsCtx.Provider>
  );
}
