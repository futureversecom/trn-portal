// Copyright 2017-2023 @polkadot/app-explorer authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Something is seriously going wrong here...
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import type { Dispatch, SetStateAction } from 'react';
import type { HeaderExtended } from '@polkadot/api-derive/types';
import type { BlockEVMEvent } from '@polkadot/custom/src/types';
import type { KeyedEvent } from '@polkadot/react-hooks/ctx/types';

import React, { useRef } from 'react';

import EVMEvents from '@polkadot/custom/src/components/EVMEvents';
import { useLocalStorage } from '@polkadot/custom/src/hooks/useLocalStorage';
import { Columar, styled, ToggleGroup } from '@polkadot/react-components';

import BlockHeaders from './BlockHeaders.js';
import Events from './Events.js';
import Query from './Query.js';
import Summary from './Summary.js';
import { useTranslation } from './translate.js';

interface Props {
  eventCount: number;
  events: KeyedEvent[];
  evmEvents: BlockEVMEvent[];
  headers: HeaderExtended[];
}

function Main ({ eventCount, events, evmEvents, headers }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [intentIndex, setIntentIndex]: [number, Dispatch<SetStateAction<number>>] = useLocalStorage<number>('explorer:event', 0);

  const intentOptions = useRef([
    { text: t('Substrate Events'), value: 'substrate' },
    { text: t('EVM Events'), value: 'evm' }
  ]);

  return (
    <>
      <Query />
      <Summary eventCount={eventCount} />
      <Columar>
        <Columar.Column>
          <BlockHeaders headers={headers} />
        </Columar.Column>
        <Columar.Column>
          { intentIndex === 0 &&
          <EventsPanel
            events={events}
            label={
              <EventsLabel
                onChange={setIntentIndex}
                options={intentOptions.current}
                value={intentIndex}
              />
            }
          /> }
          { intentIndex === 1 &&
          <EVMEventsPanel
            events={evmEvents}
            label={
              <EventsLabel
                onChange={setIntentIndex}
                options={intentOptions.current}
                value={intentIndex}
              />
            }
          /> }
        </Columar.Column>
      </Columar>
    </>
  );
}

export default React.memo(Main);

const EventsPanel = styled(Events)`
  th {
    padding-top: 0.45rem !important;
    padding-bottom: 0.45rem !important;
  }
`;

const EVMEventsPanel = styled(EVMEvents)`
  th {
    padding-top: 0.45rem !important;
    padding-bottom: 0.45rem !important;
  }
`;

const EventsLabel = styled(ToggleGroup)`
  float: right !important;
  font-size: var(--font-size-small);

  button.hasLabel {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    border: 1px solid var(--ui-highlight);
  }
`;
