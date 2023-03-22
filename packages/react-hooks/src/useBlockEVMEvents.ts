// Copyright 2017-2023 @polkadot/react-hooks authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import type { BlockEvents } from './ctx/types';

import { useContext } from 'react';

import { EthTransactionStatus } from '@polkadot/types/interfaces';

import { BlockEVMEventsCtx } from './ctx/BlockEVMEvents';
// import { BlockEVMEvents } from './ctx/types';
import { createNamedHook } from './createNamedHook';

function useBlockEVMEventsImpl (): EthTransactionStatus[] {
  return useContext(BlockEVMEventsCtx);
}

export const useBlockEVMEvents = createNamedHook('useBlockEVMEvents', useBlockEVMEventsImpl);
