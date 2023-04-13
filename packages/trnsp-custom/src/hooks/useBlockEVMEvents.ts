// Copyright 2017-2023 @polkadot/react-hooks authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext } from 'react';

import { createNamedHook } from '@polkadot/react-hooks';

import { BlockEVMEventsCtx } from '../providers/BlockEVMEvents';
import { BlockEVMEvent } from '../types';

function useBlockEVMEventsImpl (): BlockEVMEvent[] {
  return useContext(BlockEVMEventsCtx);
}

export const useBlockEVMEvents = createNamedHook('useBlockEVMEvents', useBlockEVMEventsImpl);
