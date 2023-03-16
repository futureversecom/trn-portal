// Copyright 2017-2023 @polkadot/app-explorer authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import EVMEvents from '@polkadot/app-explorer/EVMEvents';
import { styled } from '@polkadot/react-components';
import { useBlockEVMEvents } from '@polkadot/react-hooks/useBlockEVMEvents';

interface Props {
  className?: string;
}

function EVM ({ className }: Props): React.ReactElement<Props> {
  const { evmEventCount, evmEvents } = useBlockEVMEvents();

  console.log('evem Event count::', evmEventCount);
  console.log('evmEvents:::', evmEvents);

  return (
    <StyledDiv className={className}>
      <EVMEvents
        className={className}
        events={evmEvents}
      />
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  .container {
    background: var(--bg-table);
    border: 1px solid var(--border-table);
    border-radius: 0.25rem;
    padding: 1rem 1.5rem;
  }

  .container+.container {
    margin-top: 1rem;
  }
`;

export default React.memo(EVM);
