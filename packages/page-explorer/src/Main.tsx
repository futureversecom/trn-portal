// Copyright 2017-2023 @polkadot/app-explorer authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HeaderExtended } from '@polkadot/api-derive/types';
import type { KeyedEvent } from '@polkadot/react-hooks/ctx/types';

import React from 'react';

import { Columar } from '@polkadot/react-components';

import BlockHeaders from './BlockHeaders';
import Events from './Events';
import Query from './Query';
import Summary from './Summary';
import EVMEvents from "@polkadot/app-explorer/EVMEvents";
import {EthTransactionStatus} from "@polkadot/types/interfaces";

interface Props {
  eventCount: number;
  events: KeyedEvent[];
  headers: HeaderExtended[];
  evmEvents: EthTransactionStatus[]
}

function Main ({ eventCount, events, headers, evmEvents }: Props): React.ReactElement<Props> {
  return (
    <>
      <Query />
      <Summary eventCount={eventCount} />
      <Columar>
        <Columar.Column>
          <BlockHeaders headers={headers} />
        </Columar.Column>
        <Columar.Column>
          <Events events={events} />
          <EVMEvents events={evmEvents}/>
        </Columar.Column>
      </Columar>
    </>
  );
}

export default React.memo(Main);
