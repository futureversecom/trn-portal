// Copyright 2017-2023 @polkadot/react-query authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Vec } from '@polkadot/types';
import type { EthTransactionStatus } from '@polkadot/types/interfaces';

// import type { BlockEvents, IndexedEvent, KeyedEvent } from './types';
import React, { useEffect, useRef, useState } from 'react';

import { Option } from '@polkadot/types';
import { stringify, stringToU8a } from '@polkadot/util';
import { xxhashAsHex } from '@polkadot/util-crypto';

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
// const MAX_EVENTS = 75;

export const BlockEVMEventsCtx = React.createContext<BlockEVMEvents>(DEFAULT_EVENTS);

async function manageEvents (api: ApiPromise, prev: PrevHashes, eventsRecords: Vec<EthTransactionStatus>, setState: React.Dispatch<React.SetStateAction<BlockEVMEvents>>): Promise<void> {
  console.log('newEvents:::', eventsRecords);
  const newEventHash = xxhashAsHex(stringToU8a(stringify(eventsRecords)));

  if (newEventHash !== prev.event && eventsRecords.length) {
    prev.event = newEventHash;

    // retrieve the last header, this will map to the current state
    // const header = await api.rpc.chain.getHeader(events.createdAtHash);
    // const blockNumber = header.number.unwrap();
    // const blockHash = header.hash.toHex();

    if (eventsRecords[0].transactionHash.toString() !== prev.txHash) {
      prev.txHash = eventsRecords[0].transactionHash.toString();

      // @ts-ignore
      setState(({ events }) => ({
        evmEventCount: eventsRecords.length,
        evmEvents: eventsRecords
      }));
    }
  } else {
    // setState(({ events }) => ({
    //   eventCount: records.length,
    //   events
    // }));
  }
}

export function BlockEVMEventsCtxRoot ({ children }: Props): React.ReactElement<Props> {
  const { api, isApiReady } = useApi();
  const [state, setState] = useState<BlockEVMEvents>(DEFAULT_EVENTS);
  const records = useCall<Option<Vec<EthTransactionStatus>>>(isApiReady && api.query.ethereum.currentTransactionStatuses);

  console.log('Inside block EVM events ctx root.....', records?.unwrap().toJSON());
  const prevHashes = useRef({ txHash: null, block: null, event: null });
  const evnts = records?.unwrap().toJSON() as unknown as Vec<EthTransactionStatus>;

  useEffect((): void => {
    records && manageEvents(api, prevHashes.current, evnts, setState).catch(console.error);
  }, [api, prevHashes, records, setState]);

  return (
    <BlockEVMEventsCtx.Provider value={state}>
      {children}
    </BlockEVMEventsCtx.Provider>
  );
}
