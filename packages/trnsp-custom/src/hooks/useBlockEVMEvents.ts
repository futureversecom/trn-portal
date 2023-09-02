// Copyright 2017-2023 @polkadot/react-hooks authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BlockEVMEvent } from '../types';

import { useContext } from 'react';

import { createNamedHook } from '@polkadot/react-hooks';

import { BlockEVMEventsCtx } from '../providers/BlockEVMEvents';

function useBlockEVMEventsImpl (): BlockEVMEvent[] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return useContext(BlockEVMEventsCtx);
}

export const useBlockEVMEvents = createNamedHook('useBlockEVMEvents', useBlockEVMEventsImpl);
